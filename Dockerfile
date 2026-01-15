FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Imagen de producción
FROM node:20-alpine

WORKDIR /app

# Copiar solo lo necesario
COPY package*.json ./
RUN npm ci --only=production

# Copiar build desde la etapa anterior
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Variables de entorno (puedes sobrescribirlas en Easypanel)
ENV NODE_ENV=production
ENV PORT=3000

# Comando para iniciar
CMD ["node", "dist/main.js"]
