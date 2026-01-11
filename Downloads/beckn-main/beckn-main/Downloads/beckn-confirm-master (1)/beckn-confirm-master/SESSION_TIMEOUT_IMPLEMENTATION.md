# 🕐 Session Timeout Implementation - 45 Minutes

## Overview
Implemented a comprehensive session timeout mechanism where users remain logged in for **45 minutes** after authentication. Once the session expires, users are automatically logged out and required to log in again.

## ✅ Implementation Details

### **Backend Implementation**

#### 1. **JWT Token Configuration** (`bap-travel-discovery/src/controllers/authController.js`)
- **Session Duration**: 45 minutes (`JWT_EXPIRES_IN = '45m'`)
- **Token Payload**: Includes `userId`, `email`, and `iat` (issued at time)
- **Expiration Tracking**: Returns `expiresAt` and `expiresIn` to frontend

```javascript
const JWT_EXPIRES_IN = '45m'; // 45 minutes session timeout

// Token generation
const token = jwt.sign(
    { 
        userId: user.id, 
        email: user.email,
        iat: Math.floor(Date.now() / 1000)
    }, 
    JWT_SECRET, 
    { expiresIn: JWT_EXPIRES_IN }
);

// Response includes expiration info
{
    token,
    expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    expiresIn: 2700 // 45 minutes in seconds
}
```

#### 2. **Enhanced Auth Middleware** (`bap-travel-discovery/src/middleware/authMiddleware.js`)
- **Token Validation**: Verifies JWT signature and expiration
- **Session Expiry Check**: Validates token hasn't expired
- **Warning Headers**: Adds headers when session expires soon (< 5 minutes)
- **Error Handling**: Returns specific error codes for expired sessions

```javascript
// Check if token is expired
if (timeLeft <= 0) {
    return res.status(401).json({ 
        error: 'Session has expired. Please login again.',
        expired: true,
        code: 'SESSION_EXPIRED'
    });
}

// Warning for sessions expiring soon
if (timeLeft < 300) { // 5 minutes
    res.setHeader('X-Session-Warning', 'Session expires soon');
    res.setHeader('X-Time-Left', timeLeft);
}
```

#### 3. **New API Endpoints**

**Logout Endpoint**:
```
POST /api/auth/logout
Authorization: Bearer <token>
```
- Logs out user and invalidates session
- Clears frontend token storage

**Session Check Endpoint**:
```
GET /api/auth/session
Authorization: Bearer <token>
```
- Returns session validity and time remaining
- Response:
```json
{
    "success": true,
    "isValid": true,
    "expiresAt": "2025-12-12T08:45:00.000Z",
    "timeLeftSeconds": 1234,
    "timeLeftMinutes": 20
}
```

### **Frontend Implementation**

#### 1. **Enhanced Auth Context** (`frontend-travel-discovery/src/context/AuthContext.jsx`)

**Session Monitoring**:
- Tracks session expiration time
- Checks session validity every minute
- Shows warning 5 minutes before expiry
- Auto-logout at expiration

```javascript
// Session monitoring setup
const setupSessionMonitoring = (expiryTime) => {
    // Show warning 5 minutes before expiry
    const warningTime = timeUntilExpiry - 5 * 60 * 1000;
    
    // Auto logout at expiry
    setTimeout(() => {
        logout();
        alert('Your session has expired. Please log in again.');
    }, timeUntilExpiry);
    
    // Check session every minute
    setInterval(async () => {
        const response = await axios.get('/api/auth/session');
        if (!response.data.isValid) {
            logout();
        }
    }, 60000);
};
```

**New Context Values**:
- `sessionExpiry`: Session expiration timestamp
- `showSessionWarning`: Boolean for warning display
- `extendSession()`: Function to extend session (future enhancement)
- `getSessionTimeLeft()`: Returns remaining seconds

#### 2. **Session Warning Component** (`frontend-travel-discovery/src/components/SessionWarning.jsx`)

**Features**:
- Displays warning banner 5 minutes before expiry
- Shows countdown timer (MM:SS format)
- "Stay Logged In" button (for future token refresh)
- "Logout Now" button for manual logout
- Auto-hides when session is extended or user logs out

**Visual Design**:
- Yellow warning banner at top of page
- Fixed position (always visible)
- Responsive design
- Clear call-to-action buttons

#### 3. **API Interceptors** (`frontend-travel-discovery/src/services/api.js`)

**Request Interceptor**:
- Automatically adds auth token to all requests
- Ensures consistent authentication

**Response Interceptor**:
- Detects session expiration (401 + SESSION_EXPIRED code)
- Clears local storage
- Shows expiration message
- Redirects to login page

```javascript
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.data?.code === 'SESSION_EXPIRED') {
            localStorage.removeItem('token');
            alert('Your session has expired. Please log in again.');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

## 🎯 User Experience Flow

### **Login Flow**:
1. User logs in with credentials
2. Backend generates JWT token (45-minute expiry)
3. Frontend stores token and expiration time
4. Session monitoring starts automatically
5. User can use the application normally

### **Active Session**:
1. All API requests include auth token
2. Backend validates token on each request
3. Frontend checks session every minute
4. User remains logged in for 45 minutes

### **Session Warning (Last 5 Minutes)**:
1. Warning banner appears at top of page
2. Countdown timer shows time remaining
3. User can choose to:
   - Continue using (warning stays visible)
   - Logout manually

### **Session Expiration**:
1. At 45 minutes, session expires
2. Backend rejects all requests with SESSION_EXPIRED
3. Frontend shows expiration alert
4. User is automatically logged out
5. Redirect to login page
6. User must log in again to continue

## 📊 Technical Specifications

### **Timing Configuration**:
- **Session Duration**: 45 minutes (2700 seconds)
- **Warning Time**: 5 minutes before expiry (300 seconds)
- **Check Interval**: Every 60 seconds
- **Token Format**: JWT with standard claims

### **Security Features**:
- JWT signature verification
- Token expiration validation
- Secure token storage (localStorage)
- Automatic cleanup on expiry
- Protected routes require valid token

### **Error Handling**:
- Expired token: 401 + SESSION_EXPIRED code
- Invalid token: 401 + error message
- Missing token: 401 + error message
- Network errors: Graceful degradation

## 🧪 Testing the Implementation

### **Test Session Timeout**:
1. Log in to the application
2. Note the login time
3. Wait 40 minutes
4. Warning banner should appear
5. Wait 5 more minutes
6. Should be automatically logged out

### **Test Session Warning**:
1. Log in to the application
2. Wait 40 minutes
3. Yellow warning banner should appear
4. Countdown timer should show remaining time
5. Can click "Logout Now" to logout immediately

### **Test API Expiration Handling**:
1. Log in and get a token
2. Wait for token to expire (45 minutes)
3. Try to make an API request
4. Should receive 401 error with SESSION_EXPIRED
5. Should be redirected to login page

### **Test Manual Logout**:
1. Log in to the application
2. Click profile dropdown
3. Click "Logout"
4. Should be logged out immediately
5. Token should be cleared from storage

## 🔄 Future Enhancements

### **Token Refresh** (Not Implemented):
- Implement refresh token mechanism
- Allow session extension without re-login
- "Stay Logged In" button functionality

### **Remember Me** (Not Implemented):
- Optional longer session duration
- Persistent login across browser sessions
- Secure cookie storage

### **Activity-Based Timeout** (Not Implemented):
- Reset timer on user activity
- Idle timeout vs absolute timeout
- Configurable timeout periods

### **Multi-Tab Support** (Not Implemented):
- Sync session across browser tabs
- Broadcast logout to all tabs
- Shared session state

## 📋 Configuration

### **Backend Configuration** (`.env`):
```env
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=45m  # Can be changed to any duration
```

### **Frontend Configuration**:
```javascript
// In AuthContext.jsx
const SESSION_DURATION = 45 * 60 * 1000; // 45 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds
const CHECK_INTERVAL = 60 * 1000; // 1 minute in milliseconds
```

## ✅ Implementation Checklist

- ✅ Backend JWT token with 45-minute expiration
- ✅ Enhanced auth middleware with expiry validation
- ✅ Logout endpoint for manual logout
- ✅ Session check endpoint for status monitoring
- ✅ Frontend session monitoring system
- ✅ Session warning component with countdown
- ✅ API interceptors for automatic handling
- ✅ Auto-logout on expiration
- ✅ Redirect to login after expiry
- ✅ Clear error messages for users
- ✅ Responsive warning banner design
- ✅ Integration with existing auth flow

## 🎉 Status: FULLY IMPLEMENTED

The 45-minute session timeout mechanism is now fully operational with:
- Automatic session expiration after 45 minutes
- Warning notification 5 minutes before expiry
- Automatic logout and redirect to login
- Manual logout capability
- Session status monitoring
- Comprehensive error handling
- User-friendly notifications

**Ready for production use!** 🚀
