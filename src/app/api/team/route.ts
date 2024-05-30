import { NextApiRequest } from "next";
import { prisma } from "@/lib/prisma";
import { parseUrl } from "next/dist/shared/lib/router/utils/parse-url";

export async function GET(req: NextApiRequest) {
  const teamId = parseUrl(req.url as string).query.id;

  const team = await prisma.team.findUnique({
    where: {
      id: Number(teamId),
    },
  });

  return new Response(JSON.stringify(team), { status: 200 });
}
