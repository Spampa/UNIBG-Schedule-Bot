import 'dotenv'
import { PrismaClient } from '@prisma/client';
import { getOrari } from './utils/orari.js';
import { initDB } from './db/initDB.js';
import { formatSchedule } from './utils/formatSchedule.js';
import { checkUser } from './middlewares/checkUser.js';
import { now } from './utils/now.js';
import TelegramBot from './utils/telegramBot.js';

const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN);
const prisma = new PrismaClient();

async function main() {
    await initDB();

    telegramBot.onText('/start', async (msg) => {
        if(!msg.chat.username){
            return telegramBot.sendMessage(`⚠️Imposta uno username`, msg.chat.id);
        }
        try {
            await prisma.user.upsert({
                where: {
                    username: msg.chat.username
                },
                update: {
                    time: now(),
                    lastMessage: '/start'
                },
                create: {
                    username: msg.chat.username,
                    chat: msg.chat.id,
                    lastMessage: '/start',
                }
            });

            const schools = await prisma.school.findMany();
            const buttons = [];
            schools.forEach(s => {
                buttons.push([{text: `${s.name}`, callback_data: `initSchool${s.schoolId}`}]);
            })

            telegramBot.sendMessage(`Ciao ${msg.chat.first_name} seleziona la tua scuola`, msg.chat.id, buttons);
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
        day = day.toLocaleDateString('it-IT');

        const orari = await getOrari(day, msg.chat.username);
        await prisma.user.update({
            where: {
                username: msg.chat.username
            },
            data: {
                time: now(),
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
        day = day.toLocaleDateString('it-IT');

        const orari = await getOrari(day, msg.chat.username);
        await prisma.user.update({
            where: {
                username: msg.chat.username
            },
            data: {
                time: now(),
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
        day = day.toLocaleDateString('it-IT');

        const orari = await getOrari(day, msg.chat.username, true);
        await prisma.user.update({
            where: {
                username: msg.chat.username
            },
            data: {
                time: now(),
                lastMessage: '/week'
            }
        })
        telegramBot.sendMessage(formatSchedule(orari), msg.chat.id);
    });

    telegramBot.onText('/nextweek', async (msg) => {
        const isLogged = await checkUser(msg.chat.username);
        if(!isLogged){
            return telegramBot.sendMessage('Utente non registrato esegui /start oppure imposta uno username', msg.chat.id);
        }
        
        let day = new Date();
        day.setDate(day.getDate() + 7);
        day = day.toLocaleDateString('it-IT');

        const orari = await getOrari(day, msg.chat.username, true);
        await prisma.user.update({
            where: {
                username: msg.chat.username
            },
            data: {
                time: now(),
                lastMessage: '/nextweek'
            }
        })
        telegramBot.sendMessage(formatSchedule(orari), msg.chat.id);
    });

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
                    time: Date.now(),
                    lastMessage: msg.text
                }
            })


        }
        catch (err) {
            console.log(err);
        }
    });

    telegramBot.onCallBack('initSchool', async (data, callback) => {
        try{
            const department = await prisma.department.findMany({
                where: {
                    schoolId: data[0]
                }
            })

            const buttons = [];
            department.forEach(d => {
                buttons.push([{text: `${d.name}`, callback_data: `initCourse${d.departmentId}`}]);
            })
            telegramBot.deleteMessage(callback.message.chat.id, callback.message.message_id);
            telegramBot.sendMessage(`📑 Seleziona la tua facoltà`, callback.message.chat.id, buttons);
        }
        catch(err){
            console.log('Errore nella creazione corso', err);
        }
    });

    telegramBot.onCallBack('initCourse', async (data, callback) => {
        try{
            const course = await prisma.course.findMany({
                where: {
                    departmentId: parseInt(data[0])
                },
                orderBy: {
                    anno: 'asc'
                }
            });

            const buttons = [];
            course.forEach(c => {
                buttons.push([{text: `${c.anno}`, callback_data: `initYear${c.courseId}:${c.annoId}`}]);
            })
            telegramBot.deleteMessage(callback.message.chat.id, callback.message.message_id);
            telegramBot.sendMessage(`📑 Seleziona anno`, callback.message.chat.id, buttons);
        }
        catch(err){
            console.log('Errore nella creazione corso', err);
        }
    });

    telegramBot.onCallBack('initYear', async (data, callback) => {

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