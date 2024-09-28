import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function school(data) {
    const department = await prisma.department.findMany(
        {
            where: {
                schoolId: data
            }
        }
    );

    const buttons = [];
    department.forEach(d => {
        buttons.push([{ text: `${d.name}`, callback_data: `course:${d.departmentId}` }]);
    });

    return { text: "📜 Ora seleziona la tua facoltà:", buttons}
}