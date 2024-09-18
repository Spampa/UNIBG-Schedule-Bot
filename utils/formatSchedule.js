export const formatSchedule = (schedule) => {

    if (schedule === undefined) {
        return '⚠️ Riesegui /start';
    }
    else {
        let msg = '';
        if (schedule.length === 0) {
            msg += '😴 Oggi Nessuna Lezione';
        }
        else{
            let currentDate = schedule[0].data;
            msg += `<b><i>Orari del ${currentDate}</i></b>\n`;
            for(const s of schedule){
                if (s.data !== currentDate) {
                    msg += `<b><i>Orari del ${s.data}</i></b>\n`;
                    currentDate = s.data;
                }
                msg += `📗${s.subject}\n`
                msg += `🕛 ${s.schedule}\n`
                msg += `🏫 ${s.classroom}\n`
                msg += '\n';
            }
        }

        return msg;
    }
}