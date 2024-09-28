import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function year(data, callbackObj) {
    const courseId = data.substring(0, data.indexOf("/"));
    const annoId = data.substring(courseId.length + 1);
    const username = callbackObj.from.username;

    try{
        await prisma.user.upsert({
            where: {
                username
            },
            update: {
                courseId,
                annoId,
                time: new Date().toISOString()
            },
            create: {
                username,
                chat: callbackObj.from.id,
                lastMessage: '/start',
                courseId,
                annoId
            }
        });
        return { text: "🥳 Corso configurato correttamente!"}
    }
    catch(err){
        console.log(err);
        return { text: '⚠️ Errore nella configurazione\nRiprova /start'}
    }
}