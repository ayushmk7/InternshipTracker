import OpenAI from "openai";
import type { ClassificationResult } from "@/types";

function getOpenAI(): OpenAI | null {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export async function classifyEmail(
  subject: string,
  body: string
): Promise<ClassificationResult> {
  const openai = getOpenAI();
  if (!openai) {
    return { status: "interviewing", company_name: null, role_title: null };
  }
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You classify internship-related emails into exactly one status: offered, oa, or interviewing.
- offered: Offer letter, congratulations, next steps for offer acceptance
- oa: Online assessment, coding challenge, HackerRank, Codility, technical test
- interviewing: Interview invite, scheduling, phone/video/onsite interview

Also extract company_name and role_title if mentioned. Return JSON only with keys: status, company_name, role_title.`,
      },
      {
        role: "user",
        content: `Subject: ${subject}\n\nBody:\n${body.slice(0, 4000)}`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const parsed = JSON.parse(
    response.choices[0].message.content ?? "{}"
  ) as Record<string, unknown>;
  const status = ["offered", "oa", "interviewing"].includes(
    String(parsed.status ?? "")
  )
    ? (parsed.status as ClassificationResult["status"])
    : "interviewing";
  return {
    status,
    company_name:
      parsed.company_name != null ? String(parsed.company_name) : null,
    role_title: parsed.role_title != null ? String(parsed.role_title) : null,
  };
}
