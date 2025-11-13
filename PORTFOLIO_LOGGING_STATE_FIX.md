# Portfolio Logging State Visualization Fix

## Problem Statement
When logging an issue for a portfolio, the portfolio card was showing a red/orange border instead of a violet/purple background for the entire card. After logging is complete, the card should show as green.

## Solution Overview
Implemented a real-time portfolio state tracking system that displays:
1. **Violet/Purple background** (entire card) → When someone is actively logging an issue for that portfolio
2. **Green background** → After the issue is successfully logged (Updated <1h state)
3. **Purple border** → When portfolio is locked (existing functionality - unchanged)
4. **Other colors** → Inactive states (4h+, 3h, 2h, 1h) - unchanged

## Files Modified

### 1. `/client/src/components/PortfolioStatusHeatMap.js`
**Changes:**
- Added `activeReservations` state to track portfolios being logged
- Added `fetchData()` call to get active reservations from API
- Created `isPortfolioBeingLogged()` function to check if portfolio has active reservation
- Updated legend to include "Logging Issue..." state with violet/purple color
- Modified portfolio card rendering logic with priority system:
  - **Priority 1**: Being logged (violet/purple) - `beingLogged` state
  - **Priority 2**: Updated (green) - `updated` state  
  - **Priority 3**: Inactive states (red, orange, yellow, gray) - existing logic
- Changed locked border from `border-purple-500` to `border-purple-600` for distinction

**Key Logic:**
```javascript
// Check if portfolio is being logged (has active reservation)
const isPortfolioBeingLogged = (portfolioId) => {
  return activeReservations.some(reservation => 
    reservation.portfolio_id === portfolioId && 
    reservation.issue_hour === currentHour
  );
};

// Priority-based color assignment
if (beingLogged) {
  bgColor = 'bg-purple-500';
  textColor = 'text-white';
} else if (updated) {
  bgColor = '';
  textColor = 'text-white';
  // Uses inline style: backgroundColor: '#76AB3F'
} else {
  // Use existing color logic for inactive states
}
```

### 2. `/client/src/services/api.js`
**Changes:**
- Added `getActive()` method to `reservationAPI` to fetch all active reservations across all sessions

**New Method:**
```javascript
// Get all active reservations (for all users)
getActive: () => apiCall('/reservations/all'),
```

### 3. Backend (No changes needed)
The endpoint `/api/reservations/all` already exists in `server/index.js` and returns all active reservations:
```javascript
app.get('/api/reservations/all', (req, res) => {
  db.all(
    `SELECT r.*, p.name as portfolio_name 
     FROM hour_reservations r
     JOIN portfolios p ON r.portfolio_id = p.id
     WHERE r.expires_at > datetime("now")
     ORDER BY r.reserved_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});
```

## How It Works

### Workflow:
1. User opens IssueForm and selects Portfolio + Hour + Monitored By
2. System creates a reservation record with expiration time
3. PortfolioStatusHeatMap fetches all active reservations every 30 seconds
4. For each portfolio, system checks if it has an active reservation for current hour
5. If yes → Shows **violet/purple background** (entire card)
6. When user submits the form → Issue is created
7. On next refresh → Portfolio shows as **green** (Updated <1h state)
8. Reservation expires after completion or timeout

### State Priority:
```
1. Being Logged (violet) - Highest priority
   ↓
2. Updated (green) - After logging complete  
   ↓
3. Locked (purple border) - Administrative lock
   ↓
4. Inactive states (red/orange/yellow/gray) - Time-based
```

## Visual Legend
- 🟣 **Violet/Purple Background** + 🔄 icon → "Logging Issue..." (active reservation)
- 🟢 **Green Background** → "Updated (<1h)" (recently logged)
- 🟣 **Purple Border** (4px) → "Locked" (administrative lock)
- 🔴 **Red** → "No Activity (4h+)"
- 🟠 **Orange** → "3h Inactive"
- 🟡 **Yellow** → "2h Inactive"
- ⚪ **Gray** → "1h Inactive"

## Database Schema
Portfolio reservations are stored in `hour_reservations` table:
- `portfolio_id` - References portfolios.id
- `issue_hour` - Hour being monitored (0-23)
- `monitored_by` - User monitoring this portfolio
- `session_id` - Session that created reservation
- `expires_at` - Expiration timestamp
- `reserved_at` - Creation timestamp

## Auto-refresh
- Dashboard auto-refreshes every 30 seconds
- Reservations are checked on each refresh
- Expired reservations are automatically filtered out
- Manual refresh button available for immediate updates

## Testing
1. Open IssueForm page
2. Select a portfolio, hour, and monitored by
3. Go to Dashboard → Portfolio should show violet/purple background with 🔄 icon
4. Submit the issue form
5. Go back to Dashboard → Portfolio should show green background (Updated <1h)
6. Wait for reservation to expire → Portfolio returns to normal state

## Benefits
- **Real-time visibility** of who is logging issues for which portfolios
- **Prevents conflicts** by showing when a portfolio is being actively logged
- **Clear visual hierarchy** with priority-based color system
- **No manual intervention** needed - fully automatic state management
- **Backward compatible** - All existing features still work

## Notes
- Uses SQLite database with `id` as primary key for portfolios
- Reservations expire automatically after a set time
- Works across multiple browser sessions
- Compatible with existing locking system
