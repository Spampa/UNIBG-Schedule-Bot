import cron from 'node-cron'

import { updateSchedules } from './lib/updateSchedules.js';
import { notifyOnly } from '../controller/index.js';
import { deleteOldWeek } from './lib/deleteOldWeek.js';

export function jobSchedules() {
    cron.schedule('0 * * * *', async () => {
        try{
            const updates = await updateSchedules();
            updates.forEach(u => {
                let msg = ''
                if(u.isCanceled){
                    msg = `⚠️ ${u.subject}\ndel <b>${u.date}</b>\nè stata cancellata➖`
                }
                else{
                    msg = `⚠️ ${u.subject}\ndel <b>${u.date}</b>\nè stata aggiunta all'orario➕`
                }
                notifyOnly(msg, u.courseId, u.courseAnnoId);
            })
        }
        catch(err){
            console.log("Errore nell'aggiornamento", err);
        }

    });

    //delete old week
    cron.schedule('30 23 * * Sun', () => {
        console.log('Deleting Old Week...');
        deleteOldWeek();
    })

    updateSchedules();
};