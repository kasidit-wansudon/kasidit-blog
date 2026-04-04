// Resume data for Kasidit Wansudon - Bilingual (EN/TH)
// Updated April 2026 — aligned with PDF resume
import { ResumeData } from '@/lib/resumeUtils';

// English version
export const resumeDataEN: ResumeData = {
  profile: {
    fullName: 'Kasidit Wansudon',
    title: 'Full-Stack Developer | Project Manager | System Architect',
    location: 'Mexico City, MX',
    yearsOfExperience: 4,
    focusAreas: ['Laravel', 'Vue.js', 'Go', 'Flutter'],
    currentCompany: 'Pos Sefi Group Co., Ltd. (OPPO) / OWAY IT',
    email: 'kasidit.wans@gmail.com',
    phone: '+66 63-790-2362',
    website: 'https://kasidit-wans.com',
    github: 'https://github.com/kasidit-wansudon',
    linkedin: 'https://linkedin.com/in/kasidit-wansudon-939577275',
    summary:
      'Full-Stack Developer and Project Manager with 4+ years of experience building enterprise systems including WMS, HR platforms, POS, and approval workflows. Leading a cross-functional team of 5 at OPPO Mexico. Expert in Laravel, Vue.js, Go, and Flutter with strong cloud infrastructure skills (AWS, Docker, Kubernetes). Passionate about system architecture, AI integration, and scalable software.',
  },
  experiences: [
    {
      role: 'Full-Stack Programmer & Project Manager',
      company: 'Pos Sefi Group Co., Ltd. (OPPO) / OWAY IT',
      location: 'Mexico City, MX',
      start: '2024-04',
      end: undefined,
      impactScore: 10,
      techStack: ['Vue.js', 'Laravel', 'Zend', 'Flutter', 'MySQL', 'DingTalk API', 'Docker', 'PM2', 'Nginx'],
      highlights: [
        'Lead a cross-functional team of 5 (2 devs, 1 QA, 1 helpdesk, 1 infra) supporting enterprise systems',
        'Developed and maintained Sellin, Sellout, HR, and AppHR systems serving hundreds of daily users',
        'Built complex multi-level approval workflows with Vue.js and conditional routing logic',
        'Integrated DingTalk API for webhook-triggered middleware and automated notifications',
        'Migrated legacy Zend Framework 1.12 to Laravel 8+, improving maintainability and test coverage',
        'Designed and optimized MySQL schemas for warehouse operations; reduced key query latency by 40%+',
      ],
    },
    {
      role: 'Flutter Programmer',
      company: 'Rainbow Solution',
      location: 'Thailand',
      start: '2023-06',
      end: '2024-04',
      impactScore: 9,
      techStack: ['Flutter', 'MQTT', 'Google Maps API', 'JavaScript', 'Firebase'],
      highlights: [
        'Built cross-platform POS systems running on Linux, Windows, Web, and macOS with Flutter',
        'Implemented real-time data sync via MQTT, eliminating unnecessary API calls for faster UX',
        'Developed restaurant features: time tracking, payments, tax management, menu setup, and reporting',
        'Integrated Google Maps for delivery zone management and route optimization',
      ],
    },
    {
      role: 'Full-Stack Developer',
      company: 'Freelance',
      location: 'Remote / Thailand',
      start: '2022-01',
      end: '2023-05',
      impactScore: 8,
      isRemote: true,
      techStack: ['Node.js', 'Vue.js', 'Laravel', 'Firebase', 'Line API', 'PHP', 'Python', 'Flutter', 'Docker'],
      highlights: [
        'LINE ChatBot (Sisaket Municipality) — AI-filtered issue reporting with dashboard and approval (Node.js, Vue.js, Laravel, Firebase)',
        'Ksher Payment Gateway (Hospital) — Payment API with RSA encryption and callback verification (PHP)',
        'PDF Checker Module — PDF/CSV validation with grammar checking and Docker deployment (Flutter, PHP)',
        'Geo Location App — Social app with chat, image compression 4x, and live map (Python, Flutter)',
      ],
    },
  ],
  skills: [
    // Expert - Main skills used daily, can teach others
    { name: 'Laravel', level: 'expert', years: 3, category: 'Backend' },
    { name: 'Vue.js', level: 'expert', years: 2, category: 'Frontend' },
    { name: 'Flutter', level: 'expert', years: 3, category: 'Mobile' },
    { name: 'Node.js', level: 'expert', years: 3, category: 'Backend' },

    // Advanced - Strong proficiency, used in production
    { name: 'Go', level: 'advanced', years: 2, category: 'Backend' },
    { name: 'PHP', level: 'advanced', years: 4, category: 'Backend' },
    { name: 'MySQL', level: 'advanced', years: 4, category: 'Database' },
    { name: 'JavaScript / TypeScript', level: 'advanced', years: 4, category: 'Frontend' },
    { name: 'Python', level: 'advanced', years: 2, category: 'Backend' },
    { name: 'Docker', level: 'advanced', years: 2, category: 'DevOps' },
    { name: 'Git', level: 'advanced', years: 4, category: 'DevOps' },
    { name: 'Firebase', level: 'advanced', years: 2, category: 'Backend' },
    { name: 'REST API', level: 'advanced', years: 3, category: 'Backend' },
    { name: 'Zend Framework', level: 'advanced', years: 1, category: 'Backend' },

    // Intermediate - Good working knowledge
    { name: 'Next.js', level: 'intermediate', years: 1, category: 'Frontend' },
    { name: 'NestJS', level: 'intermediate', years: 1, category: 'Backend' },
    { name: 'Kubernetes', level: 'intermediate', years: 1, category: 'DevOps' },
    { name: 'AWS', level: 'intermediate', years: 1, category: 'DevOps' },
    { name: 'MongoDB', level: 'intermediate', years: 1, category: 'Database' },
    { name: 'Redis', level: 'intermediate', years: 1, category: 'Database' },
    { name: 'gRPC', level: 'intermediate', years: 1, category: 'Backend' },
    { name: 'MQTT', level: 'intermediate', years: 1, category: 'Backend' },
    { name: 'Socket.io', level: 'intermediate', years: 1, category: 'Backend' },
    { name: 'CI/CD', level: 'intermediate', years: 2, category: 'DevOps' },
    { name: 'Terraform', level: 'intermediate', years: 1, category: 'DevOps' },
    { name: 'Figma', level: 'intermediate', years: 2, category: 'Design' },
    { name: 'DingTalk API', level: 'intermediate', years: 1, category: 'Backend' },
    { name: 'LINE API', level: 'intermediate', years: 1, category: 'Backend' },

    // Beginner
    { name: 'C# .NET Core', level: 'beginner', years: 1, category: 'Backend' },
  ],
  education: [
    {
      institution: 'Sisaket Rajabhat University',
      degree: 'Bachelor of Engineering',
      field: 'Software Engineering',
      start: '2020',
      end: '2023',
      gpa: 3.74,
    },
  ],
  languages: [
    { name: 'Thai', proficiency: 'Native' },
    { name: 'English', proficiency: 'Professional (Speak, Listen, Read, Write)' },
  ],
  projects: [
    {
      name: 'microservices-ecommerce',
      description: 'Cloud-native e-commerce — saga pattern, event sourcing, distributed tracing',
      url: 'https://github.com/kasidit-wansudon/microservices-ecommerce',
      techStack: ['Go', 'gRPC', 'Kubernetes'],
    },
    {
      name: 'ai-hr-analytics',
      description: 'AI-powered HR analytics — anomaly detection, turnover prediction, RAG chatbot',
      url: 'https://github.com/kasidit-wansudon/ai-hr-analytics',
      techStack: ['Laravel', 'Vue.js', 'Python ML'],
    },
    {
      name: 'cloudhive',
      description: 'Multi-tenant SaaS platform with billing, auth, and admin stack',
      url: 'https://github.com/kasidit-wansudon/cloudhive',
      techStack: ['Go', 'Vue 3'],
    },
    {
      name: 'flowforge',
      description: 'Distributed workflow orchestration engine with visual DAG editor',
      url: 'https://github.com/kasidit-wansudon/flowforge',
      techStack: ['Go', 'WebSocket'],
    },
    {
      name: 'go-api-gateway',
      description: 'High-performance API gateway — rate limiting, JWT, circuit breaker, Prometheus',
      url: 'https://github.com/kasidit-wansudon/go-api-gateway',
      techStack: ['Go'],
    },
    {
      name: 'schemaforge-erd',
      description: 'Interactive ERD builder for database design',
      url: 'https://github.com/kasidit-wansudon/schemaforge-erd',
      techStack: ['JavaScript'],
    },
  ],
};

// Thai version
export const resumeDataTH: ResumeData = {
  profile: {
    fullName: 'กษิดิศ วันสุดล',
    title: 'Full-Stack Developer | Project Manager | System Architect',
    location: 'เม็กซิโกซิตี้, MX',
    yearsOfExperience: 4,
    focusAreas: ['Laravel', 'Vue.js', 'Go', 'Flutter'],
    currentCompany: 'บริษัท โพส เซฟี่ กรุ๊ป จำกัด (OPPO) / OWAY IT',
    email: 'kasidit.wans@gmail.com',
    phone: '+66 63-790-2362',
    website: 'https://kasidit-wans.com',
    github: 'https://github.com/kasidit-wansudon',
    linkedin: 'https://linkedin.com/in/kasidit-wansudon-939577275',
    summary:
      'Full-Stack Developer และ Project Manager ประสบการณ์กว่า 4 ปี สร้างระบบองค์กรรวมถึง WMS, HR Platform, POS และ Approval Workflow นำทีม 5 คนที่ OPPO เม็กซิโก เชี่ยวชาญ Laravel, Vue.js, Go และ Flutter มีทักษะ Cloud Infrastructure (AWS, Docker, Kubernetes) มุ่งเน้น System Architecture, AI Integration และการพัฒนาซอฟต์แวร์ที่ขยายตัวได้',
  },
  experiences: [
    {
      role: 'Full-Stack Programmer & Project Manager',
      company: 'บริษัท โพส เซฟี่ กรุ๊ป จำกัด (OPPO) / OWAY IT',
      location: 'เม็กซิโกซิตี้, MX',
      start: '2024-04',
      end: undefined,
      impactScore: 10,
      techStack: ['Vue.js', 'Laravel', 'Zend', 'Flutter', 'MySQL', 'DingTalk API', 'Docker', 'PM2', 'Nginx'],
      highlights: [
        'นำทีม 5 คน (2 dev, 1 QA, 1 helpdesk, 1 infra) ดูแลระบบองค์กรทั้งหมด',
        'พัฒนาและดูแลระบบ Sellin, Sellout, HR และ AppHR ที่มีผู้ใช้หลายร้อยคนต่อวัน',
        'สร้างระบบ Approval หลายระดับด้วย Vue.js พร้อม Conditional Routing Logic',
        'เชื่อมต่อ DingTalk API สำหรับ Webhook Middleware และ Notification อัตโนมัติ',
        'Migrate ระบบจาก Zend Framework 1.12 สู่ Laravel 8+ เพิ่ม Maintainability',
        'ออกแบบและ Optimize MySQL Schema สำหรับ Warehouse Operations ลด Query Latency 40%+',
      ],
    },
    {
      role: 'โปรแกรมเมอร์ Flutter',
      company: 'Rainbow Solution',
      location: 'ประเทศไทย',
      start: '2023-06',
      end: '2024-04',
      impactScore: 9,
      techStack: ['Flutter', 'MQTT', 'Google Maps API', 'JavaScript', 'Firebase'],
      highlights: [
        'สร้างระบบ POS ข้ามแพลตฟอร์มด้วย Flutter ใช้งานได้บน Linux, Windows, Web และ macOS',
        'ใช้ MQTT สำหรับ Real-time Data Sync ลดการเรียก API ที่ไม่จำเป็น',
        'พัฒนาฟีเจอร์ร้านอาหาร: จัดการเวลา, ชำระเงิน, ภาษี, เมนู และรายงาน',
        'เชื่อมต่อ Google Maps สำหรับจัดการพื้นที่จัดส่งและ Route Optimization',
      ],
    },
    {
      role: 'นักพัฒนาอิสระ',
      company: 'Freelance',
      location: 'ทำงานระยะไกล / ไทย',
      start: '2022-01',
      end: '2023-05',
      impactScore: 8,
      isRemote: true,
      techStack: ['Node.js', 'Vue.js', 'Laravel', 'Firebase', 'Line API', 'PHP', 'Python', 'Flutter', 'Docker'],
      highlights: [
        'LINE ChatBot (เทศบาลศรีสะเกษ) — ระบบแจ้งปัญหาพร้อม AI กรองข้อมูลและ Dashboard (Node.js, Vue.js, Laravel, Firebase)',
        'Ksher Payment Gateway (โรงพยาบาล) — API ชำระเงินพร้อม RSA Encryption (PHP)',
        'PDF Checker Module — ตรวจสอบ PDF/CSV พร้อม Grammar Check และ Docker Deploy (Flutter, PHP)',
        'Geo Location App — แอปโซเชียลพร้อมแชท บีบอัดรูป 4x และแผนที่สด (Python, Flutter)',
      ],
    },
  ],
  skills: resumeDataEN.skills, // Use same skills data
  education: [
    {
      institution: 'มหาวิทยาลัยราชภัฏศรีสะเกษ',
      degree: 'วิศวกรรมศาสตรบัณฑิต',
      field: 'วิศวกรรมซอฟต์แวร์',
      start: '2020',
      end: '2023',
      gpa: 3.74,
    },
  ],
  languages: [
    { name: 'ไทย', proficiency: 'ภาษาแม่' },
    { name: 'อังกฤษ', proficiency: 'ระดับทำงาน (พูด ฟัง อ่าน เขียน)' },
  ],
  projects: [
    {
      name: 'microservices-ecommerce',
      description: 'Cloud-native e-commerce — saga pattern, event sourcing, distributed tracing',
      url: 'https://github.com/kasidit-wansudon/microservices-ecommerce',
      techStack: ['Go', 'gRPC', 'Kubernetes'],
    },
    {
      name: 'ai-hr-analytics',
      description: 'AI-powered HR analytics — anomaly detection, turnover prediction, RAG chatbot',
      url: 'https://github.com/kasidit-wansudon/ai-hr-analytics',
      techStack: ['Laravel', 'Vue.js', 'Python ML'],
    },
    {
      name: 'cloudhive',
      description: 'แพลตฟอร์ม SaaS หลาย Tenant พร้อม Billing, Auth และ Admin',
      url: 'https://github.com/kasidit-wansudon/cloudhive',
      techStack: ['Go', 'Vue 3'],
    },
    {
      name: 'flowforge',
      description: 'ระบบ Workflow Orchestration แบบกระจาย พร้อม Visual DAG Editor',
      url: 'https://github.com/kasidit-wansudon/flowforge',
      techStack: ['Go', 'WebSocket'],
    },
    {
      name: 'go-api-gateway',
      description: 'API Gateway ประสิทธิภาพสูง — Rate Limiting, JWT, Circuit Breaker, Prometheus',
      url: 'https://github.com/kasidit-wansudon/go-api-gateway',
      techStack: ['Go'],
    },
    {
      name: 'schemaforge-erd',
      description: 'เครื่องมือสร้าง ERD แบบ Interactive สำหรับออกแบบฐานข้อมูล',
      url: 'https://github.com/kasidit-wansudon/schemaforge-erd',
      techStack: ['JavaScript'],
    },
  ],
};

// UI Labels for both languages
export const resumeLabels = {
  en: {
    skills: 'Skills',
    experience: 'Work Experience',
    education: 'Education',
    languages: 'Languages',
    projects: 'Featured Projects',
    downloadPdf: 'Download PDF (EN)',
    downloadPdfTh: 'Download PDF (TH)',
    downloadPdfLegacy: 'Download PDF (Legacy)',
    backToHome: 'Back to Home',
    present: 'Present',
    remote: 'Remote',
  },
  th: {
    skills: 'ทักษะ',
    experience: 'ประสบการณ์ทำงาน',
    education: 'การศึกษา',
    languages: 'ภาษา',
    projects: 'โปรเจกต์เด่น',
    downloadPdf: 'ดาวน์โหลด PDF (EN)',
    downloadPdfTh: 'ดาวน์โหลด PDF (TH)',
    downloadPdfLegacy: 'ดาวน์โหลด PDF (เวอร์ชันเก่า)',
    backToHome: 'กลับหน้าหลัก',
    present: 'ปัจจุบัน',
    remote: 'ทำงานระยะไกล',
  },
};

// Default export for backward compatibility
export const resumeData = resumeDataEN;
