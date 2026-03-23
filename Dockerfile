# --- Stage 1: Build the React frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/FrontEnd

# Copy package files first for better caching
COPY FrontEnd/package*.json ./
RUN npm install

# Copy rest of frontend and build
COPY FrontEnd/ ./
RUN npm run build

# --- Stage 2: Setup the FastAPI backend ---
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (needed for some ML packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY BackEnd/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Create the directory structure the backend expects
RUN mkdir -p /app/FrontEnd/dist

# Copy the built frontend from the first stage
COPY --from=frontend-builder /app/FrontEnd/dist ./FrontEnd/dist

# Copy backend source code (ensure it's in its own folder)
COPY BackEnd/ ./BackEnd/

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Start the application using its absolute entry point
CMD ["python", "BackEnd/main.py"]
