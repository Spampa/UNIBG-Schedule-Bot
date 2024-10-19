
import { createLogger, format, transports } from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const errorLogPath = path.resolve(__dirname, '../logs/error.log');
const combinedLogPath = path.resolve(__dirname, '../logs/combined.log');

export const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }), // Stack trace negli errori
        format.json() // Formato JSON per i log
    ),
    transports: [
        new transports.File({ filename: errorLogPath, level: 'error' }), // Log degli errori
        new transports.File({ filename: combinedLogPath }), // Log generali
        new transports.Console({ format: format.simple() }) // Log anche in console
    ]
});