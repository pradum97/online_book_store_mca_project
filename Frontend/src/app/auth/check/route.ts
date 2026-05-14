import { requireSession } from "../lib/apiAuthGuard";

export async function GET() {
  const session = await requireSession();

  if (!session) {
    return Response.json({ message: "Session expired" }, { status: 401 });
  }
  return Response.json({ data: "search result" });
}
