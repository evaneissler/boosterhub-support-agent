import mysql from "mysql2/promise";
import { Index } from "@upstash/vector";
import "dotenv/config";

// --- Upstash client ---
const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

// --- MySQL connection ---
async function getConnection() {
  return mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });
}

// --- Types ---
interface ContactRow {
  ticket_id: string;
  description: string;
  is_reply: number;
  created_at: Date;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface Thread {
  ticket_id: string;
  question: string;
  replies: string[];
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

// --- Pull all resolved customer threads from MySQL ---
async function fetchThreads(connection: mysql.Connection): Promise<Thread[]> {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
    SELECT 
      ticket_id,
      description,
      is_reply,
      created_at,
      email,
      first_name,
      last_name
    FROM contacts_us
    WHERE is_team_ticket = 0
      AND ticket_id IS NOT NULL
      AND ticket_id != ''
      AND description IS NOT NULL
      AND description != ''
    ORDER BY ticket_id, created_at ASC
  `);

  // Group rows into threads by ticket_id
  const threadMap = new Map<string, Thread>();

  for (const row of rows as ContactRow[]) {
    const existing = threadMap.get(row.ticket_id);

    if (!existing) {
      // First message in this thread
      threadMap.set(row.ticket_id, {
        ticket_id: row.ticket_id,
        question: row.is_reply === 0 ? row.description : "",
        replies: row.is_reply === 1 ? [row.description] : [],
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
      });
    } else {
      if (row.is_reply === 0) {
        // Original question (shouldn't happen twice but handle it)
        existing.question = row.description;
      } else {
        existing.replies.push(row.description);
      }
    }
  }

  // Filter out threads with no question or no replies (not useful for RAG)
  return Array.from(threadMap.values()).filter(
    (t) => t.question.trim() !== "" && t.replies.length > 0
  );
}

// --- Build the text we embed for each thread ---
function buildDocumentText(thread: Thread): string {
  const replies = thread.replies.join("\nAgent: ");
  return `Customer: ${thread.question}\nAgent: ${replies}`;
}

// --- Upload to Upstash in batches ---
async function seedUpstash(threads: Thread[]) {
  const BATCH_SIZE = 100; // Upstash recommends batches of 100
  let uploaded = 0;

  for (let i = 0; i < threads.length; i += BATCH_SIZE) {
    const batch = threads.slice(i, i + BATCH_SIZE);

    const vectors = batch.map((thread) => ({
      id: thread.ticket_id,                  // unique ID in Upstash
      data: buildDocumentText(thread),        // text Upstash will embed
      metadata: {
        ticket_id: thread.ticket_id,
        question: thread.question,            // stored so Claude can read it
        answer: thread.replies.join(" | "),   // stored so Claude can read it
        full_thread: buildDocumentText(thread),
        email: thread.email || "",
        first_name: thread.first_name || "",
      },
    }));

    await index.upsert(vectors);

    uploaded += batch.length;
    console.log(`✅ Uploaded ${uploaded} / ${threads.length} threads`);
  }
}

// --- Main ---
async function main() {
  console.log("🔌 Connecting to MySQL...");
  const connection = await getConnection();

  console.log("📦 Fetching threads...");
  const threads = await fetchThreads(connection);
  console.log(`📊 Found ${threads.length} usable threads`);

  await connection.end();

  console.log("🚀 Uploading to Upstash...");
  await seedUpstash(threads);

  console.log("✅ Seed complete!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});