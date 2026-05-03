# SplitGreen Frontend

Beautiful expense-splitting web app built with React + Vite.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env`:
```bash
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Features

✅ **Beautiful UI** - 6 color palettes (Forest, Midnight, Desert, Ocean, Cherry, Slate)  
✅ **Particle Effects** - Animated backgrounds  
✅ **Google OAuth** - Sign in with Google  
✅ **Groups** - Create and manage expense groups  
✅ **Expenses** - Add, split, track expenses  
✅ **Receipts** - OCR scanning with Groq AI  
✅ **Settlements** - Smart debt minimization  
✅ **Real-time** - Activity feeds and notifications  

---

## Project Structure

```
frontend/
├── src/
│   ├── api.js          # Backend API integration
│   ├── App.jsx         # Main application component
│   ├── main.jsx        # Entry point with Google OAuth provider
│   └── (add more components as you build)
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.js      # Vite configuration
├── .env                # Environment variables (create this)
├── .env.example        # Environment template
├── INTEGRATION_GUIDE.md # Step-by-step integration guide
└── README.md           # This file
```

---

## Integration with Backend

See `INTEGRATION_GUIDE.md` for complete step-by-step instructions on:

- Setting up Google OAuth
- Connecting Auth components
- Loading real data from API
- Handling errors and loading states
- Managing user sessions

---

## Available Scripts

### `npm run dev`
Start development server on port 5173 with hot reload

### `npm run build`
Build for production to `dist/` folder

### `npm run preview`
Preview production build locally

---

## Key Files

### `src/api.js`
Complete API service layer with all backend endpoints:
- Auth (signup, signin, Google OAuth, OTP)
- Users (profile, preferences, stats)
- Groups (CRUD, invites, balances)
- Expenses (CRUD, filters, split preview)
- Receipts (OCR parsing, confirmation)
- Settlements (smart optimization, recording)
- Activity & Notifications

### `src/main.jsx`
App entry point wrapped with `GoogleOAuthProvider`

### `src/App.jsx`
Main application with:
- Landing page
- Auth flows (signup/signin/OTP)
- Dashboard with tabs
- Group management
- Expense tracking
- Settlement optimization

---

## Environment Variables

Required variables in `.env`:

```bash
# Backend API URL
VITE_API_URL=http://localhost:8000

# Google OAuth Client ID (get from Google Cloud Console)
VITE_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized origins: `http://localhost:5173`
5. Copy Client ID to `.env`

See backend `GOOGLE_OAUTH_GUIDE.md` for detailed instructions.

---

## Color Palettes

Switch themes in settings:

- 🌿 **Dark Jungle** - Deep forest greens
- 🌙 **Midnight** - Purple night vibes
- 🏜️ **Desert** - Warm sand tones
- 🌊 **Ocean** - Cool blue waves
- 🌸 **Cherry Blossom** - Soft pink accents
- 🪨 **Slate** - Professional gray

---

## Development Tips

### Hot Reload
Vite provides instant hot module replacement - save and see changes immediately

### API Debugging
- Open browser DevTools → Network tab
- Watch API calls to backend
- Check request/response payloads
- Verify JWT tokens in headers

### State Management
Currently uses React useState. For larger apps, consider:
- Context API for global state
- React Query for server state
- Zustand for simple state management

---

## Common Issues

### Port Already in Use
```bash
# Kill process on port 5173
npx kill-port 5173

# Or use different port
npm run dev -- --port 3000
```

### CORS Errors
Backend must allow `http://localhost:5173` in CORS origins (already configured)

### Google OAuth Fails
- Check `VITE_GOOGLE_CLIENT_ID` is set
- Verify authorized origins in Google Console
- Clear browser cache and retry

### API Calls Fail
- Check backend is running on `http://localhost:8000`
- Check `VITE_API_URL` in `.env`
- Verify JWT token exists in localStorage

---

## Next Steps

1. **Follow Integration Guide** - See `INTEGRATION_GUIDE.md`
2. **Connect Auth Components** - Add real signup/signin/Google OAuth
3. **Load Real Data** - Replace mock data with API calls
4. **Add Error Handling** - Show proper error messages
5. **Test End-to-End** - Signup → Create group → Add expense → Settle

---

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool & dev server
- **Google OAuth** - Authentication
- **Fetch API** - HTTP requests (in api.js)

---

## Production Build

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview

# Deploy dist/ folder to:
# - Vercel
# - Netlify  
# - Cloudflare Pages
# - Any static host
```

---

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR

---

## License

Private project - All rights reserved

---

## Support

For issues:
1. Check INTEGRATION_GUIDE.md
2. Verify environment variables
3. Check browser console for errors
4. Test backend endpoints directly
