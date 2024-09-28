
import { formatDate } from '../utils/formatDate.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function classroom(classroom) {
    const now = new Date();
    const formattedTime = now.toLocaleString('it-IT', { timeZone: 'Europe/Rome' });
    const date = formattedTime.substring(0, formattedTime.indexOf(","));
    const hour = formattedTime.substring(formattedTime.indexOf(" ") + 1);

    const findClass = await prisma.schedule.findFirst({
        where: {
            date: date,
            classroom,
            AND: [
                {
                    start: {
                        lte: hour
                    }
                },
                {
                    end: {
                        gte: hour
                    }
                }
            ]
        }
    });

    if(!findClass){
        return { text: "😊 <b>Aula Libera!</b>"}
    }
    else{
        return { text: `🧐 <b>Aula occupata</b>\nda ${findClass.subject}\n🕛 Dalle ${findClass.start} - Alle ${findClass.end}`}
    }
}