# Hand Tracking Plus Extension for TurboWarp

A comprehensive MediaPipe-based hand tracking extension for creating Mixed Reality experiences in TurboWarp.

## ✨ Features

### Core Tracking
- **Precise Coordinates:** X/Y positions for palm + 5 fingertips
- **Interaction Detection:** Pinch strength (0-100) for "air tap" inputs
- **Hand Properties:** Tilt, size, speed, left/right detection

### Gesture Recognition
- `is fist?` - detects closed fist (grip strength > 55)
- `is open hand?` - detects open palm
- `is pinching?` - detects thumb-index pinch (strength > 55)
- `is pointing?` - detects pointing gesture

### Visual Feedback
- **Camera overlay** with adjustable opacity
- **Hand skeleton** visualization
- **Hand contour** 

### Event System
- `when hand appears/disappears` - hat blocks for hand detection
- `when pinch starts/ends` - hat blocks for pinch events

## 🚀 Quick Start

1. Add extension: `Editor → Extensions → Hand Tracking Plus`
2. Add block: `start hand tracking`
3. Use blocks like `palm X`, `pinch strength`, `is fist?`

## 🎮 Demo Project

Try the included `demo.sb3` project that shows:
- Following hand with sprite
- Pinch-controlled interactions
- Gesture-based color changing

## ⚙️ Requirements

- Modern browser with camera access
- Works only in TurboWarp (not compatible with Scratch)
- Requires unsandboxed extension permission

## 🤝 Contributing

This extension uses MediaPipe Hands under the hood. All core features are stable and production-ready.
