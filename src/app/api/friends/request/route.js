import client from '@/app/libs/prisma';

import { getServerSession } from 'next-auth';

export async function POST(req) {

  const session = await getServerSession();

  const { receiverId } = await req.json();

  

  const request = await client.friendRequest.create({

    data: {

      senderId: session.user.id,

      receiverId,

      status: 'pending'

    }

  });

  

  return Response.json({ request });

}
