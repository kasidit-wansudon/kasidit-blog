// Utility helpers for working with resume data
// Comment in English

export type ResumeSkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ResumeSkill {
  name: string;
  level: ResumeSkillLevel;
  years?: number; // Optional years of experience
  keywords?: string[]; // Optional related keywords for search/highlight
  category?: string; // e.g. "Frontend", "Backend", "DevOps"
}

export interface ResumeExperience {
  role: string;
  company: string;
  location?: string;
  start: string; // ISO string or human readable label, e.g. "2022-01" or "Jan 2022"
  end?: string; // If undefined, treated as current
  highlights: string[];
  techStack?: string[];
  impactScore?: number; // 1–10 subjective score for ordering
  companyUrl?: string; // Link to company website
  isRemote?: boolean; // Remote position flag
}

export interface ResumeProfile {
  fullName: string;
  title: string;
  location?: string;
  yearsOfExperience?: number;
  focusAreas?: string[];
  currentCompany?: string;
  email?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary?: string; // Short bio or objective statement
}

export interface ResumeEducation {
  institution: string;
  degree: string;
  field?: string; // e.g. "Computer Science"
  start: string;
  end?: string;
  gpa?: number;
  achievements?: string[];
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  url?: string;
  techStack: string[];
  highlights?: string[];
  startDate?: string;
  endDate?: string;
}

export interface ResumeData {
  profile: ResumeProfile;
  experiences: ResumeExperience[];
  skills: ResumeSkill[];
  education?: ResumeEducation[];
  certifications?: ResumeCertification[];
  projects?: ResumeProject[];
  languages?: { name: string; proficiency: string }[];
}

/**
 * Create a short one‑sentence summary for the top of the resume.
 * Example output:
 * "Full‑stack developer with 5+ years of experience, focusing on Next.js and NestJS, currently at ACME Corp."
 */
export function buildResumeSummary(data: ResumeData): string {
  const { profile } = data;

  const parts: string[] = [];

  // Base: title
  if (profile.title) {
    parts.push(profile.title.trim());
  }

  // Years of experience
  if (typeof profile.yearsOfExperience === 'number') {
    const years = profile.yearsOfExperience;
    if (years > 0) {
      parts.push(`with ${years}+ year${years > 1 ? 's' : ''} of experience`);
    }
  }

  // Focus areas
  if (profile.focusAreas && profile.focusAreas.length > 0) {
    const mainFocus = profile.focusAreas.slice(0, 3).join(', ');
    parts.push(`focusing on ${mainFocus}`);
  }

  // Current company
  if (profile.currentCompany) {
    parts.push(`currently at ${profile.currentCompany}`);
  }

  const sentence = parts.join(', ');
  return sentence.endsWith('.') ? sentence : `${sentence}.`;
}

/**
 * Sort experiences in a "resume friendly" order.
 * - Current roles first
 * - Then by impactScore (desc) if provided
 * - Then by start date (desc, as string compare fallback)
 */
export function sortExperiencesForResume(experiences: ResumeExperience[]): ResumeExperience[] {
  return [...experiences].sort((a, b) => {
    const aCurrent = !a.end;
    const bCurrent = !b.end;

    if (aCurrent !== bCurrent) {
      return aCurrent ? -1 : 1;
    }

    const aImpact = typeof a.impactScore === 'number' ? a.impactScore : 0;
    const bImpact = typeof b.impactScore === 'number' ? b.impactScore : 0;

    if (aImpact !== bImpact) {
      return bImpact - aImpact;
    }

    // Fallback: sort by start (desc) using string compare
    if (a.start !== b.start) {
      return a.start < b.start ? 1 : -1;
    }

    return 0;
  });
}

/**
 * Generate bullet points for an experience.
 * This is a simple helper in case you want to post‑process the raw highlight text,
 * for example to prefix with a symbol or trim whitespace.
 */
export function generateExperienceBullets(exp: ResumeExperience): string[] {
  return exp.highlights
    .map((h) => h.trim())
    .filter((h) => h.length > 0);
}

/**
 * Rank skills for display, taking into account level and optional years of experience.
 * This is useful to show a "top skills" section.
 */
export function rankSkills(skills: ResumeSkill[]): ResumeSkill[] {
  const levelWeight: Record<ResumeSkillLevel, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };

  return [...skills].sort((a, b) => {
    const aScore = (levelWeight[a.level] || 0) * 10 + (a.years || 0);
    const bScore = (levelWeight[b.level] || 0) * 10 + (b.years || 0);

    if (aScore !== bScore) {
      return bScore - aScore;
    }

    return a.name.localeCompare(b.name);
  });
}

/**
 * Helper to take the top N ranked skills.
 */
export function getTopSkills(skills: ResumeSkill[], limit = 6): ResumeSkill[] {
  return rankSkills(skills).slice(0, limit);
}

/**
 * Very small helper to quickly build a ResumeData object.
 * This is convenient if you want to keep the raw data in a separate file
 * and pass it to your UI components.
 */
export function createResumeData(input: ResumeData): ResumeData {
  // In case we want to add data normalization in the future, keep a dedicated factory.
  return input;
}

/**
 * Group skills by category for organized display.
 */
export function groupSkillsByCategory(skills: ResumeSkill[]): Record<string, ResumeSkill[]> {
  return skills.reduce((acc, skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, ResumeSkill[]>);
}

/**
 * Calculate total years of experience from all positions.
 */
export function calculateTotalExperience(experiences: ResumeExperience[]): number {
  let totalMonths = 0;

  for (const exp of experiences) {
    const start = parseResumeDate(exp.start);
    const end = exp.end ? parseResumeDate(exp.end) : new Date();

    if (start && end) {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
    }
  }

  return Math.round(totalMonths / 12);
}

/**
 * Parse a resume date string (e.g., "2022-01", "Jan 2022", "2022") into a Date object.
 */
export function parseResumeDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  // Try ISO format: "2022-01" or "2022-01-15"
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
  if (isoMatch) {
    return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1);
  }

  // Try year only: "2022"
  const yearMatch = dateStr.match(/^(\d{4})$/);
  if (yearMatch) {
    return new Date(parseInt(yearMatch[1]), 0);
  }

  // Try "Jan 2022" or "January 2022" format
  const monthYearMatch = dateStr.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthYearMatch) {
    const parsed = new Date(`${monthYearMatch[1]} 1, ${monthYearMatch[2]}`);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

/**
 * Format experience duration as a human-readable string.
 * e.g., "2 years 3 months" or "Present"
 */
export function formatExperienceDuration(exp: ResumeExperience): string {
  const start = parseResumeDate(exp.start);
  const end = exp.end ? parseResumeDate(exp.end) : new Date();

  if (!start || !end) return '';

  const totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} month${months > 1 ? 's' : ''}`);

  return parts.join(' ') || 'Less than a month';
}

/**
 * Get all unique tech stack items across all experiences.
 */
export function getAllTechStack(experiences: ResumeExperience[]): string[] {
  const techSet = new Set<string>();

  for (const exp of experiences) {
    if (exp.techStack) {
      exp.techStack.forEach((tech) => techSet.add(tech));
    }
  }

  return Array.from(techSet).sort();
}

/**
 * Filter experiences by tech stack keyword.
 */
export function filterExperiencesByTech(
  experiences: ResumeExperience[],
  tech: string
): ResumeExperience[] {
  const lowerTech = tech.toLowerCase();
  return experiences.filter((exp) =>
    exp.techStack?.some((t) => t.toLowerCase().includes(lowerTech))
  );
}

/**
 * Get skill level as a percentage (for progress bars).
 */
export function getSkillLevelPercent(level: ResumeSkillLevel): number {
  const percentMap: Record<ResumeSkillLevel, number> = {
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };
  return percentMap[level] || 0;
}

/**
 * Check if a certification is still valid (not expired).
 */
export function isCertificationValid(cert: ResumeCertification): boolean {
  if (!cert.expiryDate) return true;

  const expiry = parseResumeDate(cert.expiryDate);
  if (!expiry) return true;

  return expiry > new Date();
}

/**
 * Sort education by end date (most recent first).
 */
export function sortEducation(education: ResumeEducation[]): ResumeEducation[] {
  return [...education].sort((a, b) => {
    const aEnd = a.end ? parseResumeDate(a.end) : new Date();
    const bEnd = b.end ? parseResumeDate(b.end) : new Date();

    if (!aEnd || !bEnd) return 0;
    return bEnd.getTime() - aEnd.getTime();
  });
}

/**
 * Generate a formatted date range string for display.
 * e.g., "Jan 2022 - Present" or "Jan 2020 - Dec 2022"
 */
export function formatDateRange(start: string, end?: string): string {
  const formatDate = (dateStr: string): string => {
    const date = parseResumeDate(dateStr);
    if (!date) return dateStr;

    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const startFormatted = formatDate(start);
  const endFormatted = end ? formatDate(end) : 'Present';

  return `${startFormatted} - ${endFormatted}`;
}
