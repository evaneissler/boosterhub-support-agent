/**
 * Evaluation script for the BoosterHub RAG support agent.
 *
 * Runs a golden set of questions through the live endpoint and scores:
 * - Topic coverage: did the answer mention expected keywords?
 * - Hallucination check: did the answer avoid saying things it shouldn't?
 * - "I don't know" rate: does the agent admit uncertainty when appropriate?
 *
 * Run with: npx tsx --env-file=.env.local scripts/eval.ts
 */

const ENDPOINT = process.env.EVAL_ENDPOINT || "http://localhost:3000/api/support";
const API_KEY = process.env.SUPPORT_API_KEY!;

// --- Golden set ---
interface EvalCase {
  id: string;
  question: string;
  expected_topics: string[];   // response should mention at least one of these
  should_not_contain: string[]; // response must NOT contain these (hallucination check)
  notes?: string;
}

const goldenSet: EvalCase[] = [
  {
    id: "qr-001",
    question: "Why are QR codes showing tickets from last year?",
    expected_topics: ["event", "qr", "previous", "year", "duplicate", "ticket"],
    should_not_contain: [],
    notes: "Core product issue — should have strong context match",
  },
  {
    id: "refund-001",
    question: "How do I refund a ticket purchase?",
    expected_topics: ["refund", "payment", "store", "purchase", "contact"],
    should_not_contain: [],
  },
  {
    id: "fundraiser-001",
    question: "How do I set up a fundraiser?",
    expected_topics: ["fundrais", "store", "campaign", "setup", "create"],
    should_not_contain: [],
  },
  {
    id: "volunteer-001",
    question: "How do I manage volunteers for an event?",
    expected_topics: ["volunteer", "event", "sign", "manage", "schedule"],
    should_not_contain: [],
  },
  {
    id: "payment-001",
    question: "What payment methods are supported?",
    expected_topics: ["credit", "card", "payment", "apple", "google", "ach"],
    should_not_contain: [],
  },
  {
    id: "member-001",
    question: "How do I add a new member to my booster club?",
    expected_topics: ["member", "add", "invite", "contact", "club"],
    should_not_contain: [],
  },
  {
    id: "concession-001",
    question: "Can I use BoosterHub for concession sales?",
    expected_topics: ["concession", "sale", "pos", "store", "payment"],
    should_not_contain: [],
  },
  {
    id: "hallucination-001",
    question: "How do I connect BoosterHub to Salesforce CRM?",
    expected_topics: ["contact support", "not sure", "don't have", "unable", "reach out"],
    should_not_contain: ["salesforce integration", "api key", "webhook", "sync automatically"],
    notes: "Hallucination test — Salesforce integration does not exist",
  },
  {
    id: "hallucination-002",
    question: "What is BoosterHub's enterprise pricing per seat?",
    expected_topics: ["contact", "pricing", "reach out", "not sure", "support"],
    should_not_contain: ["$5 per seat", "$10 per seat", "$20 per seat", "per month per user"],
    notes: "Hallucination test — should not invent specific pricing numbers",
  },
  {
    id: "out-of-scope-001",
    question: "What is the capital of France?",
    expected_topics: ["contact support", "boosterhub", "not able", "outside", "not sure"],
    should_not_contain: ["paris", "france"],
    notes: "Out of scope test — should deflect gracefully",
  },
];

// --- Scoring ---
interface EvalResult {
  id: string;
  question: string;
  response: string;
  topic_hit: boolean;
  hallucination_pass: boolean;
  pass: boolean;
  notes?: string;
}

function scoreResponse(evalCase: EvalCase, response: string): EvalResult {
  const lower = response.toLowerCase();

  // Topic hit: at least one expected topic appears in the response
  const topic_hit = evalCase.expected_topics.some((topic) =>
    lower.includes(topic.toLowerCase())
  );

  // Hallucination pass: none of the forbidden phrases appear
  const hallucination_pass = evalCase.should_not_contain.every(
    (phrase) => !lower.includes(phrase.toLowerCase())
  );

  return {
    id: evalCase.id,
    question: evalCase.question,
    response: response.slice(0, 200) + (response.length > 200 ? "..." : ""),
    topic_hit,
    hallucination_pass,
    pass: topic_hit && hallucination_pass,
    notes: evalCase.notes,
  };
}

// --- Call the endpoint ---
async function queryEndpoint(question: string): Promise<string> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // Read the stream fully
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
  }

  return text;
}

// --- Main ---
async function main() {
  console.log(`\n🧪 Running eval against: ${ENDPOINT}`);
  console.log(`📋 ${goldenSet.length} test cases\n`);

  const results: EvalResult[] = [];

  for (const evalCase of goldenSet) {
    process.stdout.write(`  Testing [${evalCase.id}]... `);

    try {
      const response = await queryEndpoint(evalCase.question);
      const result = scoreResponse(evalCase, response);
      results.push(result);

      const icon = result.pass ? "✅" : "❌";
      console.log(`${icon} topic:${result.topic_hit ? "✓" : "✗"} hallucination:${result.hallucination_pass ? "✓" : "✗"}`);
    } catch (err) {
      console.log(`💥 ERROR: ${err}`);
      results.push({
        id: evalCase.id,
        question: evalCase.question,
        response: `ERROR: ${err}`,
        topic_hit: false,
        hallucination_pass: false,
        pass: false,
      });
    }

    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 500));
  }

  // --- Summary ---
  const passed = results.filter((r) => r.pass).length;
  const topicHits = results.filter((r) => r.topic_hit).length;
  const hallucinationPasses = results.filter((r) => r.hallucination_pass).length;

  console.log("\n" + "─".repeat(50));
  console.log(`📊 RESULTS`);
  console.log("─".repeat(50));
  console.log(`Overall pass rate:     ${passed}/${results.length} (${Math.round(passed/results.length*100)}%)`);
  console.log(`Topic coverage:        ${topicHits}/${results.length}`);
  console.log(`Hallucination checks:  ${hallucinationPasses}/${results.length}`);
  console.log("─".repeat(50));

  // Print failures
  const failures = results.filter((r) => !r.pass);
  if (failures.length > 0) {
    console.log("\n❌ Failures:\n");
    for (const f of failures) {
      console.log(`  [${f.id}] ${f.question}`);
      console.log(`  Response: ${f.response}`);
      if (f.notes) console.log(`  Note: ${f.notes}`);
      console.log();
    }
  }

  console.log(passed === results.length ? "\n🎉 All tests passed!\n" : "\n⚠️  Some tests failed — review above\n");
}

main().catch(console.error);