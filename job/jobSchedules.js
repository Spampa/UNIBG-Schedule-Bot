import cron from 'node-cron'

import { updateSchedules } from '../utils/schedule/updateSchedules.js';
import { notifyScheduleChanges } from '../utils/schedule/notifySchedule.js';
import { deleteOldWeek } from '../utils/schedule/deleteOldWeek.js';

export function jobSchedules(bot) {
    cron.schedule('0 * * * *', async () => {
        const updates = await updateSchedules();
        updates.forEach(u => {
            let msg = ''
            if(u.isCanceled){
                msg = `⚠️ ${u.subject}\ndel <b>${u.date}</b>\nè stata cancellata➖`
            }
            else{
                msg = `⚠️ ${u.subject}\ndel <b>${u.date}</b>\nè stata aggiunta all'orario➕`
            }
            notifyScheduleChanges(bot, msg, u.courseId, u.courseAnnoId);
        })
    });

    //delete old week
    cron.schedule('30 23 * * Sun', () => {
        console.log('Deleting Old Week...');
        deleteOldWeek();
    })

    updateSchedules();
};