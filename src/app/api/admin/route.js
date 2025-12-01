const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
const isAdmin = adminEmails.includes(session.user.email);
return NextResponse.json({ isAdmin });
