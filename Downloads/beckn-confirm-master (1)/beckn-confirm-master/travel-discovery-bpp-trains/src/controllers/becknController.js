const trainsService = require('../services/trainsService');
const { v4: uuidv4 } = require('uuid');

exports.search = async (req, res) => {
    try {
        const message = req.body.message;
        const startLoc = message.intent?.fulfillment?.start?.location?.gps;
        const endLoc = message.intent?.fulfillment?.end?.location?.gps;
        const travelTime = message.intent?.fulfillment?.time?.range?.start;

        const catalog = await trainsService.searchTrains(startLoc, endLoc, travelTime);

        res.json({
            context: req.body.context,
            message: { catalog: catalog.bpp?.providers ? catalog.bpp : { providers: [] } }
            // Note: Structure might need adjustment to match specific Beckn expectations depending on BAP
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: { message: err.message } });
    }
};

exports.select = async (req, res) => {
    // Mock select response
    res.json({
        context: req.body.context,
        message: {
            order: {
                provider: { id: "trains-provider-001" },
                items: req.body.message.order.items,
                quote: {
                    price: { currency: "INR", value: "500.00" }, // Mock
                    breakup: []
                }
            }
        }
    });
};

exports.init = async (req, res) => {
    // Mock init response
    res.json({
        context: req.body.context,
        message: {
            order: {
                ...req.body.message.order,
                payment: {
                    uri: "https://example.com/payment",
                    status: "PAID"
                }
            }
        }
    });
};

exports.confirm = async (req, res) => {
    try {
        const order = req.body.message.order;
        const bookingData = {
            bppBookingId: uuidv4(),
            platformBookingId: order.id,
            itemId: order.items[0].id,
            passengerName: order.fulfillment?.customer?.person?.name || "Unknown",
            passengerEmail: order.fulfillment?.customer?.contact?.email || "unknown@example.com",
            passengerPhone: order.fulfillment?.customer?.contact?.phone || "0000000000",
            bookingStatus: "CONFIRMED",
            becknTransactionId: req.body.context.transaction_id,
            becknMessageId: req.body.context.message_id
        };

        const booking = await trainsService.createBppBooking(bookingData);

        res.json({
            context: req.body.context,
            message: {
                order: {
                    id: booking.bpp_booking_id,
                    state: "CONFIRMED",
                    items: order.items,
                    fulfillment: order.fulfillment
                }
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: { message: err.message } });
    }
};

exports.status = async (req, res) => {
    try {
        const orderId = req.body.message.order_id;
        const booking = await trainsService.getBppBooking(orderId);
        res.json({
            context: req.body.context,
            message: {
                order: {
                    id: booking.bpp_booking_id,
                    state: booking.booking_status
                }
            }
        });
    } catch (err) {
        res.status(404).json({ error: { message: "Booking not found" } });
    }
};

exports.track = (req, res) => res.json({ context: req.body.context, message: { tracking: { status: "active", url: "http://track.train" } } });
exports.cancel = (req, res) => res.json({ context: req.body.context, message: { order: { state: "CANCELLED" } } });
exports.update = (req, res) => res.json({ context: req.body.context, message: { order: { state: "UPDATED" } } });
