const becknService = require('../services/becknService');
const logger = require('../utils/logger');

/**
 * Beckn Controller - Handles all Beckn protocol endpoints for BAP
 */
class BecknController {
    
    /**
     * Handle discovery/search requests
     */
    async search(req, res) {
        try {
            const { context, message } = req.body;
            
            // Validate Beckn request structure
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR",
                        code: "20001",
                        message: "Invalid request format. Missing context or message."
                    }
                });
            }

            logger.info('Received Beckn search request', {
                transaction_id: context.transaction_id,
                message_id: context.message_id,
                intent: message.intent
            });

            // Process search through Beckn service
            const result = await becknService.processSearch(context, message);

            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in search controller:', error);
            return res.status(500).json({
                error: {
                    type: "CORE-ERROR", 
                    code: "20000",
                    message: error.message || "Internal server error"
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
            
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR",
                        code: "20001", 
                        message: "Invalid request format"
                    }
                });
            }

            logger.info('Received Beckn select request', {
                transaction_id: context.transaction_id,
                order: message.order
            });

            const result = await becknService.processSelect(context, message);
            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in select controller:', error);
            return res.status(500).json({
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
            
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR",
                        code: "20001",
                        message: "Invalid request format"
                    }
                });
            }

            logger.info('Received Beckn init request', {
                transaction_id: context.transaction_id,
                order: message.order
            });

            const result = await becknService.processInit(context, message);
            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in init controller:', error);
            return res.status(500).json({
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Handle confirm requests
     */
    async confirm(req, res) {
        try {
            const { context, message } = req.body;
            
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR", 
                        code: "20001",
                        message: "Invalid request format"
                    }
                });
            }

            logger.info('Received Beckn confirm request', {
                transaction_id: context.transaction_id,
                order: message.order
            });

            const result = await becknService.processConfirm(context, message);
            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in confirm controller:', error);
            return res.status(500).json({
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
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
            
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR",
                        code: "20001",
                        message: "Invalid request format"
                    }
                });
            }

            logger.info('Received Beckn status request', {
                transaction_id: context.transaction_id,
                order_id: message.order_id
            });

            const result = await becknService.processStatus(context, message);
            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in status controller:', error);
            return res.status(500).json({
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Handle cancel requests
     */
    async cancel(req, res) {
        try {
            const { context, message } = req.body;
            
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR",
                        code: "20001",
                        message: "Invalid request format"
                    }
                });
            }

            logger.info('Received Beckn cancel request', {
                transaction_id: context.transaction_id,
                order_id: message.order_id,
                cancellation_reason: message.cancellation_reason_id
            });

            const result = await becknService.processCancel(context, message);
            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in cancel controller:', error);
            return res.status(500).json({
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Handle update requests (for modifications)
     */
    async update(req, res) {
        try {
            const { context, message } = req.body;
            
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR",
                        code: "20001",
                        message: "Invalid request format"
                    }
                });
            }

            logger.info('Received Beckn update request', {
                transaction_id: context.transaction_id,
                order_id: message.order?.id,
                update_target: message.update_target
            });

            const result = await becknService.processUpdate(context, message);
            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in update controller:', error);
            return res.status(500).json({
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Handle support requests
     */
    async support(req, res) {
        try {
            const { context, message } = req.body;
            
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR",
                        code: "20001",
                        message: "Invalid request format"
                    }
                });
            }

            logger.info('Received Beckn support request', {
                transaction_id: context.transaction_id,
                order_id: message.order_id,
                support_type: message.support?.type
            });

            const result = await becknService.processSupport(context, message);
            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in support controller:', error);
            return res.status(500).json({
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }

    /**
     * Handle rating requests
     */
    async rating(req, res) {
        try {
            const { context, message } = req.body;
            
            if (!context || !message) {
                return res.status(400).json({
                    error: {
                        type: "CORE-ERROR",
                        code: "20001",
                        message: "Invalid request format"
                    }
                });
            }

            logger.info('Received Beckn rating request', {
                transaction_id: context.transaction_id,
                order_id: message.order_id,
                rating_value: message.rating_value
            });

            const result = await becknService.processRating(context, message);
            return res.status(200).json(result);
            
        } catch (error) {
            logger.error('Error in rating controller:', error);
            return res.status(500).json({
                error: {
                    type: "CORE-ERROR",
                    code: "20000",
                    message: "Internal server error"
                }
            });
        }
    }
    async health(req, res) {
        try {
            return res.status(200).json({
                status: "OK",
                service: "Beckn Travel Discovery BAP",
                version: "1.0.0",
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            return res.status(500).json({
                status: "ERROR",
                message: error.message
            });
        }
    }
}

module.exports = new BecknController();