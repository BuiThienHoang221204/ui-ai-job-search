export { authService } from "./auth";
export { dashboardService } from "./dashboard";
export { applicationsService } from "./applications";
export { jobsService } from "./jobs";
export { matchesService } from "./matches";
export { mockInterviewService } from "./mock-interview";
export { documentsService } from "./documents";
export { interviewService } from "./interview";
export { upskillService } from "./upskill";
export { profileService } from "./profile";
export { profileDraftService } from "./profile-draft";
export { companiesService } from "./companies";

export type {
  AuthResult,
  Paginated,
  QueuedDocument,
  QueuedReport,
  QueuedResult,
  WorkStatus,
} from "./types";

export type {
  JobRecord,
  JobMatchDetail,
  JobListItem,
  JobListParams,
  JobSort,
  JobFilters,
  OccupationOption,
  FilterOption,
  RequirementCheck,
  SalaryBasis,
  SalaryGuide,
  SystemMatch,
} from "./jobs";
export type {
  MockInterviewRecord,
  MockInterviewStatus,
  MockInterviewSummary,
  InterviewStep,
} from "./mock-interview";
export type {
  ApplicationEmailInput,
  CvContentInput,
  CvLayout,
  CvLanguage,
  CvSectionKey,
  CvSourceInput,
  CvTemplate,
  DocumentKind,
  DocumentRecord,
} from "./documents";
export type {
  AnswerFeedback,
  AnswerKind,
  InterviewPrepRecord,
  InterviewPrepSummary,
  PrepAnswer,
  PrepApplication,
  SavedAnswer,
} from "./interview";
export type { UpskillReportRecord } from "./upskill";
export type { ProfileRecord, QuickStartInput } from "./profile";
export type {
  CvUploadReceipt,
  ProfileDraftRecord,
  ProfileProposal,
  ProposedCertificate,
  ProposedEducation,
  ProposedExperience,
  ProposedProject,
} from "./profile-draft";
export type {
  BriefConfidence,
  BriefQueued,
  BriefSource,
  CompanyBriefRecord,
  CompanyBriefView,
  CompanyVerdict,
} from "./companies";
