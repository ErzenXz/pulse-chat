# PulseChat 💬

<p align="center">
  <span style="font-size: 64px;">💭</span>
</p>

<p align="center">
  A modern real-time messaging application built with Next.js, React, and Socket.IO
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#usage">Usage</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

## Overview 🌟

PulseChat is a feature-rich real-time messaging application that enables users to communicate seamlessly through text, images, and files. With a sleek, responsive interface and robust functionality, PulseChat delivers a modern messaging experience with a focus on speed, reliability, and user experience.

## Features ✨

- **Real-time Messaging** 📨 - Instant message delivery using Socket.IO
- **User Authentication** 🔐 - Secure JWT-based authentication system
- **Conversation Management** 💭 - Create, organize, and manage multiple conversations
- **Media Sharing** 📎 - Send and receive images and files with progress tracking
- **Message History** 📜 - View and load previous messages with infinite scrolling
- **Message Grouping** 📅 - Messages are grouped by date for better readability
- **Responsive Design** 📱 - Works seamlessly across desktop and mobile devices
- **Dark/Light Theme** 🌓 - Toggle between dark and light themes
- **Message Deletion** 🗑️ - Delete messages you've sent
- **User Search** 🔍 - Find and connect with other users easily

## Tech Stack 🛠️

### Frontend
- **Next.js** ⚡ - React framework with server-side rendering
- **React** ⚛️ - UI library
- **TypeScript** 📘 - Type-safe JavaScript
- **Tailwind CSS** 🎨 - Utility-first CSS framework
- **Socket.IO Client** 🔌 - Real-time bidirectional communication
- **Radix UI** 🎯 - Unstyled, accessible UI components
- **Framer Motion** 🎬 - Animation library
- **Lucide React** 🎴 - Icon library
- **React Hook Form** 📝 - Form validation
- **Zod** ✅ - TypeScript-first schema validation
- **Sonner** 🔔 - Toast notifications
- **date-fns** 📅 - Date utility library
- **Next Themes** 🎭 - Theme management

### Backend
- **Custom API** 🚀 - RESTful API endpoints for data operations

## Getting Started 🚀

### Prerequisites

- Node.js 16.8.0 or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/ErzenXz/pulse-chat.git
cd pulse-chat
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Edit the .env.local file with your configuration

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open your browser and navigate to http://localhost:3000

## Usage 📱

### Authentication 🔐

Sign up for a new account or log in with existing credentials.

### Messaging 💬

1. Start a new conversation by searching for a user
2. Type messages in the input field and press Enter or click the Send button
3. Attach files by clicking the paperclip icon
4. View older messages by scrolling up

### Settings ⚙️

- Toggle between dark and light themes using the theme switcher
- Manage your profile settings through the profile menu

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License 📄

This project is licensed under the AGPL License - see the LICENSE file for details.

## Acknowledgments 🙏

- [Next.js](https://nextjs.org/) - The React Framework
- [Radix UI](https://www.radix-ui.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Socket.IO](https://socket.io/) - Real-time engine

---

<p align="center">
  Made with ❤️ by Erzen
</p>
