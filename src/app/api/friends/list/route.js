import client from '@/app/libs/prisma';

import { getServerSession } from 'next-auth';

export async function GET(req) {

  const session = await getServerSession();

  const userId = session.user.id;

  

  const friendships = await client.friendship.findMany({

    where: {

      OR: [{ user1Id: userId }, { user2Id: userId }]

    },

    include: {

      user1: true,

      user2: true

    }

  });

  

  const friends = friendships.map(f => 

    f.user1Id === userId ? f.user2 : f.user1

  );

  

  return Response.json({ friends });

}
