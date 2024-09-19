# UNIBG Schedule Bot

Questo progetto è un bot sviluppato in Node.js che fornisce gli orari delle lezioni e degli esami dell'università. Il bot interagisce con gli utenti per fornire informazioni in tempo reale sui corsi, le aule e gli orari di lezione.

## Funzionalità

- **Consultazione orari:** Fornisce gli orari delle lezioni, delle sessioni di laboratorio e degli esami.

## Link Bot:

Bot Telegram: https://t.me/orari_unibg_bot

## Requisiti

- Node.js versione 14 o superiore
- npm (Node Package Manager)

## Installazione

Segui questi passaggi per configurare il progetto in localeç

1. Clona il repository:

   ```bash
   git clone https://github.com/Spampa/orariUniBG.git
   ```

2. Entra nella directory del progetto:

   ```bash
   cd university-schedule-bot
   ```

3. Installa le dipendenze:

   ```bash
   npm install
   ```

4. Configura le variabili d'ambiente: crea un file `.env` e aggiungi le seguenti variabili:

   ```plaintext
   TELEGRAM_TOKEN=your-bot-token
   DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
   NODE_ENV= # Imposta 'development' per sviluppo, 'production' per produzione
   ```
5. Inizializza il database:

   ```bash
   npx prisma db push
   ```

## Utilizzo

Per avviare il bot, esegui il seguente comando:

```bash
npm start
```

Il bot inizierà ad ascoltare i messaggi e fornirà le informazioni richieste dagli utenti.

## Contribuire

Se vuoi contribuire a questo progetto:

1. Fai un fork del repository.
2. Crea un branch per la tua feature (`git checkout -b feature/il-tuo-branch`).
3. Fai commit delle tue modifiche (`git commit -m 'Aggiungi una nuova feature'`).
4. Fai push al branch (`git push origin feature/il-tuo-branch`).
5. Apri una Pull Request.

## Problemi e Feedback

Se riscontri problemi o hai suggerimenti, puoi aprire una [issue](https://github.com/tuo-username/university-schedule-bot/issues) su GitHub.

## Contatti

Per ulteriori informazioni, contatta l'autore all'indirizzo nicolo.spampa@gmail.com.

---

Personalizza questo README con le specifiche del tuo progetto, come il nome del repository, i dettagli delle variabili d'ambiente e le informazioni di contatto.
