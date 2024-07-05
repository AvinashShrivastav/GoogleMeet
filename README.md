# Video Calling Web App

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Technical Details](#technical-details)
6. [Dependencies](#dependencies)
7. [Troubleshooting](#troubleshooting)
8. [Contributing](#contributing)

## Introduction

This project is a Video Calling Web Application that supports peer-to-peer video and audio communication, chat, and screen sharing. It is designed for seamless video conferencing with multiple participants, with a user-friendly interface and real-time communication features.

## Features

- **Video and Audio Communication:** Enables real-time video and audio calls between users.
- **Screen Sharing:** Share your screen with other participants.
- **Chat:** Real-time messaging during the call.
- **Mute/Unmute Microphone:** Toggle the microphone on or off.
- **Turn On/Off Camera:** Toggle the video feed on or off.
- **Participant Management:** View and manage participants in the call.

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14.0.0 or later)
- [npm](https://www.npmjs.com/) (v6.0.0 or later)

### Steps

1. **Clone the repository:**

   ```bash
   [git clone https://github.com/yourusername/videocalling-app.git
   cd videocalling-app](https://github.com/AvinashShrivastav/GoogleMeet.git)
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the server:**

   ```bash
   npm start
   ```

4. **Access the application:**

   Open your browser and navigate to `http://localhost:3000`.

## Usage

1. **Start a Meeting:**
   - Enter your name and meeting ID to create or join a meeting.
   - Click on "Join Meeting" to enter the video call.

2. **Controls:**
   - **Mute/Unmute Microphone:** Click the microphone icon to toggle.
   - **Turn On/Off Camera:** Click the camera icon to toggle.
   - **Screen Sharing:** Click the screen share button to start or stop sharing your screen.
   - **Chat:** Use the chat box to send messages to other participants.

3. **Leave the Meeting:**
   - Click the "End Call" button to leave the meeting.

## Technical Details

### Core Components

- **`AppProcess`**: Manages peer connections, audio/video tracks, and media senders.
- **`MyApp`**: Handles socket connections, user management, and event handling.

### Key Functions

- **`setConnection`**: Establishes a peer-to-peer connection.
- **`SDPProcess`**: Manages SDP offers and answers for WebRTC connections.
- **`videoProcess`**: Handles video stream switching between camera and screen share.
- **`updateMediaSenders`**: Updates the media tracks sent over the peer connection.

### Ice Configuration

The application uses Google's public STUN servers for establishing peer connections:
```js
var iceConfiguration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
};
```

## Dependencies

- **[Express](https://expressjs.com/)**: Web framework for Node.js
- **[Socket.IO](https://socket.io/)**: Enables real-time, bidirectional communication
- **[WebRTC](https://webrtc.org/)**: Supports video, voice, and generic data to be sent between peers

## Troubleshooting

- **No Audio/Video Permission**: Ensure that your browser has permissions to access the microphone and camera.
- **Connection Issues**: Check your network settings and ensure you are not behind a restrictive firewall.
- **UI Not Responsive**: Ensure all necessary libraries and stylesheets are loaded correctly.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---

Enjoy seamless video calling with our web app! If you encounter any issues or have suggestions, feel free to open an issue on the GitHub repository.
