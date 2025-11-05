# --- STAGE 1: The Builder ---
# This stage installs all dependencies (dev included) and builds the app.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json FIRST
# This layer is only re-built if these files change
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies)
RUN npm ci

# Copy the rest of your source code
# This layer is re-built if any source files change
COPY . .

# Run the build script
RUN npm run build

# --- STAGE 2: The Runner ---
# This stage builds the small, final image for production.
FROM node:20-alpine
WORKDIR /app

# Copy package.json and package-lock.json again
COPY package.json package-lock.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy the built application from the 'builder' stage
COPY --from=builder /app/build ./build

# Expose the port your app runs on (e.g., 3000)
# ENV PORT=3000
# EXPOSE $PORT

# The command to start your app
CMD ["npm", "run", "start"]