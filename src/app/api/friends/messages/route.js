import client from '@/app/libs/prisma';

import { getServerSession } from 'next-auth';

export async function GET(req) {

  const session = await getServerSession();

  const { searchParams } = new URL(req.url);

  const friendId = searchParams.get('friendId');

  

  const messages = await client.message.findMany({

    where: {

      OR: [

        { senderId: session.user.id, receiverId: friendId },

        { senderId: friendId, receiverId: session.user.id }

      ]

    },

    orderBy: { createdAt: 'asc' }

  });

  

  return Response.json({ messages });

}
