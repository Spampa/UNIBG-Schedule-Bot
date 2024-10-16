import { config } from 'dotenv';
config();

import express from 'express';
import axios from 'axios';
import fs from 'fs';
import crypto from 'crypto';

import { initDB } from './db/initDB.js';
import { jobSchedules } from './job/jobSchedules.js';

import { handler, notifyAll } from './controller/index.js';
import { sendMessage } from './controller/lib/telegram.js';

const app = express();
app.use(express.json());
const port = process.env.PORT

let myUrl = process.env.SERVER_URL;
const appToken = crypto.randomBytes(16).toString('hex');

//init fase
try {
    //create new webhook
    const res = await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/setWebhook`, {
        url: myUrl,
        secret_token: appToken
    });
    console.log('- ' + res.data.description);

    //initialize DB
    await initDB();
    console.log('- DB Initialized');

    //get schedule
    jobSchedules();
    console.log('- Schedule Started');
}
catch (err) {
    console.log(err);
}

//middleware di log
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} from ${req.ip} at ${new Date().toISOString()}`);
    next();
})

//check if the request is from telegram bot
app.use((req, res, next) => {
    if (req?.headers["x-telegram-bot-api-secret-token"] === appToken) {
        next();
    }
    else {
        res.status(401).json({
            message: "Not Authorized"
        });
    }
});

//check if user has username
app.use((req, res, next) => {
    if (req.body.message && !req.body.message.chat.username) {
        return sendMessage(req.body.message.chat.id, '❌ Configura username:\n⚙️ Impostazioni > Il mio profilo > Username');
    }
    else if (req.body.callback_query && !req.body.callback_query.from.username) {
        return sendMessage(req.body.callback_query.chat.id, '❌ Configura username:\n⚙️ Impostazioni > Il mio profilo > Username');
    }
    next();
});

app.post('/', (req, res) => {
    handler(req);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server running on 127.0.0.1:${port}`);
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});