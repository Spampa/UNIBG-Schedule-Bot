import 'dotenv'
import { PrismaClient } from '@prisma/client';
import { getOrari } from './utils/orari.js';
import { initDB } from './db/initDB.js';
import { formatSchedule } from './utils/formatSchedule.js';
import { checkUser } from './middlewares/checkUser.js';
import TelegramBot from './utils/telegramBot.js';

const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN);
const prisma = new PrismaClient();

async function main() {
    await initDB();

    telegramBot.onText('/start', async (msg) => {
        try {
            await prisma.user.upsert({
                where: {
                    username: msg.chat.username
                },
                update: {
                    lastMessage: '/start'
                },
                create: {
                    username: msg.chat.username,
                    chat: msg.chat.id,
                    lastMessage: '/start',
                }
            });

            const corsi = await prisma.course.findMany();
            const buttons = [];
            corsi.forEach(c => {
                buttons.push([{text: `${c.name} - Anno ${c.anno}`, callback_data: `initCourse ${c.courseId}:${c.annoId}`}]);
            })

            telegramBot.sendMessage(`Ciao ${msg.chat.first_name} seleziona la tua facoltà`, msg.chat.id, buttons);
        }
        catch (err) {
            console.log('Creation User Error', err);
        }
    })

    telegramBot.onText('/oggi', async (msg) => {
        const isLogged = await checkUser(msg.chat.username);
        if(!isLogged){
            return telegramBot.sendMessage('Utente non registrato esegui /start oppure imposta uno username', msg.chat.id);
        }

        let day = new Date();
        day.setDate(day.getDate());
        day = day.toLocaleDateString();

        const orari = await getOrari(day, msg.chat.username);
        await prisma.user.update({
            where: {
                username: msg.chat.username
            },
            data: {
                lastMessage: '/oggi'
            }
        })
        telegramBot.sendMessage(formatSchedule(orari), msg.chat.id);
    })

    telegramBot.onText('/domani', async (msg) => {
        const isLogged = await checkUser(msg.chat.username);
        if(!isLogged){
            return telegramBot.sendMessage('Utente non registrato esegui /start oppure imposta uno username', msg.chat.id);
        }

        let day = new Date();
        day.setDate(day.getDate() + 1);
        day = day.toLocaleDateString();

        const orari = await getOrari(day, msg.chat.username);
        await prisma.user.update({
            where: {
                username: msg.chat.username
            },
            data: {
                lastMessage: '/domani'
            }
        })
        telegramBot.sendMessage(formatSchedule(orari), msg.chat.id);
    })

    telegramBot.onText('/week', async (msg) => {
        const isLogged = await checkUser(msg.chat.username);
        if(!isLogged){
            return telegramBot.sendMessage('Utente non registrato esegui /start oppure imposta uno username', msg.chat.id);
        }
        
        let day = new Date();
        day.setDate(day.getDate());
        day = day.toLocaleDateString();

        const orari = await getOrari(day, msg.chat.username, true);
        await prisma.user.update({
            where: {
                username: msg.chat.username
            },
            data: {
                lastMessage: '/week'
            }
        })
        telegramBot.sendMessage(formatSchedule(orari), msg.chat.id);
    })

    telegramBot.onText('*', async (msg) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    username: msg.chat.username
                }
            });

            await prisma.user.update({
                where: {
                    username: msg.chat.username
                },
                data: {
                    lastMessage: msg.text
                }
            })


        }
        catch (err) {
            console.log(err);
        }
    });

    telegramBot.onCallBack('initCourse', async (data, callback) => {
        try{
            await prisma.user.update({
                where: {
                    username: callback.message.chat.username
                },
                data: {
                    courseId: data[0],
                    annoId: data[1]
                }
            })
            telegramBot.deleteMessage(callback.message.chat.id, callback.message.message_id);
            telegramBot.sendMessage('✅ Corso configurato correttamente', callback.message.chat.id);
        }
        catch(err){
            console.log('Errore nella creazione corso', err);
        }
    });
}

main();