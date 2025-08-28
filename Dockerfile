FROM node:20-alpine
WORKDIR /usr/src/app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el resto
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]