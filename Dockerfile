FROM node:20-alpine
WORKDIR /usr/src/app

# Install dependencies with legacy peer deps
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

EXPOSE 5173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]