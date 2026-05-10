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
};

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
    url: 'https://kasidit-wans.com/',
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
