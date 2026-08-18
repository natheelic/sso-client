"use server";

/**
 * DB-backed college info + branding — replaces the static COLLEGE constant
 * (survey-data.ts) as the source every consumer reads from. That constant
 * now only serves as the seed value (see prisma/seed.ts).
 */
import { db } from "@/lib/db";

export interface CollegeInfo {
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

export async function getCollegeSettings(): Promise<CollegeInfo> {
  const row = await db.collegeSettings.findUniqueOrThrow({ where: { id: 1 } });
  return {
    name: row.name, nameEn: row.nameEn, affiliation: row.affiliation, province: row.province,
    director: row.director, directorTitle: row.directorTitle,
    signatureImage: row.signatureImage, logoImage: row.logoImage, signatureVariant: row.signatureVariant,
  };
}

export async function saveCollegeInfo(info: {
  name: string; nameEn: string; affiliation: string; province: string; director: string; directorTitle: string;
}): Promise<void> {
  await db.collegeSettings.update({ where: { id: 1 }, data: info });
}

/** Upload (or clear, passing null) the college's real signature image, and/or pick a placeholder variant. */
export async function saveSignature(signatureImage: string | null, signatureVariant: number): Promise<void> {
  await db.collegeSettings.update({ where: { id: 1 }, data: { signatureImage, signatureVariant } });
}

/** Upload (or clear, passing null) the college's real logo/seal image. */
export async function saveLogo(logoImage: string | null): Promise<void> {
  await db.collegeSettings.update({ where: { id: 1 }, data: { logoImage } });
}
