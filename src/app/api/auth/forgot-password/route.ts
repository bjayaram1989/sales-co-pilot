import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists (don't reveal whether they do)
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // In production, send a password reset email here using a service like
      // Resend, SendGrid, or AWS SES. For now, log the intent.
      console.log(`[auth] Password reset requested for ${email}`);

      // TODO: Generate a reset token, store it in the database with an expiry,
      // and email a link like: /reset-password?token=...
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (e) {
    console.error('[auth] forgot-password error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
