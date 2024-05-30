import { NextApiRequest } from "next";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { validateToken } from "@/lib/session";

export async function GET(req: NextApiRequest) {
  const cookieStore = cookies();
  const userToken = cookieStore.get("token")?.value;

  const userId = validateToken(userToken as string);

  if (!userId) {
    return new Response(
      JSON.stringify({
        message: "Invalid token",
      }),
      { status: 401 }
    );
  }

  const matches = await prisma.match.findMany({
    orderBy: {
      start_date: "asc",
    },
  });

  const teams = await prisma.team.findMany();

  const bets = await prisma.bet.findMany({
    where: {
      user_id: userId as number,
    },
  });

  return new Response(
    JSON.stringify({
      matches,
      teams,
      bets,
    }),
    { status: 200 }
  );
}
