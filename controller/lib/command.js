import { start } from "./commands/start.js"
import { daySchedule, weekSchedule } from "./commands/scheduleCommands.js";
import { formatDate } from "./utils/formatDate.js";
import { findClassroom } from "./commands/findClassroom.js";

export async function handleCommand(command, messageObj, user){
    if(command !== 'start' && !user){
        return { text: "😫 <b>Corso Non Configurato!</b>\n\n🙄 Esegui /start per configurare il tuo corso" }
    }

    switch(command){
        case 'start':
            return await start(messageObj);
        case 'oggi':
            return await daySchedule(formatDate(), user);
        case 'domani':
            return await daySchedule(formatDate(1), user);
        case 'week':
            return await weekSchedule(0, user);
        case 'nextweek':
            return await weekSchedule(1, user);
        case 'classe':
            return findClassroom(user)
        default:
            return { text: "🤨 Questo comando non esiste." }
    }
}