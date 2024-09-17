export const formatSchedule = (schedule, day) => {
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
            msg += `Orari del ${currentDate}\n`;
            schedule.forEach(s => {
                msg += `📗${s.subject}\n`
                msg += `🕛 ${s.schedule}\n`
                msg += `🏫 ${s.classroom}\n`
                if (s.data !== currentDate) {
                    msg += `\nOrari del ${s.data}`;
                    currentDate = s.data;
                }
                msg += '\n';
            });
        }

        return msg;
    }
}