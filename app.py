from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import numpy as np
from ultralytics import YOLO
import tempfile
from werkzeug.utils import secure_filename

app = Flask(__name__)
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

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image selected'}), 400
    
    # Save the uploaded file temporarily
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, secure_filename(file.filename))
    file.save(temp_path)
    
    # Read and process the image
    img = cv2.imread(temp_path)
    if img is None:
        return jsonify({'error': 'Could not read image'}), 400
    
    # Perform prediction
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

if __name__ == '__main__':
    # Run the Flask app on host 0.0.0.0 to be accessible externally
    app.run(host='0.0.0.0', port=5000, debug=True)