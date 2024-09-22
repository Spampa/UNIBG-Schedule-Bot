export const formatSchedule = (schedule) => {

    if (schedule === undefined) {
        return '⚠️ Riesegui /start corso non inizializzato correttamente';
    }
    else {
        let msg = '';
        if (schedule.length === 0) {
            msg += '😴 Oggi Nessuna Lezione';
        }
        else{
            let currentDate = schedule[0].date;
            msg += `<b><i>Orari del ${currentDate}</i></b>\n`;
            for(const s of schedule){
                if (s.date !== currentDate) {
                    msg += `<b><i>Orari del ${s.date}</i></b>\n`;
                    currentDate = s.date;
                }
                msg += `📗${s.subject}\n`;
                msg += `🕛 ${s.time}\n`;
                msg += `🏫 ${s.classroom}\n`;
                msg += `🧑‍🏫 ${s.teacher}\n`;
                msg += '\n';
            }
        }

        return msg;
    }
}