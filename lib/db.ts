import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { Application, ApplicationStatus } from "@/types";

function getSql(): NeonQueryFunction<false, false> | null {
  const url = process.env.POSTGRES_URL;
  if (!url) return null;
  return neon(url);
}

export interface InsertApplicationData {
  messageId: string;
  inboxId: string;
  companyName?: string | null;
  roleTitle?: string | null;
  status: string;
  senderEmail: string;
  subject: string;
  emailBodyPreview?: string | null;
}

export async function insertApplication(
  data: InsertApplicationData
): Promise<Application | null> {
  const sql = getSql();
  if (!sql) return null;
  const result = await sql`
    INSERT INTO internship_applications (
      message_id, inbox_id, company_name, role_title,
      status, sender_email, subject, email_body_preview
    ) VALUES (
      ${data.messageId},
      ${data.inboxId},
      ${data.companyName ?? null},
      ${data.roleTitle ?? null},
      ${data.status},
      ${data.senderEmail},
      ${data.subject},
      ${data.emailBodyPreview ?? null}
    )
    ON CONFLICT (message_id) DO NOTHING
    RETURNING id, message_id, inbox_id, company_name, role_title, status,
              sender_email, subject, email_body_preview, received_at, created_at
  `;
  const row = result[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  return mapRowToApplication(row);
}

export interface ListApplicationsFilters {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function listApplications(
  filters?: ListApplicationsFilters
): Promise<Application[]> {
  const limit = Math.min(filters?.limit ?? 50, 100);
  const offset = filters?.offset ?? 0;
  const sql = getSql();
  if (!sql) return [];

  if (filters?.status && filters?.search) {
    const searchPattern = `%${filters.search}%`;
    const result = await sql`
      SELECT id, message_id, inbox_id, company_name, role_title, status,
             sender_email, subject, email_body_preview, received_at, created_at
      FROM internship_applications
      WHERE status = ${filters.status}
        AND (company_name ILIKE ${searchPattern} OR subject ILIKE ${searchPattern})
      ORDER BY received_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    return result.map((row) => mapRowToApplication(row as Record<string, unknown>));
  }

  if (filters?.status) {
    const result = await sql`
      SELECT id, message_id, inbox_id, company_name, role_title, status,
             sender_email, subject, email_body_preview, received_at, created_at
      FROM internship_applications
      WHERE status = ${filters.status}
      ORDER BY received_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    return result.map((row) => mapRowToApplication(row as Record<string, unknown>));
  }

  if (filters?.search) {
    const searchPattern = `%${filters.search}%`;
    const result = await sql`
      SELECT id, message_id, inbox_id, company_name, role_title, status,
             sender_email, subject, email_body_preview, received_at, created_at
      FROM internship_applications
      WHERE company_name ILIKE ${searchPattern} OR subject ILIKE ${searchPattern}
      ORDER BY received_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    return result.map((row) => mapRowToApplication(row as Record<string, unknown>));
  }

  const result = await sql`
    SELECT id, message_id, inbox_id, company_name, role_title, status,
           sender_email, subject, email_body_preview, received_at, created_at
    FROM internship_applications
    ORDER BY received_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  return result.map((row) => mapRowToApplication(row as Record<string, unknown>));
}

export async function getApplicationById(id: string): Promise<Application | null> {
  const sql = getSql();
  if (!sql) return null;
  const result = await sql`
    SELECT id, message_id, inbox_id, company_name, role_title, status,
           sender_email, subject, email_body_preview, received_at, created_at
    FROM internship_applications
    WHERE id = ${id}
  `;
  const row = result[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  return mapRowToApplication(row);
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<Application | null> {
  const sql = getSql();
  if (!sql) return null;
  const result = await sql`
    UPDATE internship_applications
    SET status = ${status}
    WHERE id = ${id}
    RETURNING id, message_id, inbox_id, company_name, role_title, status,
              sender_email, subject, email_body_preview, received_at, created_at
  `;
  const row = result[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  return mapRowToApplication(row);
}

export async function getStats(): Promise<{ status: string; count: string }[]> {
  const sql = getSql();
  if (!sql) return [];
  const result = await sql`
    SELECT status, COUNT(*)::text as count
    FROM internship_applications
    GROUP BY status
  `;
  return result as { status: string; count: string }[];
}

function mapRowToApplication(row: Record<string, unknown>): Application {
  return {
    id: String(row.id),
    message_id: String(row.message_id),
    inbox_id: String(row.inbox_id),
    company_name: row.company_name != null ? String(row.company_name) : null,
    role_title: row.role_title != null ? String(row.role_title) : null,
    status: row.status as Application["status"],
    sender_email: row.sender_email != null ? String(row.sender_email) : null,
    subject: row.subject != null ? String(row.subject) : null,
    email_body_preview:
      row.email_body_preview != null ? String(row.email_body_preview) : null,
    received_at: String(row.received_at),
    created_at: String(row.created_at),
  };
}
