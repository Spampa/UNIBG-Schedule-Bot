import axios from "axios";

export default class TelegramBot {
    constructor(token) {
        this.token = token;
        let offset = null;

        const BASE_URL = `https://api.telegram.org/bot${token}`;
        const startTime = Math.floor(Date.now() / 1000);

        let updates = [];

        setInterval(async () => {
            try{
                const allUpdates = (await axios.get(`${BASE_URL}/getUpdates`, {
                    params: {
                        offset: offset,
                    }
                })).data.result;
                updates = [];
                allUpdates.forEach(u => {
                    if ((offset === null || u.update_id > offset) && parseInt(u.message.date) >= parseInt(startTime) ) {
                        updates.push(u);
                    }
                    offset = u.update_id;
                });
                return updates;
            }
            catch(err){
                console.log('Polling error', err);
            }

        }, 1000);

        this.onText = (str, callback) => {

            const regex = new RegExp(str);
            setInterval(async () => {
                updates.forEach((update, index) => {
                    if (update.message && regex.test(update.message.text)) {
                        callback(update.message);
                        updates.splice(index, 1);
                    }
                });
            }, 200);
        };

        this.sendMessage = async (text, chatId) => {
            try{
                await axios.post(`${BASE_URL}/sendMessage`,{
                    text,
                    chat_id: chatId
                });
            }
            catch(err){
                console.log('Sending message error', err);
            }

        }
    }
}