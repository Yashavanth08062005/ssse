# 🌍 Beckn Travel Discovery Platform

A complete travel booking platform built on the Beckn Protocol, enabling discovery and booking of flights and hotels through a decentralized network.

## 🎯 Features

- ✈️ **Flight Search & Booking** - Domestic and International flights
- 🏨 **Hotel Search & Booking** - Hotels across multiple cities
- 🔐 **User Authentication** - Secure registration and login
- 📱 **Responsive UI** - Modern React-based frontend
- 🔄 **Beckn Protocol** - Decentralized discovery and transactions
- 🌐 **Multi-BPP Support** - Aggregates results from multiple providers

## 🏗️ Architecture

```
┌─────────────────┐
│    Frontend     │ (React + Vite)
│   Port: 3000    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   BAP Service   │ (Beckn Application Platform)
│   Port: 8081    │
└────────┬────────┘
         │
         ├──────────────┬──────────────┬──────────────┐
         ▼              ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Flights BPP  │ │ Intl Flights │ │  Hotels BPP  │ │ PostgreSQL   │
│ Port: 7001   │ │ Port: 7005   │ │ Port: 7003   │ │ Port: 5432   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

## 🚀 Quick Start

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

### TL;DR
```bash
# 1. Setup database
psql -U postgres -d travel_discovery -f database-setup.sql
psql -U postgres -d travel_discovery -f database-auth-setup.sql

# 2. Install dependencies (in each service folder)
npm install

# 3. Start services (in separate terminals)
cd bap-travel-discovery && npm start
cd travel-discovery-bpp-flights && npm start
cd travel-discovery-bpp-international-flights && npm start
cd travel-discovery-bpp-hotels && npm start
cd frontend-travel-discovery && npm run dev

# 4. Open browser
http://localhost:3000
```

## 📦 Project Structure

```
beckn-project-/
├── bap-travel-discovery/              # BAP Service (Aggregator)
├── travel-discovery-bpp-flights/      # Domestic Flights Provider
├── travel-discovery-bpp-international-flights/  # International Flights Provider
├── travel-discovery-bpp-hotels/       # Hotels Provider
├── frontend-travel-discovery/         # React Frontend
├── database-setup.sql                 # Database schema
├── database-auth-setup.sql            # Auth tables
├── add-del-bom-flights.sql           # Sample domestic flights
├── add-international-flights.sql      # Sample international flights
├── QUICKSTART.md                      # Detailed setup guide
├── ARCHITECTURE.md                    # System architecture
└── README.md                          # This file
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Beckn Protocol** - Decentralized commerce protocol

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client

## 📊 Database Schema

### Main Tables
- `flights` - Flight inventory (domestic & international)
- `hotels` - Hotel inventory
- `users` - User accounts
- `bookings` - Booking records

See [DATABASE_SETUP_README.md](DATABASE_SETUP_README.md) for complete schema.

## 🔑 Key Features

### Beckn Protocol Implementation
- **Discovery (search)** - Multi-BPP flight and hotel search
- **Order (select)** - Item selection
- **Fulfillment (init/confirm)** - Booking confirmation
- **Post-fulfillment (status)** - Booking status tracking

### Search Filtering
- Origin/Destination filtering for flights
- GPS to airport code conversion
- Date-based availability
- Price sorting and filtering

### Authentication
- JWT-based authentication
- Secure password hashing (bcrypt)
- Protected booking routes
- User profile management

## 🌐 API Endpoints

### BAP Service (Port 8081)
- `POST /beckn/search` - Search for travel options
- `POST /beckn/select` - Select an item
- `POST /beckn/init` - Initialize booking
- `POST /beckn/confirm` - Confirm booking
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### BPP Services
- `POST /search` - Provider-specific search
- `GET /health` - Health check

## 🧪 Testing

### Test Flight Search
```bash
curl -X POST http://localhost:8081/beckn/search \
  -H "Content-Type: application/json" \
  -d '{
    "context": {"action": "search"},
    "message": {
      "intent": {
        "category": {"id": "MOBILITY"}
      }
    }
  }'
```

## 📈 Available Routes

### Domestic Flights
- Bangalore (BLR) → Mumbai (BOM)
- Delhi (DEL) → Bangalore (BLR)
- Hyderabad (HYD) → Mumbai (BOM)
- Delhi (DEL) → Mumbai (BOM) *(optional)*

### International Flights
- Singapore (SIN) ↔ Delhi (DEL) *(optional)*

### Hotels
- Mumbai, Delhi, Bangalore, Chennai, Goa

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check [QUICKSTART.md](QUICKSTART.md) for setup help
2. Review service logs for errors
3. Verify database connection
4. Ensure all ports are available

## 🎓 Learn More

- [Beckn Protocol](https://beckn.org/)
- [Beckn Documentation](https://developers.beckn.org/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)

---

Built with ❤️ using Beckn Protocol
