// Create a function where the user_id is passed in the post request and it creates a new entry in the communitymembership table

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { user_id, community_id } = await req.json();

  // check if user is already a member of the community and joined less than 5 communities
  const userCommunities = await prisma.communityMembership.findMany({
    where: {
      user_id: user_id,
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

  const userAlreadyJoined = userCommunities.find(
    (community) => community.community_id === community_id
  );

  if (userAlreadyJoined) {
    return new Response(
      JSON.stringify({
        message: "User is already a member of this community",
      }),
      { status: 400 }
    );
  }

  const communityJoined = await prisma.communityMembership.create({
    data: {
      user_id: user_id,
      community_id: community_id,
    },
  });

  return new Response(JSON.stringify(communityJoined), { status: 200 });
}
