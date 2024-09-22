import { PrismaClient } from '@prisma/client';
import { fetchSchedule } from '../../services/fetchSchedule.js';
import { formatDate } from '../formatDate.js';

const prisma = new PrismaClient();

export async function deleteOldWeek(){
    try{
        const minWeek = (await prisma.schedule.aggregate({
            _min: {
                week: true
            }
        }))._min.week;

        console.log(minWeek);
    
        await prisma.schedule.deleteMany({
            where: {
                week: parseInt(minWeek)
            }
        });
    }
    catch(err){
        console.log(`Errore nell'eliminazione della settimana ${minWeek}`, err);
    }
}