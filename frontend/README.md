# SubSync Frontend

Vite + React + Tailwind CSS frontend for the SubSync subscription management platform.

## Setup

This frontend uses:
- **Vite** - Lightning fast build tool
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

## Installation

```bash
cd frontend
npm install  # or yarn install
```

## Development

Start the development server:

```bash
npm run dev
# Server runs on http://localhost:3000
```

API calls to `/api/*` are proxied to `http://localhost:5000` (Flask backend).

## Build

Create production build:

```bash
npm run build
```

Output goes to `dist/` folder.

## Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx          # Email/password + Google OAuth login
│   │   ├── SignUpPage.jsx         # User registration
│   │   ├── ResetPasswordPage.jsx  # Password reset
│   │   └── SplashScreen.jsx       # Loading/success/error states
│   ├── components/
│   │   ├── auth/                  # Auth-related components
│   │   └── splash/                # Splash screen components
│   ├── App.jsx                    # Main app with routing
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles + Tailwind
├── index.html                     # HTML entry point
├── vite.config.js                 # Vite configuration
├── tailwind.config.js             # Tailwind CSS configuration
├── postcss.config.js              # PostCSS configuration
├── package.json                   # Dependencies
└── .gitignore                     # Git ignore rules
```

## Environment Variables

Create `.env.local` for local configuration:

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Color Scheme

Uses custom Material Design 3 colors from the schema:
- **Primary**: #031839 (dark blue)
- **Error**: #ba1a1a (red)
- **Secondary**: #4e6073 (slate)
- **Tertiary**: #251600 (brown)

Fonts:
- **Sans**: Manrope (UI text)
- **Serif**: Noto Serif (headings)

## Available Pages

- `/` - Splash screen (loading/success/error states)
- `/login` - Login page (email/password + Google)
- `/signup` - Sign up page
- `/reset-password` - Password reset page

## Next Steps

1. Install dependencies: `npm install`
2. Connect to Flask backend (configure VITE_API_URL)
3. Add Google OAuth configuration
4. Implement API calls in page components
5. Add state management (Context API or Redux)
6. Add form validation
7. Implement protected routes

## Notes

- Dependencies are still installing (yarn/npm can be slow)
- All HTML component designs have been converted to React
- Tailwind CSS is fully configured with custom colors
- Vite is configured to proxy `/api` calls to Flask backend
