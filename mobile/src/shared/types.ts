// ─── Enums (mirroring Prisma schema) ───

export type Role = "USER" | "ADMIN" | "OWNER" | "MANAGER" | "FIELD_WORKER" | "BOOKKEEPER";
export type Trade = "PLUMBING" | "ELECTRICAL" | "HVAC" | "GENERAL" | "EPA" | "LEAD_SAFE";
export type RenewalCycle = "ANNUAL" | "BIENNIAL" | "TRIENNIAL" | "FIVE_YEAR" | "ONE_TIME" | "VARIES";
export type RegulationCategory = "LICENSE_RENEWAL" | "CONTINUING_EDUCATION" | "INSURANCE" | "BONDING" | "EPA_CERTIFICATION" | "SAFETY_TRAINING" | "PERMIT" | "REGISTRATION";
export type DeadlineStatus = "UPCOMING" | "DUE_SOON" | "OVERDUE" | "COMPLETED" | "SKIPPED";
export type ComplianceAction = "PDF_GENERATED" | "EMAIL_SENT" | "DEADLINE_COMPLETED" | "DEADLINE_CREATED" | "PROFILE_UPDATED" | "REGULATION_ADDED" | "DOCUMENT_CREATED" | "DOCUMENT_SENT" | "DOCUMENT_SIGNED" | "AUTO_FILED" | "CE_COMPLETED" | "FOLLOW_UP_SENT" | "BULK_GENERATED";
export type SubscriptionStatus = "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE" | "TRIALING";
export type ProjectStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type DocumentCategory = "TAX" | "PERMIT" | "LIEN_WAIVER" | "INSURANCE" | "CONTRACT" | "CHANGE_ORDER" | "INVOICE" | "SAFETY" | "COMPLIANCE" | "PROPOSAL" | "CERTIFICATE" | "OTHER";
export type DocumentStatus = "DRAFT" | "GENERATED" | "SENT" | "PENDING_SIGNATURE" | "SIGNED" | "FILED";
export type SignatureStatus = "PENDING" | "SIGNED" | "DECLINED" | "EXPIRED";
export type ExpenseCategory = "MATERIALS" | "LABOR" | "PERMITS" | "INSURANCE" | "EQUIPMENT" | "FUEL" | "OFFICE" | "OTHER";
export type NotificationChannel = "EMAIL" | "SMS" | "PUSH" | "IN_APP";
export type NotificationType = "DEADLINE_ALERT" | "AUTO_FILED" | "DOCUMENT_SIGNED" | "PAYMENT_RECEIVED" | "CE_REMINDER" | "FOLLOW_UP" | "SYSTEM";

// ─── Auth ───

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  onboardingComplete: boolean;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

// ─── Business Profile ───

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  responsiblePerson: string;
  taxId?: string;
  licenseNumbers: Record<string, string>;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiration?: string;
  bondAmount?: string;
  bondProvider?: string;
  bondExpiration?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Regulations ───

export interface Regulation {
  id: string;
  trade: Trade;
  state: string;
  title: string;
  description: string;
  authority: string;
  officialEmail?: string;
  portalUrl?: string;
  fee?: string;
  renewalCycle: RenewalCycle;
  category: RegulationCategory;
  defaultDueMonth?: number;
  defaultDueDay?: number;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserRegulation {
  id: string;
  userId: string;
  regulationId: string;
  customNotes?: string;
  createdAt: string;
  regulation: Regulation;
}

// ─── Deadlines ───

export interface UserDeadline {
  id: string;
  nextDueDate: string;
  status: DeadlineStatus;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  regulation: {
    id: string;
    title: string;
    authority: string;
    trade: Trade;
    state: string;
    fee?: string;
    portalUrl?: string;
    category: RegulationCategory;
    renewalCycle: RenewalCycle;
    description: string;
    officialEmail?: string;
    notes?: string;
  };
}

export interface DeadlinesResponse {
  deadlines: UserDeadline[];
  total: number;
  params: {
    days: number;
    status?: DeadlineStatus;
  };
}

// ─── Compliance ───

export interface ComplianceScore {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: {
    deadlines: { score: number; max: number; count: number };
    ceCredits: { score: number; max: number; totalHours: number; count: number };
    insurance: { score: number; max: number };
    filings: { score: number; max: number; recent: number; quarter: number };
  };
}

export interface ComplianceLog {
  id: string;
  userId: string;
  regulationId?: string;
  action: ComplianceAction;
  details?: Record<string, unknown>;
  pdfUrl?: string;
  createdAt: string;
  regulation?: {
    id: string;
    title: string;
    authority: string;
    trade: Trade;
    state: string;
  };
}

// ─── Documents ───

export interface Document {
  id: string;
  userId: string;
  clientId?: string;
  projectId?: string;
  templateSlug: string;
  category: DocumentCategory;
  title: string;
  data: Record<string, string>;
  status: DocumentStatus;
  sentAt?: string;
  sentTo?: string;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string; companyName?: string };
  project?: { id: string; name: string };
  signatures?: Signature[];
  files?: FileUpload[];
}

export interface Signature {
  id: string;
  documentId: string;
  signerName: string;
  signerEmail?: string;
  status: SignatureStatus;
  signedAt?: string;
}

export interface FileUpload {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  createdAt: string;
}

export interface DocumentTemplate {
  slug: string;
  name: string;
  category: DocumentCategory;
  description: string;
  fields: DocumentTemplateField[];
}

export interface DocumentTemplateField {
  name: string;
  label: string;
  type: "text" | "email" | "date" | "number" | "currency" | "select" | "textarea" | "checkbox";
  required?: boolean;
  section?: string;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

// ─── Clients ───

export interface Client {
  id: string;
  userId: string;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  taxId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Projects ───

export interface Project {
  id: string;
  userId: string;
  clientId?: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  startDate?: string;
  endDate?: string;
  contractAmount?: number;
  status: ProjectStatus;
  permitNumber?: string;
  createdAt: string;
  updatedAt: string;
  client?: { id: string; name: string; companyName?: string };
}

// ─── CE Credits ───

export interface CECredit {
  id: string;
  userId: string;
  regulationId?: string;
  courseName: string;
  provider?: string;
  hours: number;
  completedAt: string;
  expiresAt?: string;
  certificateUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  regulation?: { id: string; title: string };
}

// ─── Expenses ───

export interface Expense {
  id: string;
  userId: string;
  projectId?: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  vendor?: string;
  receiptUrl?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; name: string };
}

// ─── Team ───

export interface TeamMember {
  id: string;
  ownerId: string;
  memberId: string;
  role: Role;
  active: boolean;
  createdAt: string;
  member: {
    id: string;
    name: string | null;
    email: string;
  };
}

// ─── Subscription ───

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

// ─── Notifications ───

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  channel: NotificationChannel;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  smsPhone?: string;
  alertDays: number[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
}
