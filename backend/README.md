# SplitGreen Backend (Clean Version)

Simplified expense-splitting API with core features only.

## Features Included ✅

- **Auth**: Signup, signin, Google OAuth, OTP verification, logout
- **Users**: Profile management, preferences, stats
- **Groups**: Create, invite, manage members, view balances
- **Expenses**: Add, list, delete, split calculation (equally/percentage/exact/shares/by_item)
- **Receipts**: OCR parsing with Groq, confirm and create expense
- **Settlements**: Smart debt minimization, record settlements
- **Activity**: Global and group-specific feeds
- **Notifications**: Bell dropdown

## Features Removed ❌

- Analytics (charts, graphs, monthly, categories, radar, heatmap, top spenders)
- 2FA / Two-factor authentication
- Forgot password / Reset password
- Recurring expenses & scheduler
- Chats/Messages
- Subscription features
- Change password
- Resend OTP
- Calendar view for expenses
- CSV export

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required:
- MongoDB connection string
- JWT secret (generate a random string)
- SMTP credentials (Gmail App Password)
- Groq API key (for receipt parsing)
- Google OAuth credentials (from Google Cloud Console)

### 3. Run MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb
```

### 4. Start Server

```bash
python main.py
```

Server runs on `http://localhost:8000`

API docs: `http://localhost:8000/docs`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized origins: `http://localhost:5173`
6. Add authorized redirect URIs: `http://localhost:5173`
7. Copy Client ID and Client Secret to `.env`

## Project Structure

```
backend/
├── core/
│   ├── config.py          # Settings
│   ├── database.py        # MongoDB connection
│   ├── dependencies.py    # JWT middleware
│   ├── email.py           # OTP emails
│   └── security.py        # Password hashing, JWT, OTP
├── models/
│   ├── user.py            # User schemas
│   ├── group.py           # Group schemas
│   └── expense.py         # Expense schemas
├── routers/
│   ├── auth.py            # Signup, signin, Google OAuth
│   ├── users.py           # Profile, stats
│   ├── groups.py          # Group CRUD
│   ├── expenses.py        # Expense CRUD
│   ├── receipts.py        # OCR parsing
│   ├── settlements.py     # Smart settlements
│   ├── activity.py        # Activity feed
│   └── notifications.py   # Notifications
├── services/
│   ├── split_calc.py      # Split calculation logic
│   ├── receipt_parser.py  # Groq OCR parsing
│   └── settlement_algo.py # Debt minimization
├── main.py                # FastAPI app
├── requirements.txt       # Dependencies
└── .env.example           # Environment template
```

## API Endpoints

### Auth
- `POST /auth/signup` - Create account
- `POST /auth/signin` - Login with email/password
- `POST /auth/google` - Login with Google
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/logout` - Logout

### Users
- `GET /users/me` - Get profile
- `PATCH /users/me` - Update profile
- `GET /users/me/stats` - Get stats
- `PATCH /users/me/preferences` - Update preferences
- `POST /users/me/onboarding-complete` - Complete onboarding
- `DELETE /users/me` - Delete account

### Groups
- `GET /groups` - List groups
- `POST /groups` - Create group
- `GET /groups/{id}` - Get group details
- `PATCH /groups/{id}` - Update group
- `POST /groups/{id}/members` - Add member
- `DELETE /groups/{id}/members/{user_id}` - Remove member
- `DELETE /groups/{id}/leave` - Leave group
- `GET /groups/{id}/invite-link` - Get invite link
- `POST /groups/join/{code}` - Join via invite code
- `GET /groups/{id}/balances` - Get balances

### Expenses
- `GET /expenses` - List expenses (with filters)
- `POST /expenses` - Create expense
- `DELETE /expenses/{id}` - Delete expense
- `GET /expenses/share-preview` - Preview split calculation

### Receipts
- `POST /receipts/parse` - Parse OCR text with Groq
- `POST /receipts/confirm` - Confirm and create expense
- `GET /receipts/summary/{token}` - Public share link

### Settlements
- `GET /settlements` - List settlements
- `POST /settlements/{id}/record` - Mark as settled
- `GET /settlements/smart` - Get optimized settlements
- `POST /settlements/apply-smart` - Apply smart settlements
- `POST /settlements/remind/{user_id}` - Send reminder

### Activity & Notifications
- `GET /activity` - Global activity feed
- `GET /activity/groups/{id}` - Group activity feed
- `GET /notifications` - List notifications
- `PATCH /notifications/{id}/read` - Mark read
- `PATCH /notifications/read-all` - Mark all read

## Testing

Health check:
```bash
curl http://localhost:8000/health
```

Interactive docs:
```
http://localhost:8000/docs
```
