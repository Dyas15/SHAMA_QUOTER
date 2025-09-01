# --- Estágio 1: Ambiente de Desenvolvimento ---
# Demos um "nome" a este estágio: 'development'
FROM node:20-alpine AS development

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Instala o pnpm e as dependências
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copia o restante do código. O volume do docker-compose vai sobrepor isso,
# mas é uma boa prática para builds independentes.
COPY . .

# O comando de execução virá do docker-compose.yml


# --- Estágio 2: Ambiente de Produção ---
# Este estágio só será usado quando você não especificar o 'target' no build.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build


# Estágio final de produção
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
