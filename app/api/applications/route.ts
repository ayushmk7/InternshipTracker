import { listApplications } from "@/lib/db";
import type { ApplicationStatus } from "@/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as ApplicationStatus | null;
  const search = searchParams.get("search");
  const limit = Math.min(
    parseInt(searchParams.get("limit") ?? "50", 10),
    100
  );
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const validStatuses: ApplicationStatus[] = [
    "offered",
    "oa",
    "interviewing",
  ];
  const filterStatus =
    status && validStatuses.includes(status) ? status : undefined;

  const applications = await listApplications({
    status: filterStatus,
    search: search ?? undefined,
    limit,
    offset,
  });

  return Response.json({ applications });
}
