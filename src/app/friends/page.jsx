import { AuthUserSession } from '@/app/libs/auth-libs';

import { redirect } from 'next/navigation';

import FriendsPageClient from '@/app/components/FriendsPageClient';

import Navbar from '@/app/components/Navbar';

export default async function FriendsPage() {

  const user = await AuthUserSession();

  

  if (!user) {

    redirect('/api/auth/signin');

  }

  return (

    <>

      <Navbar user={user} />

      <FriendsPageClient currentUser={user} />

    </>

  );

}
