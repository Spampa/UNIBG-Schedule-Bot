import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function start(messageObj){
    let msg = `👋 Ciao ${messageObj.chat.first_name}.\n`;
    msg += `Benevnuto al <b>Bot Orari UNIBG</b> con il quale potrai avere sempre a portata di mano i tuoi orari universitari!\n\n`;
    msg += `🏫 Per iniziare ora seleziona la tua scuola.`;

    const schools = await prisma.school.findMany();
    const buttons = [];
    schools.forEach(s => {
        buttons.push([{ text: `${s.name}`, callback_data: `initSchool${s.schoolId}` }]);
    })

    return {
        text: msg,
        buttons
    }
}