#!/bin/bash

# Setup script for EcoVision AI
echo "Setting up EcoVision AI..."

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Create static folder
mkdir -p static

# Copy frontend files to static folder
cp index.html static/
cp style.css static/
cp script.js static/
cp pdf.html static/

echo "Setup complete!"
echo "To start the server, run: python app.py"