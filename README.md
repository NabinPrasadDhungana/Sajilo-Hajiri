# Sajilo-Hajiri
## 📦 Installation Guide

To set up the Face Recognition Attendance System, follow the steps below.

### ✅ Prerequisites

- Python 3.12 (required for compatibility with prebuilt dlib wheels)
- Virtual environment (recommended)

### 🛠️ Step-by-Step Setup

```bash
# Step 1: Upgrade pip, setuptools, and wheel
pip install --upgrade pip setuptools wheel

# Step 2: Install CMake (required for building dlib)
pip install cmake

# Step 3: Install dlib (this may fail if you don’t have build tools)
pip install dlib

# Step 4: Install face_recognition
pip install face_recognition
