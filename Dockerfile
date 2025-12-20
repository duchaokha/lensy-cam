# Build stage for React frontend
FROM node:18-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --legacy-peer-deps
COPY client/ ./
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install backend dependencies
COPY package*.json ./
RUN npm install --production --legacy-peer-deps

# Copy backend files
COPY server/ ./server/
COPY scripts/ ./scripts/
COPY .env.example ./.env

# Copy built frontend from build stage
COPY --from=client-build /app/client/build ./client/build

# Create directory for SQLite database
RUN mkdir -p /app/data

# Expose port
EXPOSE 8899

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8899

# Start the application
CMD ["node", "server/index.js"]
