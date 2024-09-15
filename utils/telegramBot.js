import axios from "axios";

export default class TelegramBot {
    constructor(token) {
        this.token = token;
        let offset = null;

        const BASE_URL = `https://api.telegram.org/bot${token}`;
        const startTime = Math.floor(Date.now() / 1000);

        let updates = [];

        setInterval(async () => {
            try {
                const allUpdates = (await axios.get(`${BASE_URL}/getUpdates`, {
                    params: {
                        offset: offset,
                    }
                })).data.result;
                updates = [];
                allUpdates.forEach(u => {
                    if (u.message?.date) {
                        if ((offset === null || u.update_id > offset) && u.message.date >= startTime) {
                            updates.push(u);
                        }
                    }
                    else if ((offset === null || u.update_id > offset) && u.callback_query?.message?.date | 0 >= startTime) {
                        updates.push(u);
                    }
                    offset = u.update_id;
                });

                return updates;
            }
            catch (err) {
                console.log('Polling error', err);
            }

        }, 1000);

        this.onText = (str, callback) => {
            const regex = str === '*' ? /.*/ : new RegExp(str);
            setInterval(async () => {
                updates.forEach((update, index) => {
                    if ((update.message && regex.test(update.message.text))) {
                        callback(update.message);
                        updates.splice(index, 1);
                    }
                });
            }, 200);
        };

        this.onCallBack = (callbackCode, callback) => {
            setInterval(async () => {
                updates.forEach((update, index) => {
                    if ((update.callback_query && update.callback_query.data.includes(callbackCode))) {
                        callback(update.callback_query.data.replace(callbackCode + ' ', ''), update.callback_query);
                        updates.splice(index, 1);
                    }
                });
            }, 200);
        };

        this.sendMessage = async (text, chatId, buttonOptions = []) => {
            try {
                await axios.post(`${BASE_URL}/sendMessage`, {
                    text,
                    chat_id: chatId,
                    reply_markup: {
                        inline_keyboard: [buttonOptions], // Pulsanti in colonna
                        one_time_keyboard: true,  // La tastiera scompare dopo l'uso
                        resize_keyboard: true
                    }
                });
            }
            catch (err) {
                console.log('Sending message error', err);
            }
        }

        this.deleteMessage = async (chatId, messageId) => {
            await axios.post(`${BASE_URL}/deleteMessage`, {
                chat_id: chatId,
                message_id: messageId
            });
        }
    }
}