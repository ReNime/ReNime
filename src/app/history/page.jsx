import { AuthUserSession } from '@/app/libs/auth-libs';

import { redirect } from 'next/navigation';

import WatchHistoryClient from '@/app/components/WatchHistoryClient';

import Navbar from '@/app/components/Navbar';

export default async function HistoryPage() {

  const user = await AuthUserSession();

  

  if (!user) {

    redirect('/api/auth/signin');

  }

  return (

    <>

      <Navbar user={user} />

      <WatchHistoryClient userId={user.id} />

    </>

  );

}
