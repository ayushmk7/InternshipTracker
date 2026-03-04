export type ApplicationStatus = "offered" | "oa" | "interviewing";

export interface Application {
  id: string;
  message_id: string;
  inbox_id: string;
  company_name: string | null;
  role_title: string | null;
  status: ApplicationStatus;
  sender_email: string | null;
  subject: string | null;
  email_body_preview: string | null;
  received_at: string;
  created_at: string;
}

export interface ClassificationResult {
  status: ApplicationStatus;
  company_name: string | null;
  role_title: string | null;
}
