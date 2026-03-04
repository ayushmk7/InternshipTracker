import { getStats } from "@/lib/db";

export async function GET() {
  const rows = await getStats();
  const stats = { offered: 0, oa: 0, interviewing: 0 };
  for (const row of rows) {
    if (row.status in stats) {
      (stats as Record<string, number>)[row.status] = parseInt(row.count, 10);
    }
  }
  return Response.json(stats);
}
