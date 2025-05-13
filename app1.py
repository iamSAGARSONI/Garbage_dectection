from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import cv2
import numpy as np
from ultralytics import YOLO
import tempfile
from werkzeug.utils import secure_filename
import logging
import argparse

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__, static_folder='static')
CORS(app)  # Enable CORS for all routes

# Load the YOLO model
MODEL_PATH = os.path.abspath("model_1.pt")
if os.path.exists(MODEL_PATH):
    print(f"Model found at {MODEL_PATH}")
    model = YOLO(MODEL_PATH)
else:
    print(f"Error: Model file not found at {MODEL_PATH}")
    # Provide fallback to a default model path if needed
    MODEL_PATH = "./model_1.pt"
    if not os.path.exists(MODEL_PATH):
        print("Fallback model also not found. Please provide a valid model path.")
        exit(1)
    model = YOLO(MODEL_PATH)

# Serve static files and handle API requests
@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve(path):
    if path == "predict":
        return "Please use POST method for predictions", 405
    
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/predict', methods=['POST'])
def predict():
    logger.info("Received prediction request")
    if 'image' not in request.files:
        logger.error("No image file in request")
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        logger.error("Empty filename")
        return jsonify({'error': 'No image selected'}), 400
    
    # Save the uploaded file temporarily
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, secure_filename(file.filename))
    file.save(temp_path)
    
    logger.info(f"Image saved to {temp_path}")
    
    # Read and process the image
    img = cv2.imread(temp_path)
    if img is None:
        logger.error("Could not read image")
        return jsonify({'error': 'Could not read image'}), 400
    
    try:
        # Perform prediction
        logger.info("Running model prediction")
        results = model(img)
        
        # Process the results
        predictions = []
        for result in results:
            for i, box in enumerate(result.boxes):
                class_id = int(box.cls[0].item())
                confidence = float(box.conf[0].item())
                bbox = [float(x) for x in box.xyxy[0].tolist()]
                
                # Get class name
                class_name = result.names[class_id]
                logger.info(f"Detected: {class_name} with confidence {confidence:.2f}")
                
                predictions.append({
                    'class': class_name,
                    'confidence': confidence,
                    'bbox': bbox
                })
        
        # Clean up the temporary file
        os.remove(temp_path)
        os.rmdir(temp_dir)
        
        return jsonify({
            'status': 'success',
            'predictions': predictions
        })
    
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        # Clean up temporary files in case of error
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if os.path.exists(temp_dir):
            os.rmdir(temp_dir)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description='EcoVision AI Server')
    parser.add_argument('--model', type=str, default='model_1.pt', help='Path to the YOLO model file')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Host to run the server on')
    parser.add_argument('--port', type=int, default=5000, help='Port to run the server on')
    parser.add_argument('--debug', action='store_true', help='Run in debug mode')
    args = parser.parse_args()
    
    # Load the YOLO model
    MODEL_PATH = os.path.abspath(args.model)
    logger.info(f"Attempting to load model from: {MODEL_PATH}")
    
    if os.path.exists(MODEL_PATH):
        logger.info(f"Model found at {MODEL_PATH}")
        model = YOLO(MODEL_PATH)
    else:
        logger.warning(f"Model not found at {MODEL_PATH}, looking for alternative paths")
        # Try alternative locations
        alt_paths = [
            "./model_1.pt",
            "/content/model_1.pt",
            os.path.join(os.getcwd(), "model_1.pt")
        ]
        
        model_loaded = False
        for path in alt_paths:
            if os.path.exists(path):
                logger.info(f"Found model at alternative path: {path}")
                model = YOLO(path)
                model_loaded = True
                break
        
        if not model_loaded:
            logger.error("No valid model file found. Please provide a valid model path.")
            exit(1)
    
    # Create static folder if it doesn't exist
    if not os.path.exists(app.static_folder):
        os.makedirs(app.static_folder)
    
    # Create necessary static files
    with open(os.path.join(app.static_folder, 'index.html'), 'w') as f:
        f.write(open('index.html').read() if os.path.exists('index.html') else """
        <!DOCTYPE html>
        <html>
        <head>
            <title>EcoVision AI - Loading</title>
            <meta http-equiv="refresh" content="0;url=/index.html">
        </head>
        <body>
            <p>Loading EcoVision AI...</p>
        </body>
        </html>
        """)
    
    logger.info(f"Starting server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=args.debug)