const internationalService = require('../services/internationalFlightsService');
const { v4: uuidv4 } = require('uuid');

class BecknController {
  async search(req, res) {
    try {
      const { context, message } = req.body;
      console.log('🔍 Intl Flights BPP received search request', { transaction_id: context?.transaction_id });

      const intent = message?.intent;
      const startLocation = intent?.fulfillment?.start?.location?.gps || '12.9716,77.5946';
      const endLocation = intent?.fulfillment?.end?.location?.gps || '19.0760,72.8777';
      const travelTime = intent?.fulfillment?.time?.range?.start || new Date().toISOString();

      const catalog = await internationalService.searchInternationalFlights(startLocation, endLocation, travelTime);

      const response = {
        context: {
          ...context,
          action: 'on_search',
          bpp_id: 'intl-flights-bpp.example.com',
          bpp_uri: 'http://localhost:7005',
          message_id: uuidv4(),
          timestamp: new Date().toISOString()
        },
        message: {
          catalog: catalog
        }
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in intl flights search:', error);
      return res.status(500).json({
        context: { ...req.body.context, action: 'on_search' },
        error: { type: 'CORE-ERROR', code: '20000', message: 'Internal server error' }
      });
    }
  }

  async select(req, res) {
    try {
      const { context, message } = req.body;
      const response = {
        context: { ...context, action: 'on_select', bpp_id: 'intl-flights-bpp.example.com', bpp_uri: 'http://localhost:7005', message_id: uuidv4(), timestamp: new Date().toISOString() },
        message: { order: { ...message.order, state: 'SELECTED' } }
      };
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ context: { ...req.body.context, action: 'on_select' }, error: { type: 'CORE-ERROR', code: '20000', message: 'Internal server error' } });
    }
  }

  async init(req, res) {
    try {
      const { context, message } = req.body;
      const response = {
        context: { ...context, action: 'on_init', bpp_id: 'intl-flights-bpp.example.com', bpp_uri: 'http://localhost:7005', message_id: uuidv4(), timestamp: new Date().toISOString() },
        message: { order: { ...message.order, state: 'INITIALIZED', id: uuidv4() } }
      };
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ context: { ...req.body.context, action: 'on_init' }, error: { type: 'CORE-ERROR', code: '20000', message: 'Internal server error' } });
    }
  }

  async confirm(req, res) {
    try {
      const { context, message } = req.body;
      
      console.log('💳 International Flights BPP received confirm request', {
        transaction_id: context?.transaction_id,
        order_id: message?.order?.id
      });

      // Extract booking details
      const order = message.order;
      const items = order?.items || [];
      const billing = order?.billing;
      
      if (items.length === 0) {
        throw new Error('No items found in order');
      }

      // Generate BPP booking ID
      const bppBookingId = `INTL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
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
      const bookingResult = await internationalService.createBppBooking({
        bppBookingId,
        platformBookingId: order.id,
        flightId: flightId,
        passengerName: billing?.name || 'Unknown Passenger',
        passengerEmail: billing?.email || '',
        passengerPhone: billing?.phone || '',
        passportNumber: billing?.passport_number || '',
        nationality: billing?.nationality || '',
        bookingStatus: 'CONFIRMED',
        becknTransactionId: context.transaction_id,
        becknMessageId: context.message_id
      });

      console.log('✅ International Flights BPP booking saved:', {
        bppBookingId,
        platformBookingId: order.id,
        dbBookingId: bookingResult.id
      });

      const response = {
        context: { 
          ...context, 
          action: 'on_confirm', 
          bpp_id: 'intl-flights-bpp.example.com', 
          bpp_uri: 'http://localhost:7005', 
          message_id: uuidv4(), 
          timestamp: new Date().toISOString() 
        },
        message: { 
          order: { 
            ...message.order, 
            state: 'CONFIRMED', 
            id: message.order.id || uuidv4(),
            bpp_booking_id: bppBookingId,
            fulfillment: {
              state: { descriptor: { code: "CONFIRMED" } },
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
      console.error('Error in international flights confirm:', error);
      return res.status(500).json({ 
        context: { ...req.body.context, action: 'on_confirm' }, 
        error: { type: 'CORE-ERROR', code: '20000', message: error.message || 'Internal server error' } 
      });
    }
  }

  async status(req, res) {
    try {
      const { context, message } = req.body;
      const response = {
        context: { ...context, action: 'on_status', bpp_id: 'intl-flights-bpp.example.com', bpp_uri: 'http://localhost:7005', message_id: uuidv4(), timestamp: new Date().toISOString() },
        message: { order: { id: message.order_id, state: 'CONFIRMED' } }
      };
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({ context: { ...req.body.context, action: 'on_status' }, error: { type: 'CORE-ERROR', code: '20000', message: 'Internal server error' } });
    }
  }
  
  async cancel(req, res) {
    try {
      const { context, message } = req.body;
      
      console.log("🔄 Intl Flights BPP received cancel request", {
        transaction_id: context?.transaction_id,
        order_id: message?.order_id
      });
      
      // Calculate refund amount based on cancellation policy
      const originalAmount = 15000; // Default for demo
      const cancellationCharges = originalAmount * 0.20; // 20% cancellation charge for international
      const refundAmount = originalAmount - cancellationCharges;
      
      // Create Beckn-compliant cancel response
      const response = {
        context: {
          ...context,
          action: "on_cancel",
          bpp_id: "intl-flights-bpp.example.com",
          bpp_uri: "http://localhost:7005",
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
      
      console.log("✅ Intl Flights BPP cancel response prepared", {
        bppBookingId: message.order_id,
        refundAmount,
        cancellationCharges
      });
      
      return res.status(200).json(response);
      
    } catch (error) {
      console.error("❌ Error in intl flights cancel:", error);
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
}

module.exports = new BecknController();
