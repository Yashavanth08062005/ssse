const flightsService = require('../services/flightsService');
const { v4: uuidv4 } = require('uuid');

/**
 * Flights BPP Controller - Handles Beckn protocol requests for flight services
 */
class BecknController {

    /**
     * Handle search requests - return available flights
     */
    async search(req, res) {
        try {
            const { context, message } = req.body;
            
            console.log('🔍 Flights BPP received search request:', {
                transaction_id: context?.transaction_id,
                bap_id: context?.bap_id
            });

            // Extract search parameters from Beckn message
            const intent = message?.intent;
            const startLocation = intent?.fulfillment?.start?.location?.gps || "12.9716,77.5946";
            const endLocation = intent?.fulfillment?.end?.location?.gps || "19.0760,72.8777";
            const travelTime = intent?.fulfillment?.time?.range?.start || new Date().toISOString();

            // Get flight catalog
            const catalog = await flightsService.searchFlights(startLocation, endLocation, travelTime);

            // Create Beckn-compliant response
            const response = {
                context: {
                    ...context,
                    action: "on_search",
                    bpp_id: "flights-bpp.example.com",
                    bpp_uri: "http://localhost:7001",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    catalog: catalog
                }
            };

            console.log(`✈️  Flights BPP returning ${catalog.providers[0].items.length} flight options`);
            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in flights search:', error);
            return res.status(500).json({
                context: {
                    ...req.body.context,
                    action: "on_search"
                },
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Handle select requests
     */
    async select(req, res) {
        try {
            const { context, message } = req.body;
            
            console.log('✅ Flights BPP received select request');

            const response = {
                context: {
                    ...context,
                    action: "on_select",
                    bpp_id: "flights-bpp.example.com",
                    bpp_uri: "http://localhost:7001", 
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        ...message.order,
                        state: "SELECTED",
                        quote: {
                            price: {
                                currency: "INR",
                                value: "5500.00"
                            },
                            breakup: [
                                {
                                    title: "Base Fare",
                                    price: {
                                        currency: "INR", 
                                        value: "4200.00"
                                    }
                                },
                                {
                                    title: "Taxes & Fees",
                                    price: {
                                        currency: "INR",
                                        value: "1300.00"
                                    }
                                }
                            ]
                        }
                    }
                }
            };

            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in flights select:', error);
            return res.status(500).json({
                context: {
                    ...req.body.context,
                    action: "on_select"
                },
                error: {
                    type: "CORE-ERROR",
                    code: "20000", 
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Handle init requests
     */
    async init(req, res) {
        try {
            const { context, message } = req.body;
            
            console.log('🚀 Flights BPP received init request');

            const response = {
                context: {
                    ...context,
                    action: "on_init",
                    bpp_id: "flights-bpp.example.com",
                    bpp_uri: "http://localhost:7001",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        ...message.order,
                        state: "INITIALIZED",
                        id: uuidv4(),
                        payment: {
                            type: "PRE-FULFILLMENT",
                            collected_by: "BPP"
                        }
                    }
                }
            };

            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in flights init:', error);
            return res.status(500).json({
                context: {
                    ...req.body.context,
                    action: "on_init"
                },
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Handle confirm requests - Save booking to BPP database
     */
    async confirm(req, res) {
        try {
            const { context, message } = req.body;
            
            console.log('💳 Flights BPP received confirm request', {
                transaction_id: context?.transaction_id,
                order_id: message?.order?.id
            });

            // Extract booking details from the order
            const order = message.order;
            const items = order?.items || [];
            const billing = order?.billing;
            
            if (items.length === 0) {
                throw new Error('No items found in order');
            }

            // Generate BPP booking ID
            const bppBookingId = `FLT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            
            // Extract numeric flight ID from item ID (e.g., "flight-1" -> 1)
            const itemId = items[0].id;
            let flightId = null;
            
            if (itemId && itemId.startsWith('flight-')) {
                flightId = parseInt(itemId.replace('flight-', ''));
            } else if (itemId && !isNaN(parseInt(itemId))) {
                flightId = parseInt(itemId);
            }
            
            if (!flightId) {
                throw new Error(`Invalid flight ID format: ${itemId}`);
            }

            // Save booking to BPP database
            const bookingResult = await flightsService.createBppBooking({
                bppBookingId,
                platformBookingId: order.id,
                flightId: flightId,
                passengerName: billing?.name || 'Unknown Passenger',
                passengerEmail: billing?.email || '',
                passengerPhone: billing?.phone || '',
                bookingStatus: 'CONFIRMED',
                becknTransactionId: context.transaction_id,
                becknMessageId: context.message_id,
                orderDetails: order
            });

            console.log('✅ Flights BPP booking saved:', {
                bppBookingId,
                platformBookingId: order.id,
                dbBookingId: bookingResult.id
            });

            const response = {
                context: {
                    ...context,
                    action: "on_confirm",
                    bpp_id: "flights-bpp.example.com",
                    bpp_uri: "http://localhost:7001",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        ...message.order,
                        state: "CONFIRMED",
                        id: message.order.id || uuidv4(),
                        bpp_booking_id: bppBookingId, // Include BPP booking ID
                        fulfillment: {
                            state: {
                                descriptor: {
                                    code: "CONFIRMED"
                                }
                            },
                            tracking: true,
                            id: bppBookingId
                        },
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                }
            };

            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in flights confirm:', error);
            return res.status(500).json({
                context: {
                    ...req.body.context,
                    action: "on_confirm"
                },
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: error.message || "Internal server error"
                }
            });
        }
    }

    /**
     * Handle status requests
     */
    async status(req, res) {
        try {
            const { context, message } = req.body;
            
            console.log('📊 Flights BPP received status request');

            const response = {
                context: {
                    ...context,
                    action: "on_status",
                    bpp_id: "flights-bpp.example.com",
                    bpp_uri: "http://localhost:7001",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        id: message.order_id,
                        state: "CONFIRMED",
                        fulfillment: {
                            state: {
                                descriptor: {
                                    code: "CONFIRMED"
                                }
                            }
                        }
                    }
                }
            };

            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in flights status:', error);
            return res.status(500).json({
                context: {
                    ...req.body.context,
                    action: "on_status"
                },
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    // Additional endpoints for full BPP functionality
    async track(req, res) {
        try {
            return res.status(200).json({
                message: "Track functionality not implemented yet"
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }

    async cancel(req, res) {
        try {
            const { context, message } = req.body;
            
            console.log("🔄 Flights BPP received cancel request", {
                transaction_id: context?.transaction_id,
                order_id: message?.order_id
            });
            
            // Get booking from BPP database
            const booking = await flightsService.getBppBooking(message.order_id);
            
            // Calculate refund amount based on cancellation policy
            const originalAmount = booking.orderDetails?.payment?.params?.amount || 5000;
            const cancellationPolicy = this.getCancellationPolicy(booking);
            const cancellationCharges = this.calculateCancellationCharges(originalAmount, cancellationPolicy);
            const refundAmount = originalAmount - cancellationCharges;
            
            // Update booking status in database
            const updatedBooking = await flightsService.updateBookingForCancellation({
                bppBookingId: message.order_id,
                cancellationReason: message.cancellation_reason_id,
                cancellationCharges: cancellationCharges,
                refundAmount: refundAmount
            });
            
            // Create Beckn-compliant cancel response
            const response = {
                context: {
                    ...context,
                    action: "on_cancel",
                    bpp_id: "flights-bpp.example.com",
                    bpp_uri: "http://localhost:7001",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        id: message.order_id,
                        state: "CANCELLED",
                        cancellation: {
                            status: "Cancelled",
                            reason: {
                                id: message.cancellation_reason_id || "CUSTOMER_REQUEST",
                                descriptor: {
                                    name: this.getCancellationReasonName(message.cancellation_reason_id)
                                }
                            },
                            time: {
                                timestamp: new Date().toISOString()
                            }
                        },
                        payment: {
                            type: "POST-FULFILLMENT",
                            status: "PAID",
                            collected_by: "BAP",
                            params: {
                                amount: refundAmount.toString(),
                                currency: "INR",
                                refund_id: `REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                                original_amount: originalAmount.toString(),
                                cancellation_charges: cancellationCharges.toString()
                            },
                            time: {
                                timestamp: new Date().toISOString()
                            }
                        },
                        quote: {
                            price: {
                                currency: "INR",
                                value: refundAmount.toString()
                            }
                        },
                        fulfillment: {
                            id: message.order_id,
                            state: {
                                descriptor: {
                                    code: "CANCELLED"
                                }
                            }
                        },
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                }
            };
            
            console.log("✅ Flights BPP cancel response prepared", {
                bppBookingId: message.order_id,
                refundAmount,
                cancellationCharges
            });
            
            return res.status(200).json(response);
            
        } catch (error) {
            console.error("❌ Error in flights cancel:", error);
            return res.status(500).json({
                context: {
                    ...req.body.context,
                    action: "on_cancel"
                },
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: error.message || "Internal server error"
                }
            });
        }
    }

    async update(req, res) {
        try {
            return res.status(200).json({
                message: "Update functionality not implemented yet" 
            });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    }
    
    /**
     * Get cancellation reason name
     */
    getCancellationReasonName(reasonId) {
        const reasons = {
            'CUSTOMER_REQUEST': 'Customer requested cancellation',
            'CHANGE_OF_PLANS': 'Change of travel plans',
            'EMERGENCY': 'Emergency situation',
            'DUPLICATE_BOOKING': 'Duplicate booking',
            'PRICE_CHANGE': 'Price change',
            'SERVICE_UNAVAILABLE': 'Service no longer available'
        };
        return reasons[reasonId] || 'Customer requested cancellation';
    }
    
    /**
     * Calculate cancellation charges based on policy
     */
    calculateCancellationCharges(originalAmount, policy) {
        if (!policy || policy.hoursBefore < 0) {
            // No cancellation allowed
            return originalAmount;
        }
        
        const hoursBefore = policy.hoursBefore;
        const percentage = policy.percentage;
        
        // For demo purposes, using a simple policy
        // In real implementation, this would check the flight departure time
        return (originalAmount * percentage) / 100;
    }
    
    /**
     * Get cancellation policy for a booking
     */
    getCancellationPolicy(booking) {
        // Default policy: 10% cancellation charge if cancelled more than 24 hours before flight
        // 50% cancellation charge if cancelled within 24 hours
        // 100% cancellation charge if cancelled within 6 hours
        
        // For demo, return a default policy
        return {
            hoursBefore: 24,
            percentage: 10
        };
    }
}

module.exports = new BecknController();