# Verwende ein offizielles Node.js-Image als Basis
FROM node:14

# Erstelle ein Arbeitsverzeichnis
WORKDIR /usr/src/app

# Kopiere package.json und package-lock.json
COPY package*.json ./

# Installiere die Abhängigkeiten
RUN npm install

# Kopiere den Rest der Anwendung
COPY . .

# Exponiere den Port, auf dem die Anwendung läuft
EXPOSE 3000

# Starte die Anwendung
CMD [ "node", "server.js" ]

