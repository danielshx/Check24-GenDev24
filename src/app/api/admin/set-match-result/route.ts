import { NextApiRequest } from "next";
import { prisma } from "@/lib/prisma";
import { parseUrl } from "next/dist/shared/lib/router/utils/parse-url";

export async function POST(req: Request) {
  const {  match_id, result_home, result_away } = await req.json();

  const match = await prisma.match.findFirst({
    where: {
      id: parseInt(match_id),
    },
  });

  if (!match) {
    return new Response(JSON.stringify({}), { status: 404 });
  }

  // update match result
  const updatedMatch = await prisma.match.update({
    where: {
      id: parseInt(match_id),
    },
    data: {
      result_home: parseInt(result_home),
      result_away: parseInt(result_away),
    },
  });

  return new Response(JSON.stringify(updatedMatch), { status: 200 });
}
