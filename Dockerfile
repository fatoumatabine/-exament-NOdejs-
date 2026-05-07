# Dockerfile pour application Node.js
FROM node:20-alpine

WORKDIR /app

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Copie les fichiers package.json et le dossier prisma avant npm install
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --production

# Copie le reste du code
COPY . .

EXPOSE 3000
CMD ["node", "src/server.js"]
