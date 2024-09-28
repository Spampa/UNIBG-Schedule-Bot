import { handleMessage, handleCallbackMessage, sendMessage } from "./lib/telegram.js";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function handler(req) {
    try{
        const { body } = req;
        if(body && body.message){
            const messageObj = body.message;

            const user = await prisma.user.findUnique({
                where: {
                    username: messageObj.chat.username
                }
            });

            await handleMessage(messageObj, user);
        }
        else if(body && body.callback_query){
            const callbackObj = body.callback_query;
            handleCallbackMessage(callbackObj);
        }
    }
    catch(err){
        console.log(err);
    }
}

export async function notifyAll(msg) {
    const users = await prisma.user.findMany();
    users.forEach(u => {
        sendMessage(u.chat.toString(), msg);
    });
}

export async function notifyOnly(msg, courseId, annoId) {
    const users = await prisma.user.findMany({
        where: {
            courseId,
            annoId
        },
        select: {
            chat: true
        }
    });

    users.forEach(u => {
        sendMessage(u.chat.toString(), msg);
    })
}