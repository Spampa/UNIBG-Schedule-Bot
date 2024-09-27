import { handleMessage } from "./lib/telegram.js";

export async function handler(req) {
    try{
        const { body } = req;
        if(body && body.message){
            const messageObj = body.message;
            handleMessage(messageObj);
        }
    }
    catch(err){
        console.log(err);
    }
}