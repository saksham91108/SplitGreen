# Frontend-Backend Integration Guide

## Complete Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install

# Or if starting fresh:
npm install react react-dom @react-oauth/google
npm install -D @vitejs/plugin-react vite
```

### 2. Environment Setup

Create `.env` file in frontend root:

```bash
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### 3. File Structure

```
frontend/
├── src/
│   ├── api.js           # API service layer (already created)
│   ├── App.jsx          # Main app component (integrate below)
│   ├── main.jsx         # Entry point (update below)
│   └── index.css        # Styles (optional)
├── .env                 # Environment variables
├── .env.example         # Template
├── package.json         # Dependencies
├── vite.config.js       # Vite config
└── index.html           # HTML template
```

---

## Integration Steps

### Step 1: Update main.jsx with Google OAuth Provider

```jsx
// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
```

---

### Step 2: Add API Integration to Auth Component

Replace the Auth component in your App.jsx with this connected version:

```jsx
// Connected Auth Component
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { api } from './api';

function Auth({ type, setPage, setUser, showToast, C }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle email/password signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api.signup(name, email, password);
      showToast("OTP sent to your email! Check your inbox.", "success");
      setShowOtpModal(true);
    } catch (error) {
      showToast(error.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle email/password signin
  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await api.signin(email, password, false);
      
      // Store token and user
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, "success");
      setPage("dashboard");
    } catch (error) {
      showToast(error.message || "Signin failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await api.verifyOtp(email, otp);
      
      // Store token and user
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      showToast(`Welcome, ${data.user.name}!`, "success");
      setPage("dashboard");
    } catch (error) {
      showToast(error.message || "Invalid OTP", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    
    try {
      const data = await api.googleSignin(credentialResponse.credential);
      
      // Store token and user
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setUser(data.user);
      showToast(`Welcome, ${data.user.name}!`, "success");
      
      // Check if new user needs onboarding
      if (data.is_new_user) {
        // Show onboarding or skip for now
        await api.completeOnboarding();
      }
      
      setPage("dashboard");
    } catch (error) {
      showToast(error.message || "Google signin failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    showToast("Google signin failed. Please try again.", "error");
  };

  // ... keep your existing JSX structure but update form handlers ...
  
  return (
    <div className="auth-page">
      {/* Your existing auth UI */}
      <form onSubmit={type === 'signup' ? handleSignup : handleSignin}>
        {type === 'signup' && (
          <input 
            className="inp" 
            placeholder="Full Name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input 
          className="inp" 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          className="inp" 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button 
          className="btn-p" 
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading..." : (type === 'signup' ? 'Sign Up' : 'Sign In')}
        </button>
      </form>

      {/* Google Sign-In Button */}
      <div style={{ marginTop: 20 }}>
        <div style={{ textAlign: 'center', margin: '20px 0', color: C.muted }}>
          OR
        </div>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="outline"
          size="large"
          text={type === 'signup' ? 'signup_with' : 'signin_with'}
          width="100%"
        />
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="modal-overlay" onClick={() => setShowOtpModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Verify OTP</h3>
            <p style={{ color: C.muted, marginBottom: 16 }}>
              Enter the 6-digit code sent to {email}
            </p>
            <form onSubmit={handleVerifyOtp}>
              <input
                className="inp"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                pattern="[0-9]{6}"
                required
                autoFocus
              />
              <button 
                className="btn-p" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Step 3: Add Real Data Loading to Dashboard

```jsx
// Updated Dashboard Component
import { useState, useEffect } from 'react';
import { api } from './api';

function Dashboard({ user, setPage, showToast, C }) {
  const [tab, setTab] = useState("overview");
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [groupsData, statsData] = await Promise.all([
        api.getGroups(),
        api.getStats(),
      ]);
      setGroups(groupsData);
      setStats(statsData);
    } catch (error) {
      showToast(error.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <div style={{ color: C.muted }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Your existing dashboard UI */}
      {/* Pass real data to child components */}
      {tab === "overview" && (
        <OverviewTab 
          groups={groups} 
          stats={stats}
          showToast={showToast} 
          C={C} 
        />
      )}
      {tab === "groups" && (
        <GroupsTab 
          groups={groups}
          setGroups={setGroups}
          showToast={showToast} 
          C={C} 
        />
      )}
      {/* ... other tabs ... */}
    </div>
  );
}
```

---

### Step 4: Connect Groups Tab

```jsx
// Connected GroupsTab
function GroupsTab({ groups, setGroups, showToast, C }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const newGroup = await api.createGroup(newGroupName, 'equally');
      setGroups([...groups, newGroup]);
      showToast("Group created successfully!", "success");
      setShowCreate(false);
      setNewGroupName("");
    } catch (error) {
      showToast(error.message || "Failed to create group", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGetInviteLink = async (groupId) => {
    try {
      const data = await api.getInviteLink(groupId);
      navigator.clipboard.writeText(data.invite_link);
      showToast("Invite link copied to clipboard!", "success");
    } catch (error) {
      showToast(error.message || "Failed to get invite link", "error");
    }
  };

  return (
    <div>
      {/* Your existing groups UI */}
      {groups.map(group => (
        <div key={group.id} className="card">
          <h3>{group.name}</h3>
          <p>Members: {group.members.length}</p>
          <p>Balance: ₹{group.balance}</p>
          <button 
            className="btn-o" 
            onClick={() => handleGetInviteLink(group.id)}
          >
            Copy Invite Link
          </button>
        </div>
      ))}

      {/* Create group modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Group</h3>
            <form onSubmit={handleCreateGroup}>
              <input
                className="inp"
                placeholder="Group Name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                required
              />
              <button 
                className="btn-p" 
                type="submit"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Group"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Step 5: Connect Expenses

```jsx
// Connected ExpensesTab
function ExpensesTab({ showToast, C }) {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, [selectedGroup, search]);

  const loadExpenses = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedGroup !== "All Groups") filters.search = selectedGroup;
      if (search) filters.search = search;
      
      const data = await api.getExpenses(filters);
      setExpenses(data);
    } catch (error) {
      showToast(error.message || "Failed to load expenses", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm("Delete this expense?")) return;
    
    try {
      await api.deleteExpense(expenseId);
      setExpenses(expenses.filter(e => e.id !== expenseId));
      showToast("Expense deleted", "success");
    } catch (error) {
      showToast(error.message || "Failed to delete expense", "error");
    }
  };

  if (loading) return <div>Loading expenses...</div>;

  return (
    <div>
      <input 
        className="inp" 
        placeholder="🔍 Search expenses..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      {expenses.map(expense => (
        <div key={expense.id} className="card">
          <h4>{expense.desc}</h4>
          <p>₹{expense.amount} paid by {expense.paid_by_name}</p>
          <p>Your share: ₹{expense.your_share}</p>
          <button 
            className="btn-danger" 
            onClick={() => handleDeleteExpense(expense.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### Step 6: Connect Settlements

```jsx
// Connected SettlementsTab
function SettlementsTab({ showToast, C }) {
  const [settlements, setSettlements] = useState([]);
  const [smartSettlements, setSmartSettlements] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettlements();
  }, []);

  const loadSettlements = async () => {
    setLoading(true);
    try {
      const data = await api.getSettlements();
      setSettlements(data);
    } catch (error) {
      showToast(error.message || "Failed to load settlements", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRecordSettlement = async (settlementId) => {
    try {
      await api.recordSettlement(settlementId);
      loadSettlements(); // Reload
      showToast("Settlement recorded!", "success");
    } catch (error) {
      showToast(error.message || "Failed to record settlement", "error");
    }
  };

  const handleGetSmartSettlements = async () => {
    try {
      const data = await api.getSmartSettlements();
      setSmartSettlements(data);
      showToast(`Optimized to ${data.total_transactions} transactions!`, "success");
    } catch (error) {
      showToast(error.message || "Failed to optimize", "error");
    }
  };

  const handleApplySmartSettlements = async () => {
    try {
      const data = await api.applySmartSettlements();
      loadSettlements(); // Reload
      showToast(`Applied ${data.count} smart settlements!`, "success");
    } catch (error) {
      showToast(error.message || "Failed to apply", "error");
    }
  };

  return (
    <div>
      <button className="btn-p" onClick={handleGetSmartSettlements}>
        🧠 Optimize Settlements
      </button>
      
      {smartSettlements && (
        <div className="card">
          <h3>Smart Settlements</h3>
          <p>Reduced to {smartSettlements.total_transactions} transactions</p>
          <p>Saved {smartSettlements.transactions_saved} transactions!</p>
          <button className="btn-p" onClick={handleApplySmartSettlements}>
            Apply Optimization
          </button>
        </div>
      )}

      {settlements.map(settlement => (
        <div key={settlement.id} className="card">
          <p>
            {settlement.from_user_name} → {settlement.to_user_name}
          </p>
          <p>₹{settlement.amount}</p>
          <p>{settlement.group_name}</p>
          {settlement.status === 'pending' && (
            <button 
              className="btn-p" 
              onClick={() => handleRecordSettlement(settlement.id)}
            >
              Record Payment
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### Step 7: Add Auto-Login Check

Update your main App component to check for existing session:

```jsx
// In App component
export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        // Verify token is still valid
        const userData = await api.getMe();
        setUser(userData);
        setPage("dashboard");
      } catch (error) {
        // Token expired or invalid
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setPage("landing");
      }
    } else {
      setPage("landing");
    }
    
    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // ... rest of your App component
}
```

---

## Testing the Integration

### 1. Start Backend
```bash
cd backend
python main.py
# Should run on http://localhost:8000
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
# Should run on http://localhost:5173
```

### 3. Test Flow
1. Go to http://localhost:5173
2. Click "Sign Up" → Create account → Verify OTP
3. Or click "Sign in with Google"
4. Create a group
5. Add an expense
6. Check settlements

---

## Common Issues & Fixes

### CORS Error
Backend should have CORS middleware (already configured in main.py):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 401 Unauthorized
- Check token is being sent in headers
- Token might have expired (default 24 hours)
- Check `authFetch` in api.js is working

### Google OAuth Not Working
- Check `VITE_GOOGLE_CLIENT_ID` in `.env`
- Verify authorized origins in Google Console
- Check GoogleOAuthProvider is wrapping App

### Network Error
- Backend not running
- Wrong `VITE_API_URL` in `.env`
- Check browser console for exact error

---

## Next Steps

1. **Add Loading States** - Show spinners during API calls
2. **Error Boundaries** - Catch React errors gracefully
3. **Optimistic Updates** - Update UI before API response
4. **Offline Support** - Cache data with service workers
5. **Real-time Updates** - WebSocket for live notifications

Your frontend now has full backend integration! 🎉
