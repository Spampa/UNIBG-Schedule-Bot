import axios from "axios";
import { handleCommand } from "./command.js";

const BASE_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}`;

export async function sendMessage(chatId, text, buttons = []) {
    return await axios.post(`${BASE_URL}/sendMessage?parse_mode=html`, {
        chat_id: chatId,
        text: text,
        reply_markup: {
            inline_keyboard: buttons, // Pulsanti in colonna
            one_time_keyboard: true,  // La tastiera scompare dopo l'uso
            resize_keyboard: true
        }
    }).catch(err => {
        console.log('Error to send message: ', err);
    })
}

export async function handleMessage(messageObj) {
    const messageText = messageObj.text;
    if(!messageText){
        //TODO: error handler
        console.log('Error');
    }

    try{
        const chatId = messageObj.chat.id;
        if(messageText.charAt(0) === "/"){
            const command = messageText.substring(1);
            const commandResponse = await handleCommand(command, messageObj);
            sendMessage(chatId, commandResponse.text, commandResponse.buttons);
        }
        else{
            sendMessage(chatId, 'Hello My Man😊');
        }
    }
    catch(err){
        console.log(err);
    }
}

