import 'dotenv'
import { PrismaClient } from '@prisma/client';
import { getOrari } from './utils/orari.js';
import { formatSchedule } from './utils/formatSchedule.js';
import TelegramBot from './utils/telegramBot.js';

const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN);
const prisma = new PrismaClient();

async function main() {
    telegramBot.onText('/start', async (msg) => {
        try{
            const user = await prisma.user.upsert({
                where: {
                    username: msg.chat.username
                },
                update: {

                },
                create: {
                    username: msg.chat.username,
                    chat: msg.chat.id,
                    lastMessage: '/start',
                    corso: '21-270',
                    anno2: 'PDS0-2012|1'
                }
            });
            
            telegramBot.sendMessage(`Hello ${msg.chat.username}`, msg.chat.id);
        }
        catch(err){
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
}

main();