import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    // If not logged in, return false
    if (!session?.user?.email) {
      return NextResponse.json({ isAdmin: false });
    }

    // Get admin emails from environment variable (server-side only)
    const adminEmailsEnv = process.env.ADMIN_EMAILS || '';
    const adminEmails = adminEmailsEnv.split(',').map(e => e.trim()).filter(e => e);
    
    // Check if user email is in admin list
    const isAdmin = adminEmails.includes(session.user.email);

    console.log('Admin check:', {
      userEmail: session.user.email,
      adminEmails: adminEmails,
      isAdmin: isAdmin
    });

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
