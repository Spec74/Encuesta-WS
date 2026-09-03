# ------------------------------------------------------------------
# Alternativa "todo en Docker" para el backend en producción (Render
# también acepta este Dockerfile como runtime si prefieres Docker en
# vez del runtime nativo de Node ya configurado en render.yaml).
# ------------------------------------------------------------------
FROM node:18-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npx tsc -p .

FROM node:18-alpine AS runtime
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma

EXPOSE 4000
# Sincroniza el esquema y arranca el servidor
CMD npx prisma db push --accept-data-loss && node dist/index.js
