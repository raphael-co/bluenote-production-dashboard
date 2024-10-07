# Étape 1 : Utilisation d'une image de base node pour construire l'application
FROM node:18-alpine AS build

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers package.json et package-lock.json (si présent)
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie de tout le reste du code source
COPY . .

# Construction de l'application pour la production
RUN npm run build

# Étape 2 : Utilisation d'une image de serveur web pour servir l'application
FROM nginx:stable-alpine

# Copie des fichiers build dans le répertoire nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copie du fichier de configuration Nginx personnalisé pour gérer les routes SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exposition du port sur lequel Nginx sera accessible
EXPOSE 80

# Commande de démarrage de Nginx
CMD ["nginx", "-g", "daemon off;"]
