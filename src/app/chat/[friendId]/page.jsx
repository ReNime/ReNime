import { AuthUserSession } from '@/app/libs/auth-libs';

import { redirect } from 'next/navigation';

import client from '@/app/libs/prisma';

import ChatWindowClient from '@/app/components/ChatWindowClient';

import Navbar from '@/app/components/Navbar';

export default async function ChatPage({ params }) {

  const user = await AuthUserSession();

  

  if (!user) {

    redirect('/api/auth/signin');

  }

  const friend = await client.user.findUnique({

    where: { id: params.friendId }

  });

  if (!friend) {

  redirect('/friends');

  }

  return (

    <>

      <Navbar user={user} />

      <ChatWindowClient friend={friend} currentUser={user} />

    </>

  );

}
