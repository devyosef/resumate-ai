# --- Build Stage ---
    FROM node:18-alpine AS builder

    # Set working directory
    WORKDIR /app
    
    # Copy package.json and package-lock.json for dependency installation
    COPY package*.json ./
    
    # Install dependencies (clean & reproducible build)
    RUN npm ci --legacy-peer-deps
    
    # Copy the rest of the application
    COPY . .
    
    # Build the Next.js application
    RUN npm run build
    
    # --- Production Stage ---
    FROM node:18-alpine
    
    # Set working directory
    WORKDIR /app
    
    # Copy only necessary files from the builder stage
    COPY --from=builder /app/package.json ./
    COPY --from=builder /app/package-lock.json ./
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/next.config.ts ./
    
    # Expose port 3000
    EXPOSE 3000
    
    # Start Next.js server in production mode
    CMD ["npm", "start"]