export const formatSchedule = (schedule, day) => {
    let msg = `Orari del ${day}\n`;
    if(schedule.length === 0){
        msg += '😴 Oggi Nessuna Lezione';
    }
    else{

        schedule.forEach(s => {
            msg += `📗${s.subject}\n`
            msg += `🕛 ${s.schedule}\n`
            msg += `🏫 ${s.classroom}\n`
            msg += `-----------\n`
        });
        return msg;
    }
}