import { prisma } from "@/lib/prisma";
import { validateToken } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const user_id = validateToken(cookies().get("token")?.value as string);

  if (!user_id)
    return new Response(
      JSON.stringify({
        message: "Unauthorized",
      }),
      { status: 401 }
    );

  const communities = await prisma.community.findMany();

  const userCommunityMembership = await prisma.communityMembership.findMany({
    where: {
      user_id: user_id as number,
    },
  });

  const userCommunites = await prisma.community.findMany({
    where: {
      id: {
        in: userCommunityMembership.map((community) => community.community_id),
      },
    },
  });

  return new Response(
    JSON.stringify({
      communities: communities,
      userCommunities: userCommunites,
    }),
    { status: 200 }
  );
}
