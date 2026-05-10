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
];
