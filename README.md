# irvinehacks-project

### 1. Free Up Disk Space
```bash
# Check filesystem usage and largest directories
df -h
du -sh /* 2>/dev/null | sort -rh | head -20

# Move large directories from root (/) to the larger /home partition
mv /root/go /home/arduino/go
mv /root/llamacpp /home/arduino/llamacpp

# Clean up system cache and logs to free immediate space
apt clean
journalctl --vacuum-size=10M
```

### 2. Configure Environment Paths
```bash
# Add moved binaries (go, yzma, llama.cpp) to system PATH
echo 'export PATH=$PATH:/home/arduino/llamacpp' >> ~/.bashrc
echo 'export PATH=$PATH:/home/arduino/go/bin' >> ~/.bashrc
echo 'export GOPATH=/home/arduino/go' >> ~/.bashrc
source ~/.bashrc
```

### 3. Download the Vision-Language Model (SmolVLM 500M)
```bash
# Download the main GGUF model via yzma
yzma model get -u https://huggingface.co/ggml-org/SmolVLM-500M-Instruct-GGUF/resolve/main/SmolVLM-500M-Instruct-Q8_0.gguf

# Download the required multimodal projector (mmproj) for vision processing
yzma model get -u https://huggingface.co/ggml-org/SmolVLM-500M-Instruct-GGUF/resolve/main/mmproj-SmolVLM-500M-Instruct-f16.gguf
```

### 4. Test Model with a Static Image
```bash
# Download a test image
curl -o /tmp/test.jpg https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg

# Run the model via CLI (using 4 threads for performance)
llama-cli -m /home/arduino/mymodels/SmolVLM-500M-Instruct-Q8_0.gguf \
  --mmproj /home/arduino/mymodels/mmproj-SmolVLM-500M-Instruct-f16.gguf \
  --image /tmp/test.jpg \
  -p "Describe this image." -n 200 -t 4
```

### 5. Camera Integration (Finding the active video node)
```bash
# List available video devices
ls -l /dev/video*

# Test nodes until one successfully captures a frame
ffmpeg -f v4l2 -i /dev/video1 -vframes 1 -q:v 2 /tmp/frame.jpg
ffmpeg -f v4l2 -i /dev/video2 -vframes 1 -q:v 2 /tmp/frame.jpg
```

### 6. Run VLM as a Background API Server (Optional)
```bash
# Start the llama.cpp server with vision support in the background
llama-server -m /home/arduino/mymodels/SmolVLM-500M-Instruct-Q8_0.gguf \
  --mmproj /home/arduino/mymodels/mmproj-SmolVLM-500M-Instruct-f16.gguf \
  -c 8192 > /tmp/llama.log 2>&1 &

# Convert an image to Base64 and send a POST request to the local API
base64 -w0 /tmp/test.jpg > /tmp/img.b64
echo '{"messages":[{"role":"user","content":[{"type":"image_url","image_url":{"url":"data:image/jpeg;base64,'$(cat /tmp/img.b64)'"}},{"type":"text","text":"Describe this image."}]}]}' > /tmp/req.json

curl http://127.0.0.1:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d @/tmp/req.json
```
