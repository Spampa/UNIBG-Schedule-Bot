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
        return { text: "🥳 Corso configurato correttamente!\n <b>Ora sei pronto per usare i comandi!</b>\n- /oggi per gli orari di oggi,\n- /domani per gli orari di domani,\n- /week per gli orari della settimana,\n- /nextweek per gli orari della prossima setimana,\n- /classe per sapere se una classe è libera o c'è lezione"}
    }
    catch(err){
        logger.warn('Error user configuration: ', {user, data, callbackObj});
        return { text: '⚠️ Errore nella configurazione\nRiprova /start'}
    }
}