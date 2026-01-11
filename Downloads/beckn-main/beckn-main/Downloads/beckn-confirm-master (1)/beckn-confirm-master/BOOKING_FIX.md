# Booking Navigation Fix

## Issue
When clicking "Book Now" button on flight/hotel cards, users were being redirected to the home page instead of the booking page.

## Root Cause
The `TravelCard` and `HotelCard` components were passing incorrect state parameters to the booking page:
- **Expected**: `{ item: option, type: travelMode }`
- **Actual**: `{ flight: option }` (TravelCard) and no navigation (HotelCard)

## Changes Made

### 1. TravelCard.jsx
**File**: `frontend-travel-discovery/src/components/TravelCard.jsx`

**Before**:
```javascript
const handleBookNow = () => {
  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/booking', flight: option } });
    return;
  }
  navigate('/booking', { state: { flight: option } });
};
```

**After**:
```javascript
const handleBookNow = () => {
  if (!isAuthenticated) {
    navigate('/login', { state: { from: '/booking', item: option, type: option.travelMode } });
    return;
  }
  navigate('/booking', { state: { item: option, type: option.travelMode } });
};
```

### 2. HotelCard.jsx
**File**: `frontend-travel-discovery/src/components/HotelCard.jsx`

**Added**:
- Import `useNavigate` from 'react-router-dom'
- Import `useAuth` from '../context/AuthContext'
- Added `handleBookNow` function
- Replaced "View only" text with "Book Now" button

**New Code**:
```javascript
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HotelCard = ({ option }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/booking', item: option, type: 'hotel' } });
      return;
    }
    navigate('/booking', { state: { item: option, type: 'hotel' } });
  };
  
  // ... rest of component
  
  // In JSX:
  <button
    onClick={handleBookNow}
    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-colors text-sm"
  >
    Book Now
  </button>
}
```

## State Parameters

The booking page now correctly receives:
- `item`: The selected flight/hotel object with all details
- `type`: The travel mode ('flight' or 'hotel')

These parameters are used throughout the booking flow:
1. **BookingPage** - Displays booking form with item details
2. **PaymentPage** - Shows payment interface with item price
3. **BookingConfirmation** - Displays confirmation with complete booking details

## Testing

### Test Flight Booking:
1. Go to http://localhost:3000
2. Search for flights (e.g., DEL → SIN)
3. Click "Book Now" on any flight card
4. ✅ Should navigate to `/booking` with flight details
5. Fill in passenger and address details
6. Click "Confirm Booking"
7. ✅ Should navigate to `/payment` with booking data
8. Complete payment
9. ✅ Should navigate to `/booking-confirmation`

### Test Hotel Booking:
1. Go to http://localhost:3000
2. Search for hotels (e.g., Mumbai)
3. Click "Book Now" on any hotel card
4. ✅ Should navigate to `/booking` with hotel details
5. Follow same flow as flights

## Status
✅ Fixed - TravelCard navigation
✅ Fixed - HotelCard navigation
✅ Added Book Now button to HotelCard
✅ Consistent state parameters across all components
✅ Hot reload working (Vite HMR)

---
**Last Updated**: December 7, 2025
