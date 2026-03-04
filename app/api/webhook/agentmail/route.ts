import { parseSenderEmail } from "@/lib/email-utils";
import { classifyEmail } from "@/lib/classifier";
import { insertApplication } from "@/lib/db";
import { appendToSheet } from "@/lib/sheets";

function normalizeFrom(from: unknown): string {
  if (Array.isArray(from) && from.length > 0) return String(from[0]);
  return String(from ?? "");
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const eventType =
      (payload.type as string) ?? (payload.event_type as string);

    if (eventType !== "message.received") {
      return Response.json({ ok: true }, { status: 200 });
    }

    const msg = (payload.message ?? payload.data ?? {}) as Record<string, unknown>;
    const messageId = (msg.message_id ?? msg.messageId) as string | undefined;
    const inboxId = (msg.inbox_id ?? msg.inboxId) as string | undefined;
    const fromField = normalizeFrom(msg.from_ ?? msg.from);
    const subject = String(msg.subject ?? "(no subject)");
    const body = String(msg.text ?? msg.body ?? msg.html ?? "");

    if (!messageId || !inboxId) {
      console.warn("[webhook/agentmail] Skipped: missing messageId or inboxId", {
        messageId,
        inboxId,
        keys: Object.keys(msg),
      });
      return Response.json({ ok: true }, { status: 200 });
    }

    const senderEmail = parseSenderEmail(fromField);
    const classification = await classifyEmail(subject, body);
    const inserted = await insertApplication({
      messageId,
      inboxId,
      companyName: classification.company_name,
      roleTitle: classification.role_title,
      status: classification.status,
      senderEmail,
      subject,
      emailBodyPreview: body.slice(0, 500),
    });

    if (inserted) {
      console.log("[webhook/agentmail] Inserted application", {
        messageId,
        company: classification.company_name,
        status: classification.status,
      });
      await appendToSheet({
        companyName: classification.company_name,
        roleTitle: classification.role_title,
        status: classification.status,
        senderEmail,
        subject,
        receivedAt: new Date().toISOString(),
      }).catch((e) => console.error("Sheets append failed:", e));
    } else {
      console.log("[webhook/agentmail] Skipped insert (duplicate or DB unavailable)", {
        messageId,
      });
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[webhook/agentmail] Error:", err);
    return Response.json({ ok: true }, { status: 200 });
  }
}
