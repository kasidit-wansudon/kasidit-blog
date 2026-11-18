// src/lib/i18n.ts
// Minimal i18n dictionary for site-wide TH/EN switch.
export type Lang = 'th' | 'en';

export const LANGS: Lang[] = ['th', 'en'];

export type Dict = Record<Lang, string>;

export const t = (entry: Dict, lang: Lang) => entry[lang] ?? entry.th;

export const ui = {
  hero: {
    titleSuffix: {
      th: 'ในกรุงเทพ — สร้างระบบ web และ mobile แบบ end-to-end',
      en: 'in Bangkok — building web & mobile systems end-to-end.',
    } as Dict,
    summaryFallback: {
      th: 'Full-stack developer ที่ชอบสร้างระบบจริง ตั้งแต่ออกแบบสถาปัตยกรรมจนถึง ship ให้ผู้ใช้จริง พร้อมเล่าเบื้องหลังผ่าน blog และ guestbook.',
      en: 'Full-stack developer who builds real systems end-to-end — from architecture to shipping — and writes about the process on the blog and guestbook.',
    } as Dict,
    ctaBlog: { th: 'อ่านบทความ', en: 'Read the blog' } as Dict,
    ctaResume: { th: 'ดู Resume', en: 'View Resume' } as Dict,
    ctaGuestbook: { th: 'ฝากข้อความ', en: 'Leave a message' } as Dict,
    ctaCascade: { th: 'Cascade / MCP', en: 'Cascade / MCP' } as Dict,
    socialHeading: {
      th: 'ช่องทางออนไลน์',
      en: 'Around the internet',
    } as Dict,
  },
  stats: {
    experience: { th: 'ประสบการณ์', en: 'Experience' } as Dict,
    experienceUnit: { th: 'ปี', en: 'yrs' } as Dict,
    experienceCaption: {
      th: 'สร้างระบบ production',
      en: 'building production systems',
    } as Dict,
    focus: { th: 'โฟกัส', en: 'Focus' } as Dict,
    focusFallback: { th: 'Full-stack', en: 'Full-stack' } as Dict,
    focusCaption: {
      th: 'เน้น Flutter, Node.js, Laravel, Vue.js',
      en: 'Flutter, Node.js, Laravel, Vue.js',
    } as Dict,
    company: { th: 'องค์กรปัจจุบัน', en: 'Current org' } as Dict,
    companyCaption: {
      th: 'Full Stack Programmer',
      en: 'Full Stack Programmer',
    } as Dict,
    languages: { th: 'ภาษา', en: 'Languages' } as Dict,
    languagesCaption: {
      th: 'พร้อมสื่อสารกับทีม',
      en: 'Comfortable across teams',
    } as Dict,
  },
  selectedWork: {
    eyebrow: { th: 'ผลงานที่เลือกมาเล่า', en: 'Selected work' } as Dict,
    title: { th: 'Projects & impact', en: 'Projects & impact' } as Dict,
    seeAll: { th: 'ดูทั้งหมด', en: 'See all' } as Dict,
  },
  skills: {
    eyebrow: { th: 'Core skills', en: 'Core skills' } as Dict,
    title: { th: 'Tech stack & tools', en: 'Tech stack & tools' } as Dict,
    lead: {
      th: 'ชุดทักษะที่ใช้จริงใน production และงาน consult',
      en: 'Skills used in real production work and consulting.',
    } as Dict,
  },
  products: {
    eyebrow: { th: 'ผลงาน', en: 'Products & live experiments' } as Dict,
    title: { th: 'ผลงานที่ออกตลาดจริง', en: 'Shipped products' } as Dict,
    lead: {
      th: 'Studio ส่วนตัว + open-source framework ที่ใช้กับงานจริงทั้งใน SEA และ global',
      en: 'A personal studio and open-source framework used in real work across SEA and globally.',
    } as Dict,
  },
  latestWork: {
    eyebrow: { th: 'งานล่าสุด', en: 'Latest work' } as Dict,
    title: {
      th: 'Personal blog & guestbook',
      en: 'Personal blog & guestbook',
    } as Dict,
    body: {
      th: 'แพลตฟอร์มเดียวที่เล่า process การพัฒนา, เก็บโน้ตเทคนิค และให้คนฝากคอมเมนต์ได้แบบ real-time โดยเชื่อม Next.js 14, Supabase และ Cloudflare Pages เข้าด้วยกัน',
      en: 'A single platform for development process notes, technical write-ups, and real-time guestbook comments — built on Next.js 14, Supabase, and Cloudflare Pages.',
    } as Dict,
  },
  mcp: {
    eyebrow: { th: 'MCP stack', en: 'MCP stack' } as Dict,
    title: {
      th: 'Tools & workflows ที่ผม automate',
      en: 'Tools & workflows I automate',
    } as Dict,
    lead: {
      th: 'สรุป server ที่ใช้งานจริง (gdrive, brave-search, deepwiki, memory) พร้อมวิธีทำงานร่วมกับทีม',
      en: 'Summary of MCP servers used in production (gdrive, brave-search, deepwiki, memory) and how they fit team workflows.',
    } as Dict,
    cta: { th: 'เปิดเอกสารเต็ม', en: 'Open full doc' } as Dict,
  },
  toggle: {
    label: { th: 'ภาษา', en: 'Language' } as Dict,
  },
  home: {
    badge: {
      th: 'Full-stack · PM · ผู้สร้าง Kasidit framework',
      en: 'Full-stack · PM · Builder of Kasidit framework',
    } as Dict,
    headline1: { th: 'สร้างระบบที่ทีม', en: 'Building systems' } as Dict,
    headline2: { th: 'ใช้งานได้จริงทุกวัน', en: 'teams actually ship' } as Dict,
    sub: {
      th: 'Full-stack developer และ project manager ที่ OPPO Mexico — WMS, HR, POS, approval workflow ไปจนถึง AI agent framework แบบ open source',
      en: 'Full-stack developer & project manager at OPPO Mexico — WMS, HR, POS and approval workflows, plus an open-source AI agent framework.',
    } as Dict,
    ctaPrimary: { th: "ติดต่อผม", en: "Let's link up" } as Dict,
    ctaSecondary: { th: 'ดูผลงาน', en: 'See my work' } as Dict,
    stackNote: {
      th: 'Stack ที่ใช้ทำงานจริงใน production',
      en: 'The stack I ship to production with',
    } as Dict,
    pillarDayEyebrow: { th: 'งานประจำ', en: 'Day job' } as Dict,
    pillarDayTitle: {
      th: 'นำทีม IT 5 คน ดูแลระบบองค์กรของ OPPO Mexico',
      en: 'Leading a 5-person IT team behind OPPO Mexico’s enterprise systems',
    } as Dict,
    pillarDayBody: {
      th: 'Sellin, Sellout, HR, WMS และ approval หลายขั้น ใช้งานทุกวันโดยผู้ใช้หลายร้อยคน ย้าย Zend 1 เป็น Laravel และจูน MySQL ให้เร็วขึ้น 40%+',
      en: 'Sellin, Sellout, HR, WMS and multi-level approvals used daily by hundreds of people. Migrated Zend 1 to Laravel and cut key query latency by 40%+.',
    } as Dict,
    pillarOssEyebrow: { th: 'Open source', en: 'Open source' } as Dict,
    pillarOssTitle: {
      th: 'Kasidit — framework ให้ AI เขียนโค้ดแบบมีวินัย',
      en: 'Kasidit — a discipline framework for AI coding',
    } as Dict,
    pillarOssBody: {
      th: '8 specialist agents + 1 orchestrator ปฏิเสธงานที่ scope ไม่ชัด เก็บ runbook ให้ทีมใช้ซ้ำ ใช้คุมงาน dev ของทีมจริงทุกวัน',
      en: '8 specialist agents and 1 orchestrator that refuse vague scope and leave reusable runbooks. It runs my team’s dev work every day.',
    } as Dict,
    learnMore: { th: 'ดูเพิ่ม', en: 'Learn more' } as Dict,
    statYears: { th: 'ปีที่สร้างระบบ production', en: 'years shipping production systems' } as Dict,
    statTeam: { th: 'คนในทีมที่ผมนำ', en: 'people on the team I lead' } as Dict,
    statRepos: { th: 'repo บน GitHub', en: 'public repos on GitHub' } as Dict,
    statBench: { th: 'SWE-bench resolved (vs 63% baseline)', en: 'SWE-bench resolved (vs 63% baseline)' } as Dict,
    storyEyebrow: { th: 'เส้นทางของผม', en: 'My story' } as Dict,
    storyTitle: { th: '{n} ปี จากศรีสะเกษถึงเม็กซิโกซิตี้', en: '{n} years, from Sisaket to Mexico City' } as Dict,
    storyLead: {
      th: 'ตั้งแต่งานรับจ้างชิ้นแรก จนถึงหัวหน้าโปรแกรมเมอร์อีกซีกโลก',
      en: 'From my first paid project to leading engineering on the other side of the world.',
    } as Dict,
    linksEyebrow: { th: 'ลิงก์ด่วน', en: 'Quick links' } as Dict,
    linksTitle: { th: 'ไปที่ระบบอื่นของผม', en: 'Jump to my other systems' } as Dict,
    linksLead: {
      th: 'ทุกเว็บและเครื่องมือที่ผมดูแล รวมไว้ที่เดียว กดแล้วเปิดแท็บใหม่',
      en: 'Every site and tool I run, in one place. Opens in a new tab.',
    } as Dict,
    contactEyebrow: { th: 'ติดต่อ', en: 'Contact' } as Dict,
    contactTitle: {
      th: 'มีระบบที่อยากสร้าง หรืออยากคุยเรื่อง agent team?',
      en: 'Building something, or running agent teams too?',
    } as Dict,
    contactBody: {
      th: 'ตอนนี้อยู่ Mexico City ทำงานกับทีมข้ามประเทศได้ ทักมาทางอีเมล X หรือ LinkedIn',
      en: 'Based in Mexico City and used to working across time zones. Reach out by email, X or LinkedIn.',
    } as Dict,
  },
};

/** Career story, oldest → newest. `start` is YYYY-MM; the last chapter is "now". */
export const storyChapters: { start: string; place: Dict; role: Dict; body: Dict; now?: boolean }[] = [
  {
    start: '2021-02',
    place: { th: 'ศรีสะเกษ · ฟรีแลนซ์', en: 'Sisaket · Freelance' },
    role: { th: 'งานแรก: เขียนโค้ดรับจ้างตั้งแต่ยังเรียน', en: 'First job: paid code while still at university' },
    body: {
      th: 'ทำ LINE ChatBot ให้เทศบาลศรีสะเกษ ที่ใช้ AI คัดเรื่องร้องเรียน และ payment gateway ให้โรงพยาบาล ก่อนหน้านั้นเคยทำงานสายโลจิสติกส์และก่อสร้าง ที่สอนให้ใจเย็นตอนงานหนัก',
      en: 'Built a LINE chatbot for Sisaket Municipality that triages complaints with AI, and a payment gateway for a hospital. Before code, logistics and construction work taught me to stay calm under heavy load.',
    },
  },
  {
    start: '2023-06',
    place: { th: 'นนทบุรี · SmilePOS', en: 'Nonthaburi · SmilePOS' },
    role: { th: 'งานประจำแรก: Mobile Developer', en: 'First full-time role: Mobile Developer' },
    body: {
      th: 'สร้างแอป POS ร้านอาหารด้วย Flutter ที่รันได้ 6 แพลตฟอร์ม ซิงก์ข้อมูลสดด้วย MQTT',
      en: 'Shipped Flutter POS apps for restaurants running on six platforms, with live MQTT sync.',
    },
  },
  {
    start: '2024-04',
    place: { th: 'กรุงเทพฯ · Possefy Group (OPPO)', en: 'Bangkok · Possefy Group (OPPO)' },
    role: { th: 'Full Stack Developer', en: 'Full Stack Developer' },
    body: {
      th: 'สร้างเครื่องมือหลังบ้านและ dashboard ให้ OPPO ใน 12 ประเทศ วางรากฐาน Sellout, Console, WMS และ Canteen',
      en: 'Built back-office tools and dashboards for OPPO across 12 countries, laying the base for Sellout, Console, WMS and Canteen.',
    },
  },
  {
    start: '2026-03',
    place: { th: 'เม็กซิโกซิตี้ · OPPO Mexico', en: 'Mexico City · OPPO Mexico' },
    role: { th: 'ย้ายมาเม็กซิโกเป็น Technical Lead', en: 'Moved to Mexico as Technical Lead' },
    body: {
      th: 'นำทีม 5 คน ดูแลระบบให้พนักงาน ~5,000 คน คุยงาน 4 ภาษา ผ่านวิกฤตความปลอดภัย และย้ายระบบไป Alibaba Cloud',
      en: 'Led a team of five supporting ~5,000 staff, worked across four languages, got through a security crisis and moved production to Alibaba Cloud.',
    },
  },
  {
    start: '2026-04',
    place: { th: 'งานเสริม · Kasion', en: 'Side project · Kasion' },
    role: { th: 'ก่อตั้ง Kasion และเปิด Kasidit เป็น open source', en: 'Founded Kasion, open-sourced Kasidit' },
    body: {
      th: 'framework ที่ทำให้ AI เขียนโค้ดแบบมีวินัย และใช้คุมงานของทีมจริงทุกวัน',
      en: 'A framework that makes AI write code with discipline — and runs my team’s work every day.',
    },
  },
  {
    start: '2026-11',
    now: true,
    place: { th: 'เม็กซิโกซิตี้ · ตอนนี้', en: 'Mexico City · Now' },
    role: { th: 'Lead Programmer ที่ OPPO Mexico', en: 'Lead Programmer at OPPO Mexico' },
    body: {
      th: 'ออกแบบจนถึง deploy: Sell-in Dashboard, MEX HR, DingTalk และ AI sales agent — บทต่อไปกำลังเขียนอยู่',
      en: 'Design to deploy: Sell-in Dashboard, MEX HR, DingTalk and an AI sales agent — the next chapter is being written.',
    },
  },
];

/** Quick-link directory shown on the home page (other sites/systems). */
export const quickLinks: {
  title: string;
  url: string;
  note: Dict;
  group: 'kasidit-wans' | 'kasion';
  /** Highlighted links render as large glowing cards at the top. */
  highlight?: boolean;
}[] = [
  { title: 'Blog', url: '/blog', group: 'kasidit-wans', highlight: true, note: { th: 'บทความรายสัปดาห์ เรื่อง AI, coding และการบริหารทีม', en: 'Weekly posts on AI, coding and leading dev teams' } },
  { title: 'Guestbook', url: '/guestbook', group: 'kasidit-wans', highlight: true, note: { th: 'ฝากข้อความ ทักทาย หรือถามคำถาม', en: 'Leave a message, say hi or ask a question' } },
  { title: 'Tools Hub', url: 'https://tools.kasidit-wans.com', group: 'kasidit-wans', highlight: true, note: { th: 'รวมเครื่องมือทั้งหมด 13 ตัว ค้นได้ด้วย ⌘K', en: 'All 13 tools in one hub — search with ⌘K' } },
  { title: 'Kasidit', url: 'https://kasi.kasion.dev', group: 'kasion', highlight: true, note: { th: 'AI coding framework แบบ open source สำหรับ Claude Code', en: 'Open-source AI coding framework for Claude Code' } },
  { title: 'Sales Timing', url: 'https://pc.kasidit-wans.com', group: 'kasidit-wans', note: { th: 'จับเวลาการขาย', en: 'Sales timing & pace' } },
  { title: 'Control Tower', url: 'https://stock.kasidit-wans.com', group: 'kasidit-wans', note: { th: 'สต็อกโรงอาหาร', en: 'Cafeteria stock planning' } },
  { title: 'Kasion', url: 'https://kasion.dev', group: 'kasion', note: { th: 'สตูดิโอหลัก', en: 'Studio home' } },
  { title: 'Money', url: 'https://money.kasion.dev', group: 'kasion', note: { th: 'จัดการเงินส่วนตัว (ต้องล็อกอิน)', en: 'Personal finance (sign-in)' } },
  { title: 'KasionL1', url: 'https://l1.kasion.dev', group: 'kasion', note: { th: 'Career AI engine', en: 'Career AI engine' } },
  { title: 'Phlik Career', url: 'https://phlik.kasion.dev', group: 'kasion', note: { th: 'AI โค้ชอาชีพ', en: 'AI career coach' } },
  { title: 'QR Kasion', url: 'https://qr.kasion.dev', group: 'kasion', note: { th: 'IMEI → บาร์โค้ด', en: 'IMEI → barcode' } },
  { title: 'Oak Docs', url: 'https://kasidit-wansudon.github.io/oak-docs', group: 'kasidit-wans', note: { th: 'เอกสารเทคนิค', en: 'Technical docs' } },
];

export const productsContent = [
  {
    eyebrow: { th: 'Open Source · AI Framework', en: 'Open Source · AI Framework' } as Dict,
    title: 'Kasidit',
    description: {
      th: 'Mindful AI coding framework สำหรับ Claude Code — ห้าโหมด, แปด specialist agents, runtime hooks, default checklists ที่ทำให้ AI coding ลึกและกราวด์ ไม่ hallucinate. MIT.',
      en: 'Mindful AI coding framework for Claude Code. Five modes, eight specialist agents, runtime hooks, and default checklists that keep model output grounded. MIT.',
    } as Dict,
    url: 'https://kasi.kasion.dev',
    tags: ['Claude Code', 'AI', 'TypeScript', 'MIT'],
  },
  {
    eyebrow: { th: 'Studio · บริษัทแม่', en: 'Studio · Parent Org' } as Dict,
    title: 'Kasion',
    description: {
      th: 'Studio หลักรวม Kasidit, KasionL1, Phlik Career และโปรเจกต์ใหม่ที่กำลังลองในตลาด SEA — โฟกัสคน Thai-first.',
      en: 'The umbrella studio behind Kasidit, KasionL1, and Phlik Career. AI products built for the SEA market with a Thai-first lens.',
    } as Dict,
    url: 'https://kasion.dev',
    tags: ['Studio', 'SEA', 'AI Products'],
  },
  {
    eyebrow: { th: 'AI Engine', en: 'AI Engine' } as Dict,
    title: 'KasionL1',
    description: {
      th: 'Career AI engine ตัวกลางที่ขับ Phlik และ apps อื่นใน Kasion ออกแบบให้เข้าใจบริบทคนทำงานในไทย ไม่ใช่ generic prompt.',
      en: 'Career AI engine that powers Phlik and other Kasion apps. Tuned around Thai workplace context — not generic prompts.',
    } as Dict,
    url: 'https://l1.kasion.dev',
    tags: ['AI Engine', 'Career', 'Thai NLP'],
  },
  {
    eyebrow: { th: 'Mobile · Career Coach', en: 'Mobile · Career Coach' } as Dict,
    title: 'Phlik Career',
    description: {
      th: 'พลิกอาชีพ — AI career coach app สำหรับมืออาชีพในไทยและ SEA. ตัวช่วยคิด resume / role / สัมภาษณ์ แบบ conversation ไม่ใช่ template.',
      en: 'AI career coach app for SEA professionals. Conversation-led guidance for resumes, role decisions, and interviews — not templates.',
    } as Dict,
    url: 'https://phlik.kasion.dev',
    tags: ['Mobile', 'Android', 'Web', 'AI Coach'],
  },
  {
    eyebrow: { th: 'Hub · ผลงานรวม', en: 'Hub · Portfolio' } as Dict,
    title: 'Digital Hub',
    description: {
      th: 'หน้ารวมเครื่องมือ + workspace ของผม สำหรับ docs, internal tools, warehouse, และ reporting แบบ one-stop.',
      en: 'My personal command point — docs, internal tools, warehouse, and reporting destinations in one front door.',
    } as Dict,
    url: 'https://tools.kasidit-wans.com/',
    tags: ['Hub', 'Vite', 'React'],
  },
  {
    eyebrow: { th: 'Documentation', en: 'Documentation' } as Dict,
    title: 'Oak Docs',
    description: {
      th: 'Technical notes + developer references + implementation details ที่ใช้จริง คนอ่านแล้วทำงานต่อได้เลย',
      en: 'Technical notes, developer references, and implementation details kept readable for everyday use.',
    } as Dict,
    url: 'https://kasidit-wansudon.github.io/oak-docs',
    tags: ['Docs', 'Internal'],
  },
  {
    eyebrow: { th: 'Analysis Tool', en: 'Analysis Tool' } as Dict,
    title: 'Living Calculator',
    description: {
      th: 'เครื่องคิดต้นทุนการใช้ชีวิตในแต่ละเมือง ช่วยตัดสินใจย้ายงาน/ย้ายเมือง โดยไม่ต้องเปิด spreadsheet',
      en: 'Compare cost-of-living signals across cities for fast relocation and salary decisions — without spreadsheets.',
    } as Dict,
    url: 'https://kasidit-wansudon.github.io/cost-of-living-calculator/',
    tags: ['Tool', 'Decision Support'],
  },
  {
    eyebrow: { th: 'Warehouse Ops', en: 'Warehouse Ops' } as Dict,
    title: 'App Warehouse (WMS)',
    description: {
      th: 'Warehouse management system focus การเคลื่อนไหวของ stock + การควบคุม flow operation จริง',
      en: 'Working warehouse management interface for stock visibility, operational flow, and control.',
    } as Dict,
    url: 'https://kasidit-wansudon.github.io/oppo-wms/',
    tags: ['Operations', 'Inventory'],
  },
  {
    eyebrow: { th: 'Commercial Timing', en: 'Commercial Timing' } as Dict,
    title: 'Sales Timing App',
    description: {
      th: 'จัดเวลา selling window + รายงาน sales pace ใช้คุม campaign และเช็คจังหวะการขาย',
      en: 'Manage selling windows and surface sales pace insights for campaigns and reporting cadence.',
    } as Dict,
    url: 'https://pc.kasidit-wans.com/',
    tags: ['Sales', 'Reporting'],
  },
  {
    eyebrow: { th: 'Control Tower', en: 'Control Tower' } as Dict,
    title: 'Catering Control Tower',
    description: {
      th: 'Stock-planning dashboard สำหรับโรงอาหาร เตรียมเชื่อม Odoo workflow',
      en: 'Stock-planning concept for cafeteria operations, structured for Odoo-connected workflows.',
    } as Dict,
    url: 'https://stock.kasidit-wans.com/',
    tags: ['Operations', 'F&B'],
  },
  {
    eyebrow: { th: 'Open Source · Code', en: 'Open Source · Code' } as Dict,
    title: 'GitHub',
    description: {
      th: '174 repos บน GitHub — Kasidit framework, Kasion suite, tools, experiments. ดู source code ได้ทั้งหมด',
      en: '174 repositories — Kasidit framework, Kasion suite, internal tools, and experiments. All source.',
    } as Dict,
    url: 'https://github.com/kasidit-wansudon',
    tags: ['Source', 'OSS', '174 repos'],
  },
];
