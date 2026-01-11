const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

/**
 * Flights Service - Provides flight catalog and booking services
 */
class FlightsService {

    /**
     * Convert GPS coordinates to airport code
     */
    gpsToAirportCode(gps) {
        if (!gps) return null;
        
        const airportMap = {
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
        };
        
        return airportMap[gps] || null;
    }

    /**
     * Search for available flights from database
     */
    async searchFlights(startLocation, endLocation, travelTime) {
        try {
            console.log(`🔍 Searching flights from ${startLocation} to ${endLocation} on ${travelTime}`);

            // Convert GPS to airport codes
            const departureAirport = this.gpsToAirportCode(startLocation);
            const arrivalAirport = this.gpsToAirportCode(endLocation);
            
            console.log(`📍 Converted GPS to airports: ${departureAirport} → ${arrivalAirport}`);

            // Build query with optional filtering
            let query = `
                SELECT * FROM flights 
                WHERE flight_type = 'DOMESTIC' 
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
                console.log('⚠️  No flights found in database');
                return this.getEmptyCatalog();
            }

            console.log(`✅ Found ${result.rows.length} flights in database`);

            // Transform database records to Beckn format
            const flights = result.rows.map(flight => {
                const departureTime = new Date();
                if (flight.departure_time) {
                    const [hours, minutes] = flight.departure_time.split(':');
                    departureTime.setHours(parseInt(hours), parseInt(minutes), 0);
                }

                return {
                    id: `flight-${flight.id}`,
                    descriptor: {
                        name: flight.airline_name,
                        code: flight.flight_code,
                        short_desc: flight.short_desc || 'Flight service',
                        long_desc: flight.long_desc || `${flight.airline_name} flight service`
                    },
                    price: {
                        currency: flight.currency || "INR",
                        value: parseFloat(flight.price).toFixed(2)
                    },
                    category_id: "FLIGHT",
                    fulfillment_id: `fulfillment-${flight.id}`,
                    location_id: `airport-${flight.departure_airport.toLowerCase()}`,
                    time: {
                        label: "departure",
                        timestamp: departureTime.toISOString()
                    },
                    matched: true,
                    tags: [
                        {
                            code: "AIRCRAFT_TYPE",
                            list: [
                                { code: "MODEL", value: flight.aircraft_model || "N/A" }
                            ]
                        },
                        {
                            code: "AMENITIES",
                            list: [
                                { code: "MEALS", value: flight.meals_included ? "Included" : "Chargeable" },
                                { code: "BAGGAGE", value: `${flight.baggage_kg}kg` },
                                { code: "WIFI", value: flight.wifi_available ? "Available" : "Not Available" }
                            ]
                        },
                        {
                            code: "ROUTE",
                            list: [
                                { code: "FROM", value: `${flight.departure_city} (${flight.departure_airport})` },
                                { code: "TO", value: `${flight.arrival_city} (${flight.arrival_airport})` },
                                { code: "DURATION", value: `${flight.duration_minutes} mins` }
                            ]
                        }
                    ]
                };
            });

            // Create Beckn catalog structure
            const catalog = {
                bpp: {
                    descriptor: {
                        name: "Flights BPP Provider",
                        short_desc: "Flight booking provider",
                        long_desc: "Comprehensive flight booking services across India"
                    },
                    providers: [
                        {
                            id: "flights-provider-001",
                            descriptor: {
                                name: "Indian Airlines Hub",
                                short_desc: "Multiple airline aggregator",
                                long_desc: "Access to major Indian airlines including Air India, IndiGo, Vistara, and more"
                            },
                            categories: [
                                {
                                    id: "FLIGHT",
                                    descriptor: {
                                        name: "Flight Services"
                                    }
                                }
                            ],
                            fulfillments: [
                                {
                                    id: "fulfillment-001",
                                    type: "DELIVERY",
                                    start: {
                                        location: {
                                            gps: startLocation,
                                            address: {
                                                locality: "Kempegowda International Airport",
                                                city: "Bangalore", 
                                                state: "Karnataka",
                                                country: "India"
                                            }
                                        },
                                        time: {
                                            range: {
                                                start: new Date(Date.now() + 3600000).toISOString(),
                                                end: new Date(Date.now() + 5400000).toISOString()
                                            }
                                        }
                                    },
                                    end: {
                                        location: {
                                            gps: endLocation,
                                            address: {
                                                locality: "Chhatrapati Shivaji International Airport",
                                                city: "Mumbai",
                                                state: "Maharashtra", 
                                                country: "India"
                                            }
                                        },
                                        time: {
                                            range: {
                                                start: new Date(Date.now() + 7200000).toISOString(),
                                                end: new Date(Date.now() + 9000000).toISOString()
                                            }
                                        }
                                    }
                                }
                            ],
                            items: flights,
                            locations: [
                                {
                                    id: "airport-blr",
                                    gps: startLocation,
                                    address: {
                                        locality: "Kempegowda International Airport",
                                        city: "Bangalore",
                                        state: "Karnataka",
                                        country: "India"
                                    }
                                }
                            ]
                        }
                    ]
                },
                providers: [
                    {
                        id: "flights-provider-001",
                        descriptor: {
                            name: "Indian Airlines Hub"
                        },
                        items: flights
                    }
                ]
            };

            return catalog;

        } catch (error) {
            console.error('❌ Error in flights service:', error);
            throw error;
        }
    }

    /**
     * Get empty catalog when no flights found
     */
    getEmptyCatalog() {
        return {
            bpp: {
                descriptor: {
                    name: "Flights BPP Provider",
                    short_desc: "Flight booking provider",
                    long_desc: "Comprehensive flight booking services across India"
                },
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
            console.log('💾 Creating BPP booking:', {
                bppBookingId: bookingData.bppBookingId,
                platformBookingId: bookingData.platformBookingId
            });

            const query = `
                INSERT INTO bpp_bookings (
                    bpp_booking_id, platform_booking_id, flight_id, passenger_name,
                    passenger_email, passenger_phone, booking_status, beckn_transaction_id,
                    beckn_message_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;

            const values = [
                bookingData.bppBookingId,
                bookingData.platformBookingId,
                bookingData.flightId,
                bookingData.passengerName,
                bookingData.passengerEmail,
                bookingData.passengerPhone,
                bookingData.bookingStatus,
                bookingData.becknTransactionId,
                bookingData.becknMessageId
            ];

            const result = await db.query(query, values);
            
            console.log('✅ BPP booking created successfully:', {
                id: result.rows[0].id,
                bppBookingId: result.rows[0].bpp_booking_id
            });

            return result.rows[0];

        } catch (error) {
            console.error('❌ Error creating BPP booking:', error);
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
                throw new Error(`BPP booking not found: ${bppBookingId}`);
            }

            return result.rows[0];

        } catch (error) {
            console.error('❌ Error getting BPP booking:', error);
            throw error;
        }
    }
    
    /**
     * Update booking for cancellation
     */
    async updateBookingForCancellation(updateData) {
        try {
            console.log('💾 Updating booking for cancellation:', {
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
                throw new Error(`BPP booking not found for cancellation: ${updateData.bppBookingId}`);
            }

            console.log('✅ BPP booking updated for cancellation:', {
                bppBookingId: result.rows[0].bpp_booking_id,
                refundId: result.rows[0].refund_id
            });

            return result.rows[0];

        } catch (error) {
            console.error('❌ Error updating BPP booking for cancellation:', error);
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

module.exports = new FlightsService();