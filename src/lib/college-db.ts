"use server";

/**
 * DB-backed college info + branding, now scoped by College (was the
 * singleton CollegeSettings row before roadmap Phase 5.1's migration).
 *
 * getDefaultCollegeId() is a temporary single-tenant shim: until Phase 5.4
 * builds real per-admin-session "which college am I managing" context
 * (backed by Membership), every write in this app still only ever touches
 * the one migrated college. Everything that calls it is marked so it's easy
 * to find and replace.
 */
import { db } from "@/lib/db";

export interface CollegeInfo {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  affiliation: string;
  province: string;
  director: string;
  directorTitle: string;
  /** data: URI of an uploaded signature PNG, or null to use the built-in placeholder. */
  signatureImage: string | null;
  /** data: URI of an uploaded logo/seal PNG, or null to use the built-in placeholder. */
  logoImage: string | null;
  /** Which placeholder squiggle to show when signatureImage is null. */
  signatureVariant: number;
}

function toCollegeInfo(row: {
  id: string; slug: string; name: string; nameEn: string; affiliation: string; province: string;
  director: string; directorTitle: string; signatureImage: string | null; logoImage: string | null;
  signatureVariant: number;
}): CollegeInfo {
  return {
    id: row.id, slug: row.slug, name: row.name, nameEn: row.nameEn, affiliation: row.affiliation,
    province: row.province, director: row.director, directorTitle: row.directorTitle,
    signatureImage: row.signatureImage, logoImage: row.logoImage, signatureVariant: row.signatureVariant,
  };
}

/** TEMPORARY single-tenant shim — see file header. Replaced in Phase 5.4 by real per-session college context. */
export async function getDefaultCollegeId(): Promise<string> {
  const row = await db.college.findFirstOrThrow({ where: { status: "active" }, orderBy: { createdAt: "asc" } });
  return row.id;
}

export async function getCollegeSettings(): Promise<CollegeInfo> {
  const collegeId = await getDefaultCollegeId();
  const row = await db.college.findUniqueOrThrow({ where: { id: collegeId } });
  return toCollegeInfo(row);
}

export async function getCollegeBySlug(slug: string): Promise<CollegeInfo | null> {
  const row = await db.college.findUnique({ where: { slug } });
  return row ? toCollegeInfo(row) : null;
}

export async function saveCollegeInfo(info: {
  name: string; nameEn: string; affiliation: string; province: string; director: string; directorTitle: string;
}): Promise<void> {
  const collegeId = await getDefaultCollegeId();
  await db.college.update({ where: { id: collegeId }, data: info });
}

/** Upload (or clear, passing null) the college's real signature image, and/or pick a placeholder variant. */
export async function saveSignature(signatureImage: string | null, signatureVariant: number): Promise<void> {
  const collegeId = await getDefaultCollegeId();
  await db.college.update({ where: { id: collegeId }, data: { signatureImage, signatureVariant } });
}

/** Upload (or clear, passing null) the college's real logo/seal image. */
export async function saveLogo(logoImage: string | null): Promise<void> {
  const collegeId = await getDefaultCollegeId();
  await db.college.update({ where: { id: collegeId }, data: { logoImage } });
}
