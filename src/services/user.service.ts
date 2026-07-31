import { prisma } from "@/lib/prisma";
import type { UpdateProfileInput } from "@/lib/validators/user.schema";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Bridges Supabase Auth identities to our own `User` table. Supabase owns
 * credentials/sessions; this table owns everything role/profile-related
 * (see schema.prisma's `User` doc-comment). Called from
 * `app/api/auth/callback/route.ts` right after a successful sign-in.
 */
export async function getOrCreateUserFromSupabase(supabaseUser: SupabaseUser) {
  const existing = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });
  if (existing) return existing;

  // A row may already exist for this email (e.g. an admin pre-invited
  // this person before their first login) without a supabaseId yet —
  // link it instead of creating a duplicate.
  const byEmail = supabaseUser.email
    ? await prisma.user.findUnique({ where: { email: supabaseUser.email } })
    : null;

  if (byEmail) {
    return prisma.user.update({
      where: { id: byEmail.id },
      data: { supabaseId: supabaseUser.id, isEmailVerified: true, lastLoginAt: new Date() },
    });
  }

  const [firstName, ...rest] = (supabaseUser.user_metadata?.full_name as string | undefined)
    ?.split(" ") ?? ["New", "Traveler"];

  return prisma.user.create({
    data: {
      supabaseId: supabaseUser.id,
      email: supabaseUser.email!,
      firstName: firstName || "New",
      lastName: rest.join(" ") || "Traveler",
      isEmailVerified: Boolean(supabaseUser.email_confirmed_at),
      lastLoginAt: new Date(),
    },
  });
}

export async function getUserBySupabaseId(supabaseId: string) {
  return prisma.user.findUnique({ where: { supabaseId } });
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data: input,
  });
}

/**
 * GDPR right-to-erasure: scrubs PII in place rather than deleting the
 * row, since Booking/Payment/Review history must remain referentially
 * intact — see DATABASE_DESIGN.md's User model doc-comment and §13.
 */
export async function anonymizeUser(userId: string) {
  const placeholder = `deleted-user-${userId}@example.invalid`;
  return prisma.user.update({
    where: { id: userId },
    data: {
      email: placeholder,
      phone: null,
      firstName: "Deleted",
      lastName: "User",
      avatarUrl: null,
      isActive: false,
      anonymizedAt: new Date(),
      deletedAt: new Date(),
    },
  });
}
