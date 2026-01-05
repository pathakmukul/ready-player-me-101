# Ready Player Me Avatar Animator

A real-time 3D avatar animation system with 45+ professional mocap animations and dynamic lip sync.

![React](https://img.shields.io/badge/React-19.0.0-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.169.0-green)
![Ready Player Me](https://img.shields.io/badge/Ready%20Player%20Me-SDK-purple)

## 🎮 Features

- **45 Real Animations**: Professional motion capture animations from Ready Player Me's library
- **Dynamic Lip Sync**: Automatic mouth movements for talking animations using blend shapes
- **Avatar Creation**: Integrated Ready Player Me avatar creator
- **Real-time Preview**: Instant animation playback with smooth transitions
- **Position Lock**: Avatars stay in view during animations (no sliding away)
- **Categories**: Organized animations - Movement, Idle, Emotions, Gestures, Dance

## 🚀 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/pathakmukul/ready-player-me-101.git
cd ready-player-me-101
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```
REACT_APP_RPM_API_KEY=your_ready_player_me_api_key
```

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📁 Animation Library

### Movement (9 animations)
- Walk, Run, Jump, Jog
- Strafe Left/Right
- Walk/Jog Backward
- Crouch, Fall

### Idle Variations (7 animations)
- Multiple idle poses for variety

### Emotions (6 animations)
- Happy, Sad, Angry
- Surprised, Think, Confused

### Communication (6 animations)
- Wave + 5 talking animations with lip sync

### Dance (13 animations)
- 13 unique dance moves

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **Three.js** - 3D Graphics
- **React Three Fiber** - React renderer for Three.js
- **Ready Player Me SDK** - Avatar system
- **TypeScript** - Type safety

## 📝 Usage

1. **Create Avatar**: Click "Create Avatar" to open Ready Player Me creator
2. **Select Avatar**: Choose from your saved avatars in the left panel
3. **Play Animations**: Click any animation button to see it in action
4. **Lip Sync**: Talk animations automatically animate mouth movements

## 🎯 Future Goals

The system is designed for programmatic control - users will be able to describe scenes in natural language, and an LLM will convert them to animation scripts.

## 📄 License

MIT

## 🙏 Credits

- Animations from [Ready Player Me Animation Library](https://github.com/readyplayerme/animation-library)
- Built with React Three Fiber and Three.js