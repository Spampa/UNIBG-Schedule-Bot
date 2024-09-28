import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function findClassroom(user){
    const classrooms = await prisma.schedule.findMany({
        distinct: ['classroom'],
        where: {
            courseAnnoId: user.annoId,
            courseId: user.courseId
        },
        select: {
            classroom: true
        },
        orderBy: {
            classroom: 'asc'
        }
    });

    const buttons = [];
    classrooms.forEach(c => {
        buttons.push([{ text: `${c.classroom}`, callback_data: `class:${c.classroom}` }]);
    });

    return { text: '🏫 Dimmi di quale aula vuoi sapere che lezione si sta svolgendo?', buttons }
}