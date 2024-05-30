import { NextApiRequest } from "next";
import { prisma } from "@/lib/prisma";
import { parseUrl } from "next/dist/shared/lib/router/utils/parse-url";

export async function GET(req: NextApiRequest) {
  const userId = parseUrl(req.url as string).query.userId;
  const matchId = parseUrl(req.url as string).query.matchId;

  const bet = await prisma.bet.findFirst({
    where: {
      user_id: Number(userId),
      match_id: Number(matchId),
    },
  });

  if (!bet) {
    return new Response(JSON.stringify({}), { status: 404 });
  }

  return new Response(JSON.stringify(bet), { status: 200 });
}

export async function POST(req: Request) {
  const { user_id, match_id, result_home, result_away } = await req.json();

  // Check if the user has already bet on this match
  const existingBet = await prisma.bet.findFirst({
    where: {
      user_id: parseInt(user_id),
      match_id: parseInt(match_id),
    },
  });

  if (existingBet) {
    // Update the existing bet
    const bet = await prisma.bet.update({
      where: {
        id: existingBet.id,
      },
      data: {
        result_home: parseInt(result_home),
        result_away: parseInt(result_away),
      },
    });

    return new Response(JSON.stringify(bet), { status: 200 });
  }

  // Create a new bet
  const bet = await prisma.bet.create({
    data: {
      user_id: parseInt(user_id),
      match_id: parseInt(match_id),
      result_home: parseInt(result_home),
      result_away: parseInt(result_away),
    },
  });

  return new Response(JSON.stringify(bet), { status: 200 });
}
