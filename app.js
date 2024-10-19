import { config } from 'dotenv';
config();

import express from 'express';
import axios from 'axios';
import crypto from 'crypto';

import { initDB } from './db/initDB.js';
import { jobSchedules } from './job/jobSchedules.js';
import { logger } from './utils/logger.js';

import { handler } from './controller/index.js';

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
    logger.info(`${req.method} ${req.url} from ${req.ip}`);
    next();
})

//check if the request is from telegram bot
app.use((req, res, next) => {
    if (req?.headers["x-telegram-bot-api-secret-token"] === appToken) {
        next();
    }
    else {
        logger.warn(`${req.method} ${req.url} from ${req.ip} Not Authorized`);
        res.status(401).json({
            message: "Not Authorized"
        });
    }
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