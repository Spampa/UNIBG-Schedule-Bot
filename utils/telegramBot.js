import axios from "axios";

export default class TelegramBot {
    constructor(token) {
        this.token = token;
        let offset = null;

        const BASE_URL = `https://api.telegram.org/bot${token}`;
        const startTime = Math.floor(Date.now() / 1000);

        let updates = [];

        const intervalTime = process.env.NODE_ENV === 'production' ? 500 : 1000;

        setInterval(async () => {
            try {
                const res = (await axios.get(`${BASE_URL}/getUpdates`, {
                    params: {
                        offset: offset,
                        limit: 20
                    }
                }));
                const allUpdates = res.data.result;
                updates = [];
                allUpdates.forEach(u => {
                    if (u.message?.date) {
                        console.log(u.message.date);
                        if ((offset === null || u.update_id > offset) && u.message.date >= startTime) {
                            updates.push(u);
                        }
                    }
                    else if ((offset === null || u.update_id > offset) && u.callback_query?.message?.date | 0 >= startTime) {
                        updates.push(u);
                    }
                    offset = u.update_id + 1;
                });

                return updates;
            }
            catch (err) {
                console.log('Polling error', err);
            }

        }, intervalTime);

        this.onText = (str, callback) => {
            const regex = str === '*' ? /.*/ : new RegExp(str);
            setInterval(async () => {
                updates.forEach((update, index) => {
                    if ((update.message && regex.test(update.message.text))) {
                        callback(update.message);
                        updates.splice(index, 1);
                    }
                });
            }, intervalTime);
        };

        this.onCallBack = (callbackCode, callback) => {
            setInterval(async () => {
                updates.forEach((update, index) => {
                    if ((update.callback_query && update.callback_query.data.includes(callbackCode))) {
                        const data = update.callback_query.data.substring(callbackCode.length).split(':')
                        callback(data, update.callback_query);
                        updates.splice(index, 1);
                    }
                });
            }, intervalTime);
        };

        this.sendMessage = async (text, chatId, buttonOptions = []) => {
            try {
                await axios.post(`${BASE_URL}/sendMessage?parse_mode=html`, {
                    text,
                    chat_id: chatId,
                    reply_markup: {
                        inline_keyboard: buttonOptions, // Pulsanti in colonna
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
            try{
                await axios.post(`${BASE_URL}/deleteMessage`, {
                    chat_id: chatId,
                    message_id: messageId
                });
            }
            catch(err){
                console.log("Errore nell' eliminazione", err);
            }
        }
    }
}