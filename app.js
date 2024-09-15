import 'dotenv'
import { PrismaClient } from '@prisma/client';
import { getOrari } from './utils/orari.js';
import { initDB } from './db/initDB.js';
import { formatSchedule } from './utils/formatSchedule.js';
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
            })
            telegramBot.sendMessage(`Ciao ${msg.chat.first_name} seleziona la tua facoltà`, msg.chat.id, [
                {
                    text: 'Ingegneria Informatica - Anno 1',
                    callback_data: 'initCourse 21-270'
                },
                {
                    text: 'Ingegneria Meccanica - Anno 1',
                    callback_data: 'initCourse 23-270'
                }
            ]);
        }
        catch (err) {
            console.log('Creation User Error', err);
        }
    })

    telegramBot.onText('/orario', async (msg) => {
        let day = new Date();
        day.setDate(day.getDate() + 1);
        day = day.toLocaleDateString().replace(new RegExp('/', 'g'), '-');

        const orari = await getOrari(day, msg.chat.username);
        telegramBot.sendMessage(formatSchedule(orari, day), msg.chat.id);
    })

    telegramBot.onText('*', async (msg) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    username: msg.chat.username
                }
            });

            if (user.lastMessage === '/start') {
                const params = msg.text.split(' ');
                await prisma.course.create({
                    data: {
                        userId: user.id,
                        corso: params[0],
                        anno2: params[1],
                        scuola: params[2]
                    }
                });
            }

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
                    courseId: data
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