import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function notifyAll(bot, msg) {
    const users = await prisma.user.findMany();

    for(const u of users){
        await bot.sendMessage(msg, u.chat.toString());
    }
}