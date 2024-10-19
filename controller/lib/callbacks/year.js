import { PrismaClient } from '@prisma/client';
import { logger } from '../../../utils/logger.js';
const prisma = new PrismaClient();

export async function year(data, callbackObj) {
    const courseId = data.substring(0, data.indexOf("/"));
    const annoId = data.substring(courseId.length + 1);
    const chat = callbackObj.from.id;

    let user;
    try{
        user = await prisma.user.update({
            where: {
                chat
            },
            data: {
                courseId,
                annoId
            }
        });
        return { text: "🥳 Corso configurato correttamente!"}
    }
    catch(err){
        logger.warn('Error user configuration: ', {user, data, callbackObj});
        return { text: '⚠️ Errore nella configurazione\nRiprova /start'}
    }
}