import { getApplicationById, updateApplicationStatus } from "@/lib/db";
import type { ApplicationStatus } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(application);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json()) as { status?: string };
  const status = body.status as ApplicationStatus | undefined;

  const validStatuses: ApplicationStatus[] = [
    "offered",
    "oa",
    "interviewing",
  ];
  if (!status || !validStatuses.includes(status)) {
    return Response.json(
      { error: "Invalid status. Use: offered, oa, interviewing" },
      { status: 400 }
    );
  }

  const application = await updateApplicationStatus(id, status);
  if (!application) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json(application);
}
