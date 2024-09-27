import { start } from "./commands/start.js"


export async function handleCommand(command, messageObj){
    switch(command){
        case 'start':
            return await start();
        default:
            return "🤨 Questo comando non esiste."
    }
}