import { prisma } from "@/lib/prisma";
import { validateToken } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const user_id = validateToken(cookies().get("token")?.value as string);

  if (!user_id)
    return new Response(
      JSON.stringify({
        message: "Unauthorized",
      }),
      { status: 401 }
    );

  const userCommunities = await prisma.communityMembership.findMany({
    where: {
      user_id: user_id as number,
    },
  });

  if (userCommunities.length >= 5) {
    return new Response(
      JSON.stringify({
        message: "User is already a member of 5 communities",
      }),
      { status: 400 }
    );
  }

  const { name } = await req.json();

  const community = await prisma.community.create({
    data: {
      name,
    },
  });

  await prisma.communityMembership.create({
    data: {
      user_id: user_id as number,
      community_id: community.id,
    },
  });

  return new Response(JSON.stringify(community), { status: 200 });
}
