import s from "./Dashboard.module.css";

const NAV = [
  { label: "Dashboard", active: true, icon: IconGrid },
  { label: "People", icon: IconUsers },
  { label: "Chat", icon: IconMessage },
  { label: "Email", icon: IconMail },
  { label: "File Manager", icon: IconFolder },
  { label: "Calendar", icon: IconCalendar },
  { label: "Volunteer", icon: IconHand },
  { label: "Fundraising", icon: IconHeart },
  { label: "Accounting", badge: "Beta", icon: IconWallet },
  { label: "Merchandise", icon: IconTag },
  { label: "Webmaster", icon: IconGlobe },
  { label: "Store", icon: IconStore },
  { label: "Help Center", icon: IconHelpCircle },
  { label: "Settings", icon: IconSettings },
];

const ACTIONS_TOP = [
  { label: "Announcements", icon: IconMegaphone },
  { label: "Add News", icon: IconNewspaper },
  { label: "Add Event", icon: IconCalendarPlus },
  { label: "Create Email", icon: IconMailLarge },
  { label: "Add People", icon: IconUserPlus },
  { label: "Visit Website", icon: IconGlobeLarge, disabled: true },
  { label: "Add Item to Store", icon: IconBag },
  { label: "Cashier", icon: IconRegister },
];

const ACTIONS_SECONDARY = [
  { label: "Upload Media", icon: IconImagePlus },
  { label: "Cash Tally Sheet", icon: IconList },
  { label: "Submit Expense", icon: IconDollarLarge },
];

const STATS = [
  { label: "Active Members", value: "362" },
  { label: "Invited Not Joined", value: "261" },
  { label: "Open Volunteer Spots", value: "169" },
  { label: "Last 30 Days Store Transactions", value: "$0.00" },
  { label: "Last 30 Days BoosterBucks", value: "$0.00" },
];

const UPCOMING = [
  { title: "Spring Concert Rehearsal", start: "May, 20 2026 06:00 PM", end: "May, 20 2026 09:00 PM" },
  { title: "Booster Club Monthly Meeting", start: "May, 27 2026 07:00 PM", end: "May, 27 2026 08:30 PM" },
  { title: "Car Wash Fundraiser", start: "Jun, 06 2026 09:00 AM", end: "Jun, 06 2026 02:00 PM" },
  { title: "End-of-Year Awards Banquet", start: "Jun, 10 2026 06:00 PM", end: "Jun, 10 2026 09:00 PM" },
  { title: "Summer Band Camp - Day 1", start: "Jul, 13 2026 09:00 AM", end: "Jul, 13 2026 04:00 PM" },
  { title: "Summer Band Camp - Day 2", start: "Jul, 14 2026 09:00 AM", end: "Jul, 14 2026 04:00 PM" },
];

const ACTIVITY = [
  "New Event: Summer Band Camp - Day 1 07-13-26 09:00 AM",
  "New Event: End-of-Year Awards Banquet 06-10-26 06:00 PM",
];
const ACTIVITY_EMAILS = [
  "Spring Concert reminder Email was sent!",
  "Volunteer signups now open for Car Wash Fundraiser Email was sent!",
  "May Newsletter: upcoming events and recap Email was sent!",
];

export default function Dashboard() {
  return (
    <div className={s.shell}>
      <aside className={s.sidebar}>
        <div className={s.brand}>
          <span className={s.brandBooster}>Booster</span>
          <span className={s.brandHub}>HUB</span>
        </div>

        <nav className={s.nav}>
          {NAV.map(({ label, active, badge, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={`${s.navItem} ${active ? s.navItemActive : ""}`}
            >
              <Icon />
              <span>{label}</span>
              {badge && <span className={s.navBadge}>{badge}</span>}
            </button>
          ))}
        </nav>

        <div className={s.sidebarFoot}>
          <div className={s.avatar}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1e3a8a">
              <circle cx="12" cy="8" r="4"/>
              <path d="M12 14c-4 0-7 2.5-7 6h14c0-3.5-3-6-7-6z"/>
            </svg>
          </div>
          <div className={s.footMeta}>
            <div className={s.footName}>BoosterHub Team</div>
            <div className={s.footRole}>View profile</div>
          </div>
          <button type="button" className={s.signOut} aria-label="Sign out">
            <IconLogOut />
          </button>
        </div>
      </aside>

      <div className={s.main}>
        <header className={s.topbar}>
          <div className={s.topbarBrand}>
            <span className={s.topbarBoosterText}>Booster</span>
            <span className={s.topbarHubText}>HUB</span>
          </div>
          <div className={s.topbarSpacer} />
          <button type="button" className={s.iconCircle} aria-label="Notifications">
            <IconPlane />
          </button>
          <button type="button" className={s.iconCircle} aria-label="Help">
            <IconQuestion />
          </button>
          <button type="button" className={s.clubSwitcher}>
            <span style={{ flex: 1 }}>Lakeside Marching Band Boosters</span>
            <IconChevron />
          </button>
          <div className={s.userAvatar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#6b7280">
              <circle cx="12" cy="8" r="4"/>
              <path d="M12 14c-4 0-7 2.5-7 6h14c0-3.5-3-6-7-6z"/>
            </svg>
          </div>
        </header>

        <div className={s.content}>
          <div className={s.contentGrid}>
            <div>
              <div className={s.profileCard}>
                <div className={s.profileLogo}>
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="56" fill="#1e3a8a"/>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#facc15" strokeWidth="2"/>
                    <text x="60" y="54" textAnchor="middle" fill="white" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="900" fontSize="34" letterSpacing="-1">LB</text>
                    <text x="60" y="78" textAnchor="middle" fill="#facc15" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="700" fontSize="11" letterSpacing="2">BOOSTERS</text>
                    <path d="M28 88 Q 60 96 92 88" stroke="#facc15" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </div>

              <div className={s.upcomingCard}>
                <h3 className={s.upcomingTitle}>Upcoming Events</h3>
                {UPCOMING.map((ev) => (
                  <div key={ev.title} className={s.upcomingItem}>
                    <div className={s.upcomingItemTitle}>{ev.title}</div>
                    <div className={s.upcomingItemMeta}>
                      Start: {ev.start}<br />
                      End: {ev.end}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h1 className={s.welcomeBanner}>Welcome to the Lakeside Marching Band Boosters!</h1>

              <div className={s.actionGrid}>
                {ACTIONS_TOP.map(({ label, icon: Icon, disabled }) => (
                  <button
                    key={label}
                    type="button"
                    className={`${s.actionCard} ${disabled ? s.disabled : ""}`}
                    disabled={disabled}
                  >
                    <div className={s.actionIcon}><Icon /></div>
                    <div className={s.actionLabel}>{label}</div>
                  </button>
                ))}
              </div>

              <div className={s.actionGridSecondary}>
                {ACTIONS_SECONDARY.map(({ label, icon: Icon }) => (
                  <button key={label} type="button" className={s.actionCard}>
                    <div className={s.actionIcon}><Icon /></div>
                    <div className={s.actionLabel}>{label}</div>
                  </button>
                ))}
              </div>

              <h2 className={s.statsTitle}>Our Stats</h2>
              <div className={s.statsRow}>
                {STATS.map((stat) => (
                  <div key={stat.label} className={s.statCell}>
                    <div className={s.statLabel}>{stat.label}</div>
                    <div className={s.statValue}>{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className={s.activityCard}>
                <h3 className={s.activityTitle}>Activity Feed</h3>
                {ACTIVITY.map((line) => (
                  <div key={line} className={s.activityRow}>
                    <div className={s.activityDot} />
                    <div className={s.activityText}>{line}</div>
                  </div>
                ))}
                {ACTIVITY_EMAILS.map((line) => (
                  <div key={line} className={s.activityRow}>
                    <div className={s.activityDot} />
                    <div className={s.activityText}><a href="#">{line}</a></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- icons ---------- */
const I = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const I16 = { width: 16, height: 16, viewBox: "0 0 24 24", ...I };
const I26 = { width: 26, height: 26, viewBox: "0 0 24 24", ...I };

function IconGrid()        { return <svg {...I16}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>; }
function IconUsers()       { return <svg {...I16}><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>; }
function IconMessage()     { return <svg {...I16}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>; }
function IconMail()        { return <svg {...I16}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>; }
function IconFolder()      { return <svg {...I16}><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>; }
function IconCalendar()    { return <svg {...I16}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>; }
function IconHand()        { return <svg {...I16}><path d="M18 11V6a2 2 0 00-4 0v5"/><path d="M14 10V4a2 2 0 00-4 0v6"/><path d="M10 10.5V6a2 2 0 00-4 0v8"/><path d="M18 8a2 2 0 014 0v6a8 8 0 01-8 8h-2c-2.5 0-3.5-.75-5.5-2.75L2 16"/></svg>; }
function IconHeart()       { return <svg {...I16}><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>; }
function IconWallet()      { return <svg {...I16}><rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20M17 15h2"/></svg>; }
function IconTag()         { return <svg {...I16}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>; }
function IconGlobe()       { return <svg {...I16}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>; }
function IconStore()       { return <svg {...I16}><path d="M3 7l1.5-4h15L21 7"/><path d="M3 7v13a1 1 0 001 1h16a1 1 0 001-1V7"/><path d="M3 7h18"/><path d="M16 11a4 4 0 01-8 0"/></svg>; }
function IconHelpCircle()  { return <svg {...I16}><circle cx="12" cy="12" r="10"/><path d="M9.1 9.5a3 3 0 015.83.5c0 2-3 2.5-3 4"/><circle cx="12" cy="17" r=".5" fill="currentColor"/></svg>; }
function IconSettings()    { return <svg {...I16}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008.9 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 8.9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>; }
function IconLogOut()      { return <svg {...I16}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>; }
function IconPlane()       { return <svg {...I16} stroke="white"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21 4 19.5 4S17 6 15.5 7.5L7 11 2.8 14.2 4 16l4-1 2 2-1 4 1.8 1.2L14 17l3.8 2.2z"/></svg>; }
function IconQuestion()    { return <svg {...I16} stroke="white"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5"/><circle cx="12" cy="17" r="1" fill="white" stroke="none"/></svg>; }
function IconChevron()     { return <svg width="14" height="14" viewBox="0 0 24 24" {...I}><path d="M6 9l6 6 6-6"/></svg>; }

function IconMegaphone()   { return <svg {...I26}><path d="M3 11l18-8v18l-18-8z"/><path d="M11 11v8a3 3 0 006 0v-3"/></svg>; }
function IconNewspaper()   { return <svg {...I26}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>; }
function IconCalendarPlus(){ return <svg {...I26}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 14v6M9 17h6"/></svg>; }
function IconMailLarge()   { return <svg {...I26}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>; }
function IconUserPlus()    { return <svg {...I26}><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>; }
function IconGlobeLarge()  { return <svg {...I26}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>; }
function IconBag()         { return <svg {...I26}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 01-8 0"/><path d="M12 14v4M10 16h4"/></svg>; }
function IconRegister()    { return <svg {...I26}><rect x="2" y="6" width="20" height="13" rx="1"/><path d="M2 11h20"/></svg>; }
function IconImagePlus()   { return <svg {...I26}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/><path d="M18 4v4M16 6h4"/></svg>; }
function IconList()        { return <svg {...I26}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="0.5" fill="currentColor"/><circle cx="3.5" cy="12" r="0.5" fill="currentColor"/><circle cx="3.5" cy="18" r="0.5" fill="currentColor"/></svg>; }
function IconDollarLarge() { return <svg {...I26}><path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 010 7H6"/></svg>; }
