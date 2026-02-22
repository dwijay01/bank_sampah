# ==== STAGE 1: Build React Frontend ====
FROM node:20-alpine as build

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# ==== STAGE 2: Setup Nginx ====
FROM nginx:alpine

# Copy built React files to Nginx HTML directory
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx configuration
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
