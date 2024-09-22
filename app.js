import fs from 'fs'

import { PrismaClient } from '@prisma/client';
import { initDB } from './db/initDB.js';
import { formatSchedule } from './utils/formatSchedule.js';
import { checkUser } from './middlewares/checkUser.js';
import { jobSchedules } from './job/jobSchedules.js'
import { formatDate } from './utils/formatDate.js';
import { notifyAll } from './utils/notifyAll.js';
import { updateSchedules } from './utils/schedule/updateSchedules.js';

import TelegramBot from './utils/telegramBot.js';
const telegramBot = new TelegramBot(process.env.TELEGRAM_TOKEN);

const prisma = new PrismaClient();

async function main() {
    await initDB();

    if(process.env.NODE_ENV === 'production'){
        notifyAll(telegramBot, fs.readFileSync('./update.txt', 'utf8'));
    }

    jobSchedules(telegramBot); //start schedule for update the schedule of the school

    telegramBot.onText('/start', async (msg) => {
        if (!msg.chat.username) {
            return telegramBot.sendMessage(`⚠️Imposta uno username`, msg.chat.id);
        }
        try {
            await prisma.user.upsert({
                where: {
                    username: msg.chat.username
                },
                update: {
                    time: new Date().toISOString(),
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
                buttons.push([{ text: `${s.name}`, callback_data: `initSchool${s.schoolId}` }]);
            })

            telegramBot.sendMessage(`Ciao ${msg.chat.first_name} seleziona la tua scuola`, msg.chat.id, buttons);
        }
        catch (err) {
            console.log('Creation User Error', err);
        }
    })

    telegramBot.onText('/oggi', async (msg) => {
        const isLogged = await checkUser(msg.chat.username);
        if (!isLogged) {
            return telegramBot.sendMessage('Utente non registrato esegui /start oppure imposta uno username', msg.chat.id);
        }

        const date = formatDate();

        const user = await prisma.user.update({
            where: {
                username: msg.chat.username
            },
            data: {
                time: new Date().toISOString(),
                lastMessage: '/oggi'
            }
        });

        const schedule = await prisma.schedule.findMany({
            where: {
                courseId: user.courseId,
                courseAnnoId: user.annoId,
                date
            }
        });
        telegramBot.sendMessage(formatSchedule(schedule), msg.chat.id);
    })

    telegramBot.onText('/domani', async (msg) => {
        const isLogged = await checkUser(msg.chat.username);
        if (!isLogged) {
            return telegramBot.sendMessage('Utente non registrato esegui /start oppure imposta uno username', msg.chat.id);
        }

        const date = formatDate(1);

        const user = await prisma.user.update({
            where: {
                username: msg.chat.username
            },
            data: {
                time: new Date().toISOString(),
                lastMessage: '/domani'
            }
        });

        const schedule = await prisma.schedule.findMany({
            where: {
                courseId: user.courseId,
                courseAnnoId: user.annoId,
                date
            }
        });
        telegramBot.sendMessage(formatSchedule(schedule), msg.chat.id);
    })

    telegramBot.onText('/week', async (msg) => {
        const isLogged = await checkUser(msg.chat.username);
        if (!isLogged) {
            return telegramBot.sendMessage('Utente non registrato esegui /start oppure imposta uno username', msg.chat.id);
        }

        const user = await prisma.user.update({
            where: {
                username: msg.chat.username
            },
            data: {
                time: new Date().toISOString(),
                lastMessage: '/week'
            }
        });

        const minWeek = (await prisma.schedule.aggregate({
            _min: {
                week: true
            }
        }))._min.week;

        const schedule = await prisma.schedule.findMany({
            where: {
                courseId: user.courseId,
                courseAnnoId: user.annoId,
                week: minWeek
            }
        })

        telegramBot.sendMessage(formatSchedule(schedule), msg.chat.id);
    });

    telegramBot.onText('/nextweek', async (msg) => {
        const isLogged = await checkUser(msg.chat.username);
        if (!isLogged) {
            return telegramBot.sendMessage('Utente non registrato esegui /start oppure imposta uno username', msg.chat.id);
        }

        const user = await prisma.user.update({
            where: {
                username: msg.chat.username
            },
            data: {
                time: new Date().toISOString(),
                lastMessage: '/nextweek'
            }
        })

        const nextWeek = (await prisma.schedule.aggregate({
            _min: {
                week: true
            }
        }))._min.week + 1;

        const schedule = await prisma.schedule.findMany({
            where: {
                courseId: user.courseId,
                courseAnnoId: user.annoId,
                week: nextWeek
            }
        })
        telegramBot.sendMessage(formatSchedule(schedule), msg.chat.id);
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
                    time: new Date().toISOString(),
                    lastMessage: msg.text
                }
            })


        }
        catch (err) {
            console.log(err);
        }
    });

    telegramBot.onCallBack('initSchool', async (data, callback) => {
        try {
            const department = await prisma.department.findMany({
                where: {
                    schoolId: data[0]
                }
            })

            const buttons = [];
            department.forEach(d => {
                buttons.push([{ text: `${d.name}`, callback_data: `initCourse${d.departmentId}` }]);
            })
            telegramBot.deleteMessage(callback.message.chat.id, callback.message.message_id);
            telegramBot.sendMessage(`📑 Seleziona la tua facoltà`, callback.message.chat.id, buttons);
        }
        catch (err) {
            console.log('Errore nella creazione corso', err);
        }
    });

    telegramBot.onCallBack('initCourse', async (data, callback) => {
        try {
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
                buttons.push([{ text: `${c.anno}`, callback_data: `initYear${c.courseId}:${c.annoId}` }]);
            })
            telegramBot.deleteMessage(callback.message.chat.id, callback.message.message_id);
            telegramBot.sendMessage(`📑 Seleziona anno`, callback.message.chat.id, buttons);
        }
        catch (err) {
            console.log('Errore nella creazione corso', err);
        }
    });

    telegramBot.onCallBack('initYear', async (data, callback) => {

        try {
            const user = await prisma.user.update({
                where: {
                    username: callback.message.chat.username
                },
                data: {
                    courseId: data[0],
                    annoId: data[1]
                }
            });

            const schedule = await prisma.schedule.findMany({
                where: {
                    courseId: user.courseId,
                    courseAnnoId: user.annoId
                }
            });

            if(schedule.length === 0){
                updateSchedules();
            }

            telegramBot.deleteMessage(callback.message.chat.id, callback.message.message_id);
            telegramBot.sendMessage('✅ Corso configurato correttamente', callback.message.chat.id);
        }
        catch (err) {
            console.log('Errore nella creazione corso', err);
        }
    });
}

main();

process.on('SIGINT', async () => {
    console.log('Chiusura in corso...');
    await prisma.$disconnect();
    console.log('Connessione al database chiusa.');
    if(process.env.NODE_ENV === 'production'){
        await notifyAll(telegramBot, '⚠️ Server Down per manutenzione, torniamo tra poco 😴');
    }
    process.exit(0);
})