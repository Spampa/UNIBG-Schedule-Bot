import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function start(messageObj){
    //create user
    await prisma.user.upsert({
        where: {
            chat: messageObj.chat.id
        },
        update: {
            username: messageObj.chat.username,
            time: new Date().toISOString(),
            lastMessage: '/start',
        },
        create: {
            chat: messageObj.chat.id,
            username: messageObj.chat.username,
            time: new Date().toISOString(),
            lastMessage: '/start',
        }
    });

    let msg = `👋 Ciao <b>${messageObj.chat.first_name}</b>.\n`;
    msg += `Benvenuto al <b>Bot Orari UNIBG</b> con il quale potrai avere sempre a portata di mano i tuoi orari universitari!\n\n`;
    msg += `🏫 Per iniziare seleziona la tua scuola.`;

    const schools = await prisma.school.findMany();
    const buttons = [];
    schools.forEach(s => {
        buttons.push([{ text: `${s.name}`, callback_data: `school:${s.schoolId}` }]);
    })

    return {
        text: msg,
        buttons
    }
}