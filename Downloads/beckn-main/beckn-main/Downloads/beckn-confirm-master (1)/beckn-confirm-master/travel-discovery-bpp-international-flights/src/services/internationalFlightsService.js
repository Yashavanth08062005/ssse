const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

class InternationalFlightsService {
  /**
   * Convert GPS coordinates to airport code
   */
  gpsToAirportCode(gps) {
    if (!gps) return null;
    
    const airportMap = {
      // Indian Airports
      '28.5665,77.1031': 'DEL', // Delhi
      '28.7041,77.1025': 'DEL', // Delhi (alternate)
      '19.0896,72.8656': 'BOM', // Mumbai
      '19.0760,72.8777': 'BOM', // Mumbai (alternate)
      '12.9716,77.5946': 'BLR', // Bangalore
      '12.9941,80.1709': 'MAA', // Chennai
      '13.0827,80.2707': 'MAA', // Chennai (alternate)
      '22.6548,88.4467': 'CCU', // Kolkata
      '22.5726,88.3639': 'CCU', // Kolkata (alternate)
      '17.2403,78.4294': 'HYD', // Hyderabad
      '17.3850,78.4867': 'HYD', // Hyderabad (alternate)
      '15.3808,73.8389': 'GOI', // Goa
      '15.2993,74.1240': 'GOI', // Goa (alternate)
      '18.5822,73.9197': 'PNQ', // Pune
      '18.5204,73.8567': 'PNQ', // Pune (alternate)
      '26.9124,75.7873': 'JAI', // Jaipur
      '23.0726,72.6263': 'AMD', // Ahmedabad
      '23.0225,72.5714': 'AMD', // Ahmedabad (alternate)
      
      // International Airports
      '1.3644,103.9915': 'SIN', // Singapore Changi
      '1.3521,103.8198': 'SIN', // Singapore (alternate)
      '25.2532,55.3657': 'DXB', // Dubai
      '51.4700,-0.4543': 'LHR', // London Heathrow
      '40.6413,-73.7781': 'JFK', // New York JFK
      '13.6900,100.7501': 'BKK', // Bangkok
      '22.3080,113.9185': 'HKG', // Hong Kong
      '35.5494,139.7798': 'NRT', // Tokyo Narita
      '-33.9399,151.1753': 'SYD', // Sydney
      '1.6644,103.6080': 'SIN', // Singapore (city center)
    };
    
    return airportMap[gps] || null;
  }

  async searchInternationalFlights(startLocation, endLocation, travelTime) {
    try {
      console.log(`🔎 Intl search from ${startLocation} to ${endLocation} at ${travelTime}`);

      // Convert GPS to airport codes
      const departureAirport = this.gpsToAirportCode(startLocation);
      const arrivalAirport = this.gpsToAirportCode(endLocation);
      
      console.log(`📍 Converted GPS to airports: ${departureAirport} → ${arrivalAirport}`);

      // Build query with optional filtering
      let query = `
        SELECT * FROM flights 
        WHERE flight_type = 'INTERNATIONAL' 
        AND status = 'ACTIVE'
      `;
      
      const queryParams = [];
      
      // Add departure airport filter if available
      if (departureAirport) {
        queryParams.push(departureAirport);
        query += ` AND departure_airport = $${queryParams.length}`;
      }
      
      // Add arrival airport filter if available
      if (arrivalAirport) {
        queryParams.push(arrivalAirport);
        query += ` AND arrival_airport = $${queryParams.length}`;
      }
      
      query += ` ORDER BY price`;
      
      console.log(`📝 Query: ${query}`, queryParams);
      
      const result = await db.query(query, queryParams);
      
      if (result.rows.length === 0) {
        console.log('⚠️  No international flights found in database');
        return this.getEmptyCatalog();
      }

      console.log(`✅ Found ${result.rows.length} international flights in database`);

      // Transform database records to Beckn format
      const intlFlights = result.rows.map(flight => {
        const departureTime = new Date();
        if (flight.departure_time) {
          const [hours, minutes] = flight.departure_time.split(':');
          departureTime.setHours(parseInt(hours), parseInt(minutes), 0);
        }

        return {
          id: `intl-flight-${flight.id}`,
          descriptor: { 
            name: flight.airline_name, 
            code: flight.flight_code, 
            short_desc: flight.short_desc || `${flight.departure_city} to ${flight.arrival_city}`, 
            long_desc: flight.long_desc || `International flight from ${flight.departure_city} to ${flight.arrival_city}` 
          },
          price: { 
            currency: flight.currency || 'INR', 
            value: parseFloat(flight.price).toFixed(2) 
          },
          time: { 
            timestamp: departureTime.toISOString() 
          },
          tags: [ 
            { 
              code: 'AIRCRAFT_TYPE', 
              list: [{ code: 'MODEL', value: flight.aircraft_model || 'N/A' }] 
            },
            { 
              code: 'AMENITIES', 
              list: [
                { code: 'MEALS', value: flight.meals_included ? 'Premium meals' : 'Chargeable' },
                { code: 'BAGGAGE', value: `${flight.baggage_kg}kg` },
                { code: 'WIFI', value: flight.wifi_available ? 'Available' : 'Not Available' }
              ]
            },
            {
              code: 'ROUTE',
              list: [
                { code: 'FROM', value: `${flight.departure_city} (${flight.departure_airport})` },
                { code: 'TO', value: `${flight.arrival_city} (${flight.arrival_airport})` },
                { code: 'DURATION', value: `${flight.duration_minutes} mins` }
              ]
            }
          ]
        };
      });

      const providers = [];
      providers.push({
        id: 'intl-provider-001',
        descriptor: { name: 'International Flights Provider', short_desc: 'Intl carrier aggregator' },
        items: intlFlights
      });

      // Build catalog in same structure as other BPPs
      const catalog = {
        bpp: {
          descriptor: { name: 'International Flights BPP', short_desc: 'International flights provider' },
          providers: providers
        },
        providers: providers
      };

      return catalog;
    } catch (err) {
      console.error('❌ Error in international flights service:', err);
      throw err;
    }
  }

  getEmptyCatalog() {
    return {
      bpp: {
        descriptor: { name: 'International Flights BPP', short_desc: 'International flights provider' },
        providers: []
      },
      providers: []
    };
  }

  /**
   * Create BPP booking in database
   */
  async createBppBooking(bookingData) {
    try {
      console.log('💾 Creating International Flights BPP booking:', {
        bppBookingId: bookingData.bppBookingId,
        platformBookingId: bookingData.platformBookingId
      });

      const query = `
        INSERT INTO bpp_bookings (
          bpp_booking_id, platform_booking_id, flight_id, passenger_name,
          passenger_email, passenger_phone, passport_number, nationality,
          booking_status, beckn_transaction_id, beckn_message_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        bookingData.bppBookingId,
        bookingData.platformBookingId,
        bookingData.flightId,
        bookingData.passengerName,
        bookingData.passengerEmail,
        bookingData.passengerPhone,
        bookingData.passportNumber,
        bookingData.nationality,
        bookingData.bookingStatus,
        bookingData.becknTransactionId,
        bookingData.becknMessageId
      ];

      const result = await db.query(query, values);
      
      console.log('✅ International Flights BPP booking created:', {
        id: result.rows[0].id,
        bppBookingId: result.rows[0].bpp_booking_id
      });

      return result.rows[0];

    } catch (error) {
      console.error('❌ Error creating International Flights BPP booking:', error);
      throw new Error(`Failed to create BPP booking: ${error.message}`);
    }
  }

  /**
   * Get BPP booking by ID
   */
  async getBppBooking(bppBookingId) {
    try {
      const query = `
        SELECT bb.*, f.flight_code, f.airline_name, f.departure_city, f.arrival_city
        FROM bpp_bookings bb
        LEFT JOIN flights f ON bb.flight_id = f.id
        WHERE bb.bpp_booking_id = $1
      `;

      const result = await db.query(query, [bppBookingId]);
      
      if (result.rows.length === 0) {
        throw new Error(`International Flights BPP booking not found: ${bppBookingId}`);
      }

      return result.rows[0];

    } catch (error) {
      console.error('❌ Error getting International Flights BPP booking:', error);
      throw error;
    }
  }
  
  /**
   * Update booking for cancellation
   */
  async updateBookingForCancellation(updateData) {
    try {
      console.log('💾 Updating International Flights booking for cancellation:', {
        bppBookingId: updateData.bppBookingId,
        cancellationReason: updateData.cancellationReason,
        cancellationCharges: updateData.cancellationCharges,
        refundAmount: updateData.refundAmount
      });

      const query = `
        UPDATE bpp_bookings 
        SET 
          booking_status = 'CANCELLED',
          cancellation_status = 'CANCELLED',
          cancellation_reason = $2,
          cancellation_time = $3,
          cancellation_charges = $4,
          refund_amount = $5,
          refund_status = 'PROCESSING',
          refund_id = $6,
          refund_initiated_at = $7,
          updated_at = $8
        WHERE bpp_booking_id = $1
        RETURNING *
      `;

      const refundId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const values = [
        updateData.bppBookingId,
        updateData.cancellationReason,
        new Date().toISOString(),
        updateData.cancellationCharges,
        updateData.refundAmount,
        refundId,
        new Date().toISOString(),
        new Date().toISOString()
      ];

      const result = await db.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error(`International Flights BPP booking not found for cancellation: ${updateData.bppBookingId}`);
      }

      console.log('✅ International Flights BPP booking updated for cancellation:', {
        bppBookingId: result.rows[0].bpp_booking_id,
        refundId: result.rows[0].refund_id
      });

      return result.rows[0];

    } catch (error) {
      console.error('❌ Error updating International Flights BPP booking for cancellation:', error);
      throw new Error(`Failed to update BPP booking for cancellation: ${error.message}`);
    }
  }
  
  /**
   * Get booking status
   */
  async getBookingStatus(bppBookingId) {
    try {
      const booking = await this.getBppBooking(bppBookingId);
      
      return {
        id: booking.bpp_booking_id,
        platformBookingId: booking.platform_booking_id,
        status: booking.booking_status,
        cancellationStatus: booking.cancellation_status,
        refundStatus: booking.refund_status,
        refundAmount: parseFloat(booking.refund_amount || 0),
        cancellationReason: booking.cancellation_reason,
        bookingDetails: {
          passengerName: booking.passenger_name,
          passengerEmail: booking.passenger_email,
          flightInfo: {
            flightCode: booking.flight_code,
            airlineName: booking.airline_name,
            departureCity: booking.departure_city,
            arrivalCity: booking.arrival_city
          }
        }
      };
    } catch (error) {
      console.error('❌ Error getting booking status:', error);
      throw error;
    }
  }
}

module.exports = new InternationalFlightsService();
