import { isRecord, objectList, text, textList } from "./parse-json";

export interface CvExperience {
  position: string | null;
  company: string | null;
  location: string | null;
  period: string | null;
  bullets: string[];
}

export interface CvProject {
  name: string | null;
  role: string | null;
  organization: string | null;
  period: string | null;
  description: string | null;
  bullets: string[];
  tools: string[];
}

export interface CvEducation {
  degree: string | null;
  institution: string | null;
  period: string | null;
  detail: string | null;
}

export interface CvSkillGroup {
  label: string | null;
  items: string[];
}

export interface CvContent {
  profileStatement: string | null;
  coreCompetencies: string[];
  experiences: CvExperience[];
  projects: CvProject[];
  educations: CvEducation[];
  skillGroups: CvSkillGroup[];
}

/** Đọc một mục kinh nghiệm từ JSON của model, hỏng thì trả null. */
function parseExperience(value: unknown): CvExperience | null {
  if (!isRecord(value)) return null;
  const experience: CvExperience = {
    position: text(value.position),
    company: text(value.company),
    location: text(value.location),
    period: text(value.period),
    bullets: textList(value.bullets),
  };
  return experience.position || experience.company ? experience : null;
}

/** Đọc một dự án trong CV từ JSON của model, hỏng thì trả null. */
function parseCvProject(value: unknown): CvProject | null {
  if (!isRecord(value)) return null;
  const project: CvProject = {
    name: text(value.name),
    role: text(value.role),
    organization: text(value.organization),
    period: text(value.period),
    description: text(value.description),
    bullets: textList(value.bullets),
    tools: textList(value.tools),
  };
  return project.name || project.bullets.length > 0 ? project : null;
}

/** Đọc một mục học vấn từ JSON của model, hỏng thì trả null. */
function parseEducation(value: unknown): CvEducation | null {
  if (!isRecord(value)) return null;
  const education: CvEducation = {
    degree: text(value.degree),
    institution: text(value.institution),
    period: text(value.period),
    detail: text(value.detail),
  };
  return education.degree || education.institution ? education : null;
}

/** Đọc một nhóm kỹ năng từ JSON của model, hỏng thì trả null. */
function parseSkillGroup(value: unknown): CvSkillGroup | null {
  if (!isRecord(value)) return null;
  const items = textList(value.items);
  return items.length > 0 ? { label: text(value.label), items } : null;
}

/** Đọc nội dung CV do model sinh ra thành cấu trúc an toàn. */
export function parseCvContent(content: unknown): CvContent {
  const root = isRecord(content) ? content : {};
  return {
    profileStatement: text(root.profileStatement),
    coreCompetencies: textList(root.coreCompetencies),
    experiences: objectList(root.experiences, parseExperience),
    projects: objectList(root.projects, parseCvProject),
    educations: objectList(root.educations, parseEducation),
    skillGroups: objectList(root.skillGroups, parseSkillGroup),
  };
}

/** CV đã DONE nhưng không đọc được gì dùng được. */
export function isCvContentEmpty(cv: CvContent): boolean {
  return (
    !cv.profileStatement &&
    cv.coreCompetencies.length === 0 &&
    cv.experiences.length === 0 &&
    cv.projects.length === 0 &&
    cv.educations.length === 0 &&
    cv.skillGroups.length === 0
  );
}

export interface CoverLetterContent {
  salutation: string | null;
  opening: string | null;
  bodyParagraphs: string[];
  motivation: string | null;
  closing: string | null;
}

/** Đọc nội dung thư xin việc do model sinh ra thành cấu trúc an toàn. */
export function parseCoverLetterContent(content: unknown): CoverLetterContent {
  const root = isRecord(content) ? content : {};
  return {
    salutation: text(root.salutation),
    opening: text(root.opening),
    bodyParagraphs: textList(root.bodyParagraphs),
    motivation: text(root.motivation),
    closing: text(root.closing),
  };
}

/** Thư xin việc không có nội dung nào dùng được. */
export function isCoverLetterEmpty(letter: CoverLetterContent): boolean {
  return (
    !letter.salutation &&
    !letter.opening &&
    letter.bodyParagraphs.length === 0 &&
    !letter.motivation &&
    !letter.closing
  );
}

/** Ghép thư xin việc thành văn bản thuần để dán sang email. */
export function coverLetterPlainText(letter: CoverLetterContent): string {
  return [
    letter.salutation,
    letter.opening,
    ...letter.bodyParagraphs,
    letter.motivation,
    letter.closing,
  ]
    .filter((part): part is string => part !== null)
    .join("\n\n");
}

export interface ApplicationEmailSignature {
  name: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
}

export interface ApplicationEmailContent {
  subject: string | null;
  greeting: string | null;
  paragraphs: string[];
  attachmentNote: string | null;
  closing: string | null;
  signOff: string | null;
  signature: ApplicationEmailSignature;
  company: string | null;
  position: string | null;
}

/** Đọc nội dung mail ứng tuyển do model sinh ra thành cấu trúc an toàn. */
export function parseApplicationEmailContent(
  content: unknown,
): ApplicationEmailContent {
  const root = isRecord(content) ? content : {};
  const signature = isRecord(root.signature) ? root.signature : {};
  return {
    subject: text(root.subject),
    greeting: text(root.greeting),
    paragraphs: textList(root.paragraphs),
    attachmentNote: text(root.attachmentNote),
    closing: text(root.closing),
    signOff: text(root.signOff),
    signature: {
      name: text(signature.name),
      email: text(signature.email),
      phone: text(signature.phone),
      title: text(signature.title),
    },
    company: text(root.company),
    position: text(root.position),
  };
}

/** Mail ứng tuyển không có nội dung nào dùng được. */
export function isApplicationEmailEmpty(
  email: ApplicationEmailContent,
): boolean {
  return !email.subject && email.paragraphs.length === 0 && !email.greeting;
}

/** Thân mail dạng văn bản thuần (không kèm tiêu đề) để dán vào hộp soạn thư. */
export function applicationEmailPlainText(
  email: ApplicationEmailContent,
): string {
  const { name, title, phone, email: address } = email.signature;
  const signature = [name, title, phone, address].filter(
    (part): part is string => part !== null,
  );

  return [
    email.greeting,
    ...email.paragraphs,
    email.attachmentNote,
    email.closing,
    email.signOff,
    signature.length > 0 ? signature.join("\n") : null,
  ]
    .filter((part): part is string => part !== null)
    .join("\n\n");
}
