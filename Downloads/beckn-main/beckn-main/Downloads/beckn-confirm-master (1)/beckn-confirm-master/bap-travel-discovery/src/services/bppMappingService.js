const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * BPP Booking Mapping Service
 * Manages the mapping between platform booking IDs and BPP booking IDs
 */
class BppMappingService {

    /**
     * Create a new BPP booking mapping
     */
    async createMapping(mappingData) {
        try {
            logger.info('Creating BPP booking mapping', {
                platformBookingId: mappingData.platformBookingId,
                bppBookingId: mappingData.bppBookingId,
                serviceType: mappingData.bppServiceType
            });

            const query = `
                INSERT INTO bpp_booking_mappings (
                    platform_booking_id, platform_booking_reference, bpp_service_type,
                    bpp_booking_id, bpp_service_url, beckn_transaction_id, beckn_message_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;

            const values = [
                mappingData.platformBookingId,
                mappingData.platformBookingReference,
                mappingData.bppServiceType,
                mappingData.bppBookingId,
                mappingData.bppServiceUrl,
                mappingData.becknTransactionId,
                mappingData.becknMessageId
            ];

            const result = await db.query(query, values);

            logger.info('BPP booking mapping created successfully', {
                mappingId: result.rows[0].id,
                platformBookingId: result.rows[0].platform_booking_id,
                bppBookingId: result.rows[0].bpp_booking_id
            });

            return result.rows[0];

        } catch (error) {
            logger.error('Error creating BPP booking mapping:', error);
            throw new Error(`Failed to create BPP booking mapping: ${error.message}`);
        }
    }

    /**
     * Get BPP booking mappings by platform booking ID
     */
    async getMappingsByPlatformId(platformBookingId) {
        try {
            const query = `
                SELECT * FROM bpp_booking_mappings
                WHERE platform_booking_id = $1
                ORDER BY created_at DESC
            `;

            const result = await db.query(query, [platformBookingId]);

            logger.info('Retrieved BPP mappings for platform booking', {
                platformBookingId,
                mappingCount: result.rows.length
            });

            return result.rows;

        } catch (error) {
            logger.error('Error getting BPP mappings by platform ID:', error);
            throw error;
        }
    }

    /**
     * Get BPP booking mapping by BPP booking ID
     */
    async getMappingByBppId(bppBookingId) {
        try {
            const query = `
                SELECT * FROM bpp_booking_mappings
                WHERE bpp_booking_id = $1
            `;

            const result = await db.query(query, [bppBookingId]);

            if (result.rows.length === 0) {
                throw new Error(`BPP booking mapping not found for BPP ID: ${bppBookingId}`);
            }

            return result.rows[0];

        } catch (error) {
            logger.error('Error getting BPP mapping by BPP ID:', error);
            throw error;
        }
    }

    /**
     * Get all mappings for a booking reference
     */
    async getMappingsByReference(bookingReference) {
        try {
            const query = `
                SELECT 
                    bbm.*,
                    b.booking_type,
                    b.item_name,
                    b.passenger_name,
                    b.amount,
                    b.booking_status
                FROM bpp_booking_mappings bbm
                LEFT JOIN bookings b ON bbm.platform_booking_reference = b.booking_reference
                WHERE bbm.platform_booking_reference = $1
                ORDER BY bbm.created_at DESC
            `;

            const result = await db.query(query, [bookingReference]);

            logger.info('Retrieved BPP mappings for booking reference', {
                bookingReference,
                mappingCount: result.rows.length
            });

            return result.rows;

        } catch (error) {
            logger.error('Error getting BPP mappings by reference:', error);
            throw error;
        }
    }

    /**
     * Update mapping status
     */
    async updateMappingStatus(bppBookingId, status) {
        try {
            const query = `
                UPDATE bpp_booking_mappings
                SET mapping_status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE bpp_booking_id = $2
                RETURNING *
            `;

            const result = await db.query(query, [status, bppBookingId]);

            if (result.rows.length === 0) {
                throw new Error(`BPP booking mapping not found: ${bppBookingId}`);
            }

            logger.info('BPP booking mapping status updated', {
                bppBookingId,
                newStatus: status
            });

            return result.rows[0];

        } catch (error) {
            logger.error('Error updating BPP mapping status:', error);
            throw error;
        }
    }

    /**
     * Get mapping statistics
     */
    async getMappingStats() {
        try {
            const query = `
                SELECT 
                    bpp_service_type,
                    mapping_status,
                    COUNT(*) as count
                FROM bpp_booking_mappings
                GROUP BY bpp_service_type, mapping_status
                ORDER BY bpp_service_type, mapping_status
            `;

            const result = await db.query(query);

            return result.rows;

        } catch (error) {
            logger.error('Error getting BPP mapping statistics:', error);
            throw error;
        }
    }

    /**
     * Determine BPP service type from booking data
     */
    determineBppServiceType(bookingType, itemDetails) {
        if (bookingType === 'flight') {
            // Check if it's international flight
            if (itemDetails && (
                itemDetails.flight_type === 'INTERNATIONAL' ||
                itemDetails.category?.toLowerCase().includes('international')
            )) {
                return 'international_flights';
            }
            return 'flights';
        } else if (bookingType === 'hotel') {
            return 'hotels';
        } else if (bookingType === 'bus') {
            return 'buses';
        } else if (bookingType === 'train') {
            return 'trains';
        }

        // Default fallback
        return 'flights';
    }

    /**
     * Get BPP service URL by type
     */
    getBppServiceUrl(serviceType) {
        const serviceUrls = {
            'flights': 'http://localhost:7001',
            'international_flights': 'http://localhost:7005',
            'hotels': 'http://localhost:7003',
            'buses': 'http://localhost:3004',
            'trains': 'http://localhost:3005'
        };

        return serviceUrls[serviceType] || serviceUrls.flights;
    }
}

module.exports = new BppMappingService();