/**
 * Seeds one college (slug "licec") and its four demo activities + questions
 * (from src/lib/survey-data.ts), so the DB-backed app starts from the same
 * content the mock-data prototype shipped with. Run via `npx prisma db seed`.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { ACTIVITIES, COLLEGE } from "../src/lib/survey-data";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const college = await db.college.upsert({
    where: { slug: "licec" },
    create: {
      id: "college-licec",
      slug: "licec",
      name: COLLEGE.name,
      nameEn: COLLEGE.nameEn,
      affiliation: COLLEGE.affiliation,
      province: COLLEGE.province,
      director: COLLEGE.director,
      directorTitle: COLLEGE.directorTitle,
      status: "active",
    },
    update: {},
  });

  for (const activity of ACTIVITIES) {
    await db.activity.upsert({
      where: { id: activity.id },
      create: {
        id: activity.id,
        collegeId: college.id,
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

  console.log(`Seeded 1 college and ${ACTIVITIES.length} activities.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
