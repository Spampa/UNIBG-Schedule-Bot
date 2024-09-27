import { config } from 'dotenv';
config();

import express from 'express';
import axios from 'axios';


import { initDB } from './db/initDB.js';
import { handler } from './controller/index.js';
import { sendMessage } from './controller/lib/telegram.js';

const app = express();
app.use(express.json());
const port = process.env.PORT

let myUrl = process.env.NODE_ENV === 'development' ? 'https://7c42-82-63-8-19.ngrok-free.app/message' : '';

//init fase
try{
    //create new webhook
    const res = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/setWebhook`, {
        url: myUrl
    });
    console.log('- ' + res.data.description);

    //initialize DB
    await initDB();
    console.log('- DB Initialized');
}
catch(err){
    console.log(err);
}

//middleware di log
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} from ${req.ip}`);
    next();
})

//check if user has username
app.use((req, res, next) => {
    if(req.body.message && !req.body.message.chat.username){
        return sendMessage(req.body.message.chat.id, '❌ Configura username:\n⚙️ Impostazioni > Il mio profilo > Username');
    }
    else if(req.body.callback_query && !req.body.callback_query.from.username){
        return sendMessage(req.body.callback_query.chat.id, '❌ Configura username:\n⚙️ Impostazioni > Il mio profilo > Username');
    }
    next();
})

app.post('/message', (req, res, next) => {
    handler(req);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server running on 127.0.0.1:${port}`);
});