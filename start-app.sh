#!/bin/bash

# Build the React frontend
echo "Building the frontend..."
cd FrontEnd
npm install
npm run build
cd ..

# Install backend dependencies and start the server
echo "Starting the backend..."
cd BackEnd
pip install -r requirements.txt
# Port is provided by Railway as an environment variable
python main.py
