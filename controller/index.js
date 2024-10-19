import { handleMessage, handleCallbackMessage, sendMessage } from "./lib/telegram.js";
import { logger } from "../utils/logger.js";

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function handler(req) {
    try {
        const { body } = req;

        if (body && body.message) {
            const messageObj = body.message;
            let user = await prisma.user.findUnique({
                where: {
                    chat: messageObj.chat.id
                }
            });

            if (user && messageObj.text === '/start') {
                user = await prisma.user.update({
                    where: {
                        chat: messageObj.chat.id
                    },
                    data: {
                        isBanned: false
                    }
                });
            }

            if (!user?.isBanned) {
                await handleMessage(messageObj, user);
            }
        }
        else if (body && body.callback_query) {
            const callbackObj = body.callback_query;
            const user = await prisma.user.findUnique({
                where: {
                    chat: callbackObj.from.id
                }
            });
            if (!user.isBanned) {
                handleCallbackMessage(callbackObj);
            }
        }
    }
    catch (err) {
        logger.warn('Error to handle message: ', err);
    }
}

export async function notifyAll(msg) {
    const users = await prisma.user.findMany();
    users.forEach(u => {
        if (!u.isBanned) {
            sendMessage(u.chat.toString(), msg);
        }
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
        if (!u.isBanned) {
            sendMessage(u.chat.toString(), msg);
        }
    });
}