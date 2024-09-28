import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function course(data) {
    const course = await prisma.course.findMany(
        {
            where: {
                departmentId: parseInt(data)
            },
            orderBy: {
                anno: 'asc'
            }
        }
    );

    const buttons = [];
    course.forEach(c => {
        buttons.push([{ text: `${c.anno}`, callback_data: `year:${c.courseId}/${c.annoId}` }]);
    });

    return { text: "🕕 Seleziona l'anno :", buttons}
}