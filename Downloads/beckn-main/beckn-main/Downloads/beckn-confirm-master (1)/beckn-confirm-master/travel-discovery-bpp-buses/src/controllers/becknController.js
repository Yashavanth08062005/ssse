const busesService = require('../services/busesService');
const { v4: uuidv4 } = require('uuid');

/**
 * Buses BPP Controller - Handles Beckn protocol requests for bus services
 */
class BecknController {

    async search(req, res) {
        try {
            const { context, message } = req.body;

            console.log('🔍 Buses BPP received search request:', {
                transaction_id: context?.transaction_id,
                bap_id: context?.bap_id
            });

            const intent = message?.intent;
            const startLocation = intent?.fulfillment?.start?.location?.gps;
            const endLocation = intent?.fulfillment?.end?.location?.gps;
            const travelTime = intent?.fulfillment?.time?.range?.start;

            const catalog = await busesService.searchBuses(startLocation, endLocation, travelTime);

            const response = {
                context: {
                    ...context,
                    action: "on_search",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:3004",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    catalog: catalog
                }
            };

            console.log(`🚌 Buses BPP returning ${catalog.providers[0].items.length} bus options`);
            return res.status(200).json(response);

        } catch (error) {
            console.error('Error in buses search:', error);
            return res.status(500).json({
                context: { ...req.body.context, action: "on_search" },
                error: { type: "CORE-ERROR", code: "20000", message: "Internal server error" }
            });
        }
    }

    async select(req, res) {
        try {
            const { context, message } = req.body;
            console.log('✅ Buses BPP received select request');

            const order = message.order;
            // Mock price calculation for simplicity
            const response = {
                context: {
                    ...context,
                    action: "on_select",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:3004",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        ...order,
                        state: "SELECTED",
                        quote: {
                            price: { currency: "INR", value: "1800.00" },
                            breakup: [
                                { title: "Base Fare", price: { currency: "INR", value: "1500.00" } },
                                { title: "Taxes & Fees", price: { currency: "INR", value: "300.00" } }
                            ]
                        }
                    }
                }
            };
            return res.status(200).json(response);
        } catch (error) {
            console.error('Error in buses select:', error);
            return res.status(500).json({ error: { message: "Internal server error" } });
        }
    }

    async init(req, res) {
        try {
            const { context, message } = req.body;
            console.log('🚀 Buses BPP received init request');

            const response = {
                context: {
                    ...context,
                    action: "on_init",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:3004",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        ...message.order,
                        state: "INITIALIZED",
                        id: uuidv4(),
                        payment: { type: "PRE-FULFILLMENT", collected_by: "BPP" }
                    }
                }
            };
            return res.status(200).json(response);
        } catch (error) {
            console.error('Error in buses init:', error);
            return res.status(500).json({ error: { message: "Internal server error" } });
        }
    }

    async confirm(req, res) {
        try {
            const { context, message } = req.body;
            console.log('💳 Buses BPP received confirm request');

            const order = message.order;
            const items = order?.items || [];
            const billing = order?.billing;

            if (items.length === 0) throw new Error('No items found in order');

            const bppBookingId = `BUS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            const itemId = items[0].id;
            let busId = null;

            if (itemId && itemId.startsWith('bus-')) {
                busId = parseInt(itemId.replace('bus-', ''));
            } else if (itemId && !isNaN(parseInt(itemId))) {
                busId = parseInt(itemId);
            }

            if (!busId) throw new Error(`Invalid bus ID format: ${itemId}`);

            await busesService.createBppBooking({
                bppBookingId,
                platformBookingId: order.id,
                busId: busId,
                passengerName: billing?.name || 'Unknown Passenger',
                passengerEmail: billing?.email || '',
                passengerPhone: billing?.phone || '',
                bookingStatus: 'CONFIRMED',
                becknTransactionId: context.transaction_id,
                becknMessageId: context.message_id
            });

            const response = {
                context: {
                    ...context,
                    action: "on_confirm",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:3004",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        ...message.order,
                        state: "CONFIRMED",
                        id: message.order.id || uuidv4(),
                        bpp_booking_id: bppBookingId,
                        fulfillment: {
                            state: { descriptor: { code: "CONFIRMED" } },
                            tracking: true,
                            id: bppBookingId
                        }
                    }
                }
            };
            return res.status(200).json(response);
        } catch (error) {
            console.error('Error in buses confirm:', error);
            return res.status(500).json({ error: { message: error.message || "Internal server error" } });
        }
    }

    async status(req, res) {
        try {
            const { context, message } = req.body;
            console.log('📊 Buses BPP received status request');

            const response = {
                context: {
                    ...context,
                    action: "on_status",
                    bpp_id: "buses-bpp.example.com",
                    bpp_uri: "http://localhost:3004",
                    message_id: uuidv4(),
                    timestamp: new Date().toISOString()
                },
                message: {
                    order: {
                        id: message.order_id,
                        state: "CONFIRMED"
                    }
                }
            };
            return res.status(200).json(response);
        } catch (error) {
            return res.status(500).json({ error: { message: "Internal server error" } });
        }
    }

    async track(req, res) { res.status(501).json({ message: "Not implemented" }); }
    async cancel(req, res) { res.status(501).json({ message: "Not implemented" }); }
    async update(req, res) { res.status(501).json({ message: "Not implemented" }); }
}

module.exports = new BecknController();
