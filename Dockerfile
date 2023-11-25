# Usa un'immagine Node.js come base
FROM node:16

# Imposta la directory di lavoro nel container
WORKDIR /app

# Copia i file necessari per il tuo progetto
COPY package*.json ./
COPY tsconfig.build.json ./
COPY .env.dev ./

# Installa le dipendenze del progetto
RUN npm install

# Copia il resto del tuo codice nell'immagine Docker
COPY dist ./dist

# Escludi il file .env per evitare di sovrascrivere le variabili d'ambiente di produzione
# (assicurati che le variabili d'ambiente siano configurate direttamente in produzione)
RUN rm -f .env

# Specifica il comando per avviare l'applicazione
CMD ["npm", "run", "start:prod"]