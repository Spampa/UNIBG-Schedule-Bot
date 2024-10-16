import axios from "axios";
import { handleCommand } from "./command.js";
import { handleCallback } from "./callback.js";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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
    }).catch(async err => {
        if(err.status === 403){
            await prisma.user.update({
                where: {
                    chat: chatId
                },
                data: {
                    isBanned: true
                }
            });
            console.log(`User with chat id ${chatId} is banned`);
        }
        else{
            console.log('Error to send message: ', err);
        }
    })
}

async function deleteMessage(chatId, messageId) {
    return await axios.post(`${BASE_URL}/deleteMessage`, {
        chat_id: chatId,
        message_id: messageId
    })
    .catch(err => {
        console.log('Deleting error', err);
    })
}

export async function handleMessage(messageObj, user) {
    const messageText = messageObj.text;
    if(!messageText){
        //TODO: error handler
        console.log('Error');
    }

    if(user){
        await prisma.user.update({
            where: {
                username: user.username
            },
            data: {
                lastMessage: messageText,
                time: new Date().toISOString()
            }
        })
    }

    try{
        const chatId = messageObj.chat.id;
        if(messageText.charAt(0) === "/"){
            const command = messageText.substring(1);
            const commandResponse = await handleCommand(command, messageObj, user);
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

export async function handleCallbackMessage(callbackObj) {

    try{
        const data = callbackObj.data;
        if(data){
            const message = callbackObj.message;
            const chatId = callbackObj.from.id;
            deleteMessage(chatId, message.message_id);
            const handleResponse = await handleCallback(data, callbackObj);
            sendMessage(chatId, handleResponse.text, handleResponse.buttons);
        }
    }
    catch(err){
        console.log(err);
    };
}

