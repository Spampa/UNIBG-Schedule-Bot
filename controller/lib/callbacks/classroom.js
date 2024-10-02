
import { formatDate } from '../utils/formatDate.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function classroom(classroom) {
    const formattedTime = new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });
    const date = formatDate();
    const [hour, minutes] = formattedTime.substring(formattedTime.indexOf(" ")).split(":");

    console.log(date, hour);
    const findClass = await prisma.schedule.findFirst({
        where: {
            date: date,
            classroom,
            AND: [
                {
                    startMinutes: {
                        lte: parseInt(hour * 60 + minutes)
                    },
                    endMinutes: {
                        gte: parseInt(hour * 60 + minutes)
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