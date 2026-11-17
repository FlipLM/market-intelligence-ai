FROM node:20-slim

WORKDIR /app

# Instala todas as dependências necessárias para o build
COPY package.json package-lock.json* ./
RUN npm install --include=dev

# Copia código-fonte
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Compilação da aplicação Next.js
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3001

CMD ["npm", "run", "start"]
