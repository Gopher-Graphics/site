# Stage 1: Build the React Client
FROM node:20-alpine AS client-builder
WORKDIR /app/Client
COPY Client/package*.json ./
RUN npm ci
COPY Client/ ./
RUN npm run build

# Stage 2: Build the Express Server
FROM node:20-alpine AS server-builder
WORKDIR /app/Server
COPY Server/package*.json ./
RUN npm ci
COPY Server/ ./
RUN npm run build

# Stage 3: Production Environment
FROM node:20-alpine
WORKDIR /app/Server
ENV NODE_ENV=production

# Copy Server files
COPY Server/package*.json ./
RUN npm ci --only=production
COPY --from=server-builder /app/Server/dist ./dist

# Copy Client build into Server's public directory
COPY --from=client-builder /app/Client/dist ./public

# Ensure uploads directory exists
RUN mkdir -p uploads

# Expose port
EXPOSE 8080
ENV PORT=8080

# Start server
CMD ["node", "dist/index.js"]
