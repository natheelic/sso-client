"use server";

import { signOut } from "@/lib/auth";

/** Sign the participant out of the real SSO session and return to /login. */
export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}
