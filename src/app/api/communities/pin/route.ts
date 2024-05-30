import { prisma } from "@/lib/prisma";

export const POST = async (req: Request) => {
  const { user_id, community_id, pinned_user_id } = await req.json();

  const pinned = await prisma.pin.findFirst({
    where: {
      user_id,
      community_id,
      pinned_user_id,
    },
  });

  if (pinned) {
    const updated = await prisma.pin.delete({
      where: {
        id: pinned.id,
      },
    });

    return new Response(
      JSON.stringify({
        message: "Unpinned",
        data: updated,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const created = await prisma.pin.create({
    data: {
      user_id,
      community_id,
      pinned_user_id,
    },
  });

  return new Response(
    JSON.stringify({
      message: "Pinned",
      data: created,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};
