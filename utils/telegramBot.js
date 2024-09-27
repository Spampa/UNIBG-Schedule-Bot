import axios from "axios";

export default class TelegramBot {
    constructor(token) {
        this.token = token;

        const BASE_URL = `https://api.telegram.org/bot${token}`;
        const startTime = Math.floor(Date.now() / 1000);

        let updates = [];
        let offset = null;

        const intervalTime = process.env.NODE_ENV === 'production' ? 500 : 1000;

        async function getUpdates() {
            await axios.get(`${BASE_URL}/getUpdates`, {
                params: {
                    offset: offset,
                    limit: 20
                }
            }).then((res) => {
                const allUpdates = res.data.result;
                if (allUpdates.length === 0) return;

                if (offset === null) {
                    offset = allUpdates[allUpdates.length - 1].update_id + 1;
                }

                allUpdates.forEach(u => {
                    updates.push(u);
                    offset = u.update_id + 1;
                });
            })
            .catch(err => {
                console.log('Polling Error', err.response.data);
            });
        }

        setInterval(async () => await getUpdates(), intervalTime);

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
            try {
                await axios.post(`${BASE_URL}/deleteMessage`, {
                    chat_id: chatId,
                    message_id: messageId
                });
            }
            catch (err) {
                console.log("Errore nell' eliminazione", err);
            }
        }
    }
}