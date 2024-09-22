import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function notifyScheduleChanges(bot, msg, course, anno) {
    const users = await prisma.user.findMany({
        where: {
            courseId: course,
            annoId: anno
        },
        select: {
            chat: true
        }
    });

    users.forEach(u => {
        bot.sendMessage(msg, u.chat.toString());
    })
}