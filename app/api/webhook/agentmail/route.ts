import { parseSenderEmail } from "@/lib/email-utils";
import { classifyEmail } from "@/lib/classifier";
import { insertApplication } from "@/lib/db";
import { appendToSheet } from "@/lib/sheets";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const eventType =
      (payload.type as string) ?? (payload.event_type as string);

    if (eventType !== "message.received") {
      return Response.json({ ok: true }, { status: 200 });
    }

    const msg = (payload.message ?? {}) as Record<string, unknown>;
    const messageId = (msg.message_id ?? msg.messageId) as string | undefined;
    const inboxId = (msg.inbox_id ?? msg.inboxId) as string | undefined;
    const fromField = String(msg.from_ ?? msg.from ?? "");
    const subject = String(msg.subject ?? "(no subject)");
    const body = String(msg.text ?? msg.body ?? msg.html ?? "");

    if (!messageId || !inboxId) {
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
      await appendToSheet({
        companyName: classification.company_name,
        roleTitle: classification.role_title,
        status: classification.status,
        senderEmail,
        subject,
        receivedAt: new Date().toISOString(),
      }).catch((e) => console.error("Sheets append failed:", e));
    }

    return Response.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return Response.json({ ok: true }, { status: 200 });
  }
}
