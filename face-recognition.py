import os
import urllib.request
from arduino.app_utils import App
import cv2
import numpy as np

# --- 1. ROBUST AUTO-DOWNLOADER ---
def download_file(url, filename):
    if not os.path.exists(filename):
        print(f"Downloading {filename} (this might take a few seconds)...")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req) as response, open(filename, 'wb') as out_file:
                out_file.write(response.read())
            print(f"Successfully downloaded {filename}!")
        except Exception as e:
            print(f"ERROR downloading {filename}: {e}")

# URLs for OpenCV models
YUNET_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
SFACE_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_recognition_sface/face_recognition_sface_2021dec.onnx"

# FIXED: Using a much smaller 480px thumbnail of Obama!
REFERENCE_IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/President_Barack_Obama.jpg/480px-President_Barack_Obama.jpg"

download_file(YUNET_URL, "face_detection_yunet_2023mar.onnx")
download_file(SFACE_URL, "face_recognition_sface_2021dec.onnx")
download_file(REFERENCE_IMAGE_URL, "obama.jpg")

# --- 2. CONFIGURATION ---
REFERENCE_IMAGE_PATH = "IMG_0162.png" 
YUNET_MODEL_PATH = "face_detection_yunet_2023mar.onnx"
SFACE_MODEL_PATH = "face_recognition_sface_2021dec.onnx"
KNOWN_NAME = "Jayavibhav K"

# --- 3. INITIALIZE MODELS ---
print("\nInitializing AI Models...")
detector = cv2.FaceDetectorYN.create(YUNET_MODEL_PATH, "", (320, 320))
recognizer = cv2.FaceRecognizerSF.create(SFACE_MODEL_PATH, "")

print(f"Loading reference image: {REFERENCE_IMAGE_PATH}")
ref_img = cv2.imread(REFERENCE_IMAGE_PATH)

if ref_img is None:
    print("CRITICAL ERROR: Could not load reference image. It might be corrupted.")
    exit()

# --- THE FIX: Resize the image if it's too big for the Edge CPU ---
h, w = ref_img.shape[:2]
max_dim = 640
if max(h, w) > max_dim:
    scale = max_dim / max(h, w)
    ref_img = cv2.resize(ref_img, (int(w * scale), int(h * scale)))
    print(f"Resized reference image to {ref_img.shape[1]}x{ref_img.shape[0]} for faster processing.")

# Extract the features of the known face
detector.setInputSize((ref_img.shape[1], ref_img.shape[0]))
_, ref_faces = detector.detect(ref_img)

if ref_faces is None or len(ref_faces) == 0:
    print("ERROR: No face detected in reference image.")
    exit()

# Encode the face
# --- THE FIX: Align the face before extracting features ---
aligned_ref_face = recognizer.alignCrop(ref_img, ref_faces[0])
ref_feature = recognizer.feature(aligned_ref_face)

print(f"Successfully encoded {KNOWN_NAME}'s face! Ready for live video.\n")

# --- 4. VIDEO LOOP ---
video_capture = cv2.VideoCapture(0)
frame_count = 0

def loop():
    global frame_count
    ret, frame = video_capture.read()
    if not ret:
        return

    # Check every 10th frame to keep it running smoothly
    frame_count += 1
    if frame_count % 10 != 0:
        return

    height, width, _ = frame.shape
    detector.setInputSize((width, height))

    # Detect faces in the live camera feed
    _, faces = detector.detect(frame)

    if faces is not None:
        for face in faces:
            # --- THE FIX: Align the live face first ---
            aligned_live_face = recognizer.alignCrop(frame, face)
            
            # Extract features from the ALIGNED face
            live_feature = recognizer.feature(aligned_live_face)
            
            # Compare using Cosine Distance
            score = recognizer.match(ref_feature, live_feature, cv2.FaceRecognizerSF_FR_COSINE)
            
            # 0.363 is the threshold. Higher = more confident match.
            if score >= 0.363:
                print(f"[ALERT] MATCH FOUND: {KNOWN_NAME} (Confidence: {score:.3f})")
            else:
                print(f"Match found: Unknown (Score: {score:.3f})")
# Run the App Lab loop
App.run(user_loop=loop)
