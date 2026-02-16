# Chat Application Frontend

A modern, real-time chat application built with React, Vite, and Tailwind CSS. Features include real-time messaging via WebSocket, file/media sharing, email verification with OTP, and a beautiful responsive UI.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.8-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.0-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

### Authentication & Security
- ✅ **User Registration** with email verification
- ✅ **OTP Verification** for email validation
- ✅ **JWT Authentication** with automatic token refresh
- ✅ **Password Reset** flow with OTP
- ✅ **Secure Login** with credential validation

### Real-Time Chat
- ✅ **Instant Messaging** via WebSocket
- ✅ **Message Read Receipts** (single/double check marks)
- ✅ **Typing Indicators** support
- ✅ **Message History** with pagination
- ✅ **Conversation List** with unread counts
- ✅ **Auto-reconnection** when connection is lost

### Media & File Sharing
- ✅ **Image Sharing** with preview and full-screen view
- ✅ **Video Sharing** with inline player
- ✅ **Audio Sharing** with inline player
- ✅ **Document Sharing** (PDF, DOC, TXT, ZIP, etc.)
- ✅ **File Upload** with size validation (max 10MB)
- ✅ **Captions** for media messages
- ✅ **Download** functionality for all files

### Notifications
- ✅ **Real-time Push Notifications** via WebSocket
- ✅ **Notification Center** with unread badge
- ✅ **Toast Notifications** for new messages
- ✅ **Mark as Read** functionality
- ✅ **Notification Filtering** (read/unread)

### User Profile
- ✅ **View Profile** with avatar
- ✅ **Edit Profile** information
- ✅ **Profile Photo** display
- ✅ **User Details** (bio, location, phone, website)

### UI/UX
- ✅ **Responsive Design** (mobile, tablet, desktop)
- ✅ **Modern UI** with Tailwind CSS
- ✅ **Smooth Animations** and transitions
- ✅ **Loading States** and error handling
- ✅ **Dark Mode** ready (can be implemented)
- ✅ **Emoji Support** in messages

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **Backend Server** - Django backend must be running ([Backend Repository](https://github.com/yourusername/chat-backend))

## 🚀 Getting Started

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Marjia029/chat-system-frontend.git

# Navigate to the project directory
cd react-chat-frontend
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# OR using yarn
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add the following environment variables:

```env
# API Configuration
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws/chat/

# Optional: For production
# VITE_API_URL=https://your-production-domain.com/api
# VITE_WS_URL=wss://your-production-domain.com/ws/chat/
```

### 4. Start the Development Server

```bash
# Using npm
npm run dev

# OR using yarn
yarn dev
```

The application will be available at **http://localhost:3000**

### 5. Build for Production

```bash
# Using npm
npm run build

# OR using yarn
yarn build
```

The production-ready files will be in the `dist` folder.

### 6. Preview Production Build

```bash
# Using npm
npm run preview

# OR using yarn
yarn preview
```

## 📁 Project Structure

```
chat-frontend/
├── public/                 # Static assets
├── src/
│   ├── api/               # API client functions
│   │   ├── axios.js       # Axios instance with interceptors
│   │   ├── auth.js        # Authentication API calls
│   │   ├── chat.js        # Chat API calls
│   │   └── notifications.js # Notification API calls
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyOTP.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── chat/         # Chat components
│   │   │   ├── ConversationList.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── MediaMessageBubble.jsx
│   │   │   ├── MessageInput.jsx
│   │   │   └── FilePreview.jsx
│   │   ├── layout/       # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   └── Layout.jsx
│   │   ├── notifications/ # Notification components
│   │   │   └── NotificationBell.jsx
│   │   └── profile/      # Profile components
│   │       └── ProfileModal.jsx
│   ├── contexts/         # React contexts
│   │   ├── AuthContext.jsx
│   │   ├── WebSocketContext.jsx
│   │   └── NotificationContext.jsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useWebSocket.js
│   │   └── useNotifications.js
│   ├── pages/            # Page components
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ChatPage.jsx
│   │   └── ProfilePage.jsx
│   ├── utils/            # Utility functions
│   │   ├── storage.js    # LocalStorage helpers
│   │   └── formatters.js # Date/time formatters
│   ├── App.jsx           # Main App component
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── .env                  # Environment variables
├── .gitignore           # Git ignore file
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 🛠️ Technologies Used

### Core
- **React 18.2.0** - UI library
- **Vite 5.0.8** - Build tool and dev server
- **React Router DOM 6.21.0** - Client-side routing

### Styling
- **Tailwind CSS 3.4.0** - Utility-first CSS framework
- **PostCSS** - CSS processor
- **Autoprefixer** - CSS vendor prefixing

### State Management & API
- **Axios 1.6.2** - HTTP client
- **React Context API** - Global state management
- **WebSocket** - Real-time communication

### UI Components & Icons
- **Lucide React 0.298.0** - Icon library
- **React Hot Toast 2.4.1** - Toast notifications

### Utilities
- **date-fns 3.0.6** - Date formatting and manipulation

## 🔑 Key Features Explained

### Authentication Flow

1. **Registration**
   ```
   User enters credentials → Backend creates inactive user → 
   OTP sent to email → User verifies OTP → Account activated
   ```

2. **Login**
   ```
   User enters credentials → Backend validates → 
   JWT tokens issued → User authenticated → Redirect to chat
   ```

3. **Password Reset**
   ```
   User requests reset → OTP sent to email → 
   User verifies OTP → New password set → Success
   ```

### Real-Time Messaging

```javascript
// WebSocket connection established
WebSocket → ws://localhost:8000/ws/chat/?token=<JWT_TOKEN>

// Message sent
Client → { type: 'chat_message', recipient_id: 2, content: 'Hello' }

// Message received
Server → { type: 'chat_message', message: {...} }
```

### File Upload Process

```javascript
// Text messages → WebSocket
sendMessage(recipientId, content)

// Media/Files → HTTP API (FormData)
FormData → { recipient, message_type, content, file }
```

## 📱 Responsive Breakpoints

| Breakpoint | Size | Devices |
|------------|------|---------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

## 🎨 Color Palette

```javascript
// Primary Colors (Blue)
primary-50:  '#f0f9ff'
primary-100: '#e0f2fe'
primary-200: '#bae6fd'
primary-300: '#7dd3fc'
primary-400: '#38bdf8'
primary-500: '#0ea5e9'  // Main brand color
primary-600: '#0284c7'
primary-700: '#0369a1'
primary-800: '#075985'
primary-900: '#0c4a6e'
```

## 🔐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:8000/api` |
| `VITE_WS_URL` | WebSocket server URL | `ws://localhost:8000/ws/chat/` |

**Note:** For production, use `https://` for API and `wss://` for WebSocket.

## 🐛 Common Issues & Solutions

### Issue: WebSocket connection fails

**Solution:**
```bash
# Check if backend is running
curl http://localhost:8000/api/accounts/users/

# Check if Redis is running
redis-cli ping
# Should return: PONG
```

### Issue: CORS errors

**Solution:** Ensure backend `settings.py` has correct CORS configuration:
```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
]
```

### Issue: File upload fails

**Solution:** Check file size (max 10MB) and ensure backend has proper media configuration:
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

### Issue: JWT token expired

**Solution:** The app automatically refreshes tokens. If issues persist:
```javascript
// Clear tokens and login again
localStorage.clear()
// Navigate to /login
```

## 📊 Performance Optimization

### Code Splitting
```javascript
// Lazy load pages
const ChatPage = lazy(() => import('./pages/ChatPage'));
```

### Image Optimization
- Compress images before upload
- Use appropriate image formats (WebP for photos, SVG for icons)
- Implement lazy loading for images

### Bundle Size
```bash
# Analyze bundle size
npm run build
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration with OTP
- [ ] Email verification
- [ ] Login/Logout
- [ ] Password reset
- [ ] Send text message
- [ ] Send image
- [ ] Send video
- [ ] Send file
- [ ] Receive notifications
- [ ] Mark messages as read
- [ ] Profile update
- [ ] Conversation list refresh


## 📖 API Documentation

### Authentication Endpoints

```javascript
// Register
POST /api/accounts/register/
Body: { email, username, password, password2 }

// Verify OTP
POST /api/accounts/verify-otp/
Body: { email, otp, purpose }

// Login
POST /api/accounts/login/
Body: { email, password }
Response: { access, refresh }

// Refresh Token
POST /api/accounts/token/refresh/
Body: { refresh }
```

### Chat Endpoints

```javascript
// Send Message
POST /api/chat/send/
Body: FormData { recipient, content, message_type, file }

// Get Conversations
GET /api/chat/conversations/

// Get Message History
GET /api/chat/history/:userId/
```

### WebSocket Events

```javascript
// Connect
ws://localhost:8000/ws/chat/?token=<JWT_TOKEN>

// Send Message
{ type: 'chat_message', recipient_id: 2, content: 'Hello' }

// Open Chat
{ type: 'open_chat', chat_with: 2 }

// Close Chat
{ type: 'close_chat', chat_with: 2 }

// Receive Message
{ type: 'chat_message', message: {...} }

// Receive Notification
{ type: 'notification', notification: {...} }
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards

- Use ES6+ syntax
- Follow React best practices
- Use functional components with hooks
- Write meaningful commit messages
- Add comments for complex logic
- Keep components small and focused


## 👥 Authors

- **Marjia Afroj** - *Initial work* - [YourGitHub](https://github.com/Marjia029)

## 🙏 Acknowledgments

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Django Documentation](https://docs.djangoproject.com/)


## 🗺️ Roadmap

### Version 2.0
- [ ] Group chat functionality
- [ ] Voice/Video calling
- [ ] Message reactions (emoji)
- [ ] Message forwarding
- [ ] Message deletion
- [ ] Search messages
- [ ] Dark mode
- [ ] Message encryption
- [ ] Online/Offline status
- [ ] Last seen timestamp
- [ ] Typing indicators
- [ ] Message threads/replies
- [ ] Pin important messages
- [ ] Archive conversations
- [ ] Block/Unblock users
- [ ] Report inappropriate content

### Version 2.1
- [ ] Desktop notifications
- [ ] PWA support
- [ ] Offline mode
- [ ] Message sync
- [ ] Multi-device support
- [ ] Export chat history
- [ ] Custom themes
- [ ] Stickers and GIFs
- [ ] Voice messages
- [ ] Location sharing
- [ ] Contact sharing
- [ ] Poll creation
- [ ] Scheduled messages

## 📈 Project Stats

- **Lines of Code:** ~5,000+
- **Components:** 25+
- **API Endpoints:** 15+
- **Dependencies:** 20+

## 🔗 Related Links

- [Backend Repository](https://github.com/Marjia029/django-chat-system)

---

**⭐ Star this repo if you find it helpful!**