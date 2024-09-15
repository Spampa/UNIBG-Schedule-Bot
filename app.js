require('dotenv').config();

//bot
const token = process.env.TELEGRAM_TOKEN;
console.log(token);

const getOrari = require('./utils/orari').getOrari;

async function main() {
    console.log(await getOrari());
}

main();