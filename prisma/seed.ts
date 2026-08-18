/**
 * Seeds the four demo activities + questions (from src/lib/survey-data.ts)
 * and the college settings row, so the DB-backed app starts from the same
 * content the mock-data prototype shipped with. Run via `npx prisma db seed`.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ACTIVITIES, COLLEGE } from "../src/lib/survey-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  for (const activity of ACTIVITIES) {
    await db.activity.upsert({
      where: { id: activity.id },
      create: {
        id: activity.id,
        code: activity.code,
        title: activity.title,
        type: activity.type,
        hours: activity.hours,
        location: activity.location,
        dateLabel: activity.dateLabel,
        issueDate: activity.issueDate,
        status: activity.status,
        certTemplate: activity.certTemplate,
        target: activity.target,
        description: activity.description,
        questions: {
          create: activity.questions.map((q, i) => ({
            id: `${activity.id}-${q.id}`,
            type: q.type,
            title: q.title,
            required: q.required,
            options: q.options ?? [],
            order: i,
          })),
        },
      },
      update: {
        code: activity.code,
        title: activity.title,
        type: activity.type,
        hours: activity.hours,
        location: activity.location,
        dateLabel: activity.dateLabel,
        issueDate: activity.issueDate,
        status: activity.status,
        certTemplate: activity.certTemplate,
        target: activity.target,
        description: activity.description,
      },
    });
  }

  await db.collegeSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      name: COLLEGE.name,
      nameEn: COLLEGE.nameEn,
      affiliation: COLLEGE.affiliation,
      province: COLLEGE.province,
      director: COLLEGE.director,
      directorTitle: COLLEGE.directorTitle,
    },
    update: {},
  });

  console.log(`Seeded ${ACTIVITIES.length} activities and college settings.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
