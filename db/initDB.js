import { PrismaClient } from '@prisma/client';
import fs from 'fs'

const prisma = new PrismaClient();

export const initDB = async () => {
    const corsi = JSON.parse(fs.readFileSync('./db/corsi.json'));

    corsi.forEach(async (c) => {
        await prisma.course.upsert({
            where: {
                courseId: c.courseId
            },
            update: {
                courseId: c.courseId,
                name: c.name,
                anno: c.anno,
                anno2: c.anno2,
                scuola: c.scuola
            },
            create: {
                courseId: c.courseId,
                name: c.name,
                anno: c.anno,
                anno2: c.anno2,
                scuola: c.scuola
            }
        })
    })
}