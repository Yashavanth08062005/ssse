const express = require('express');
const router = express.Router();
const bppMappingService = require('../services/bppMappingService');
const logger = require('../utils/logger');

/**
 * BPP Booking Mapping Routes
 * Provides APIs to retrieve booking ID mappings between platform and BPP services
 */

/**
 * Get BPP mappings by platform booking ID
 */
router.get('/platform/:platformBookingId', async (req, res) => {
    try {
        const { platformBookingId } = req.params;
        
        logger.info('Getting BPP mappings for platform booking ID', { platformBookingId });
        
        const mappings = await bppMappingService.getMappingsByPlatformId(platformBookingId);
        
        return res.status(200).json({
            success: true,
            platformBookingId,
            mappingCount: mappings.length,
            mappings
        });

    } catch (error) {
        logger.error('Error getting BPP mappings by platform ID:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve BPP mappings',
            message: error.message
        });
    }
});

/**
 * Get BPP mapping by BPP booking ID
 */
router.get('/bpp/:bppBookingId', async (req, res) => {
    try {
        const { bppBookingId } = req.params;
        
        logger.info('Getting BPP mapping for BPP booking ID', { bppBookingId });
        
        const mapping = await bppMappingService.getMappingByBppId(bppBookingId);
        
        return res.status(200).json({
            success: true,
            bppBookingId,
            mapping
        });

    } catch (error) {
        logger.error('Error getting BPP mapping by BPP ID:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: 'BPP booking mapping not found',
                message: error.message
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve BPP mapping',
            message: error.message
        });
    }
});

/**
 * Get BPP mappings by booking reference
 */
router.get('/reference/:bookingReference', async (req, res) => {
    try {
        const { bookingReference } = req.params;
        
        logger.info('Getting BPP mappings for booking reference', { bookingReference });
        
        const mappings = await bppMappingService.getMappingsByReference(bookingReference);
        
        return res.status(200).json({
            success: true,
            bookingReference,
            mappingCount: mappings.length,
            mappings
        });

    } catch (error) {
        logger.error('Error getting BPP mappings by reference:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve BPP mappings',
            message: error.message
        });
    }
});

/**
 * Update BPP mapping status
 */
router.patch('/bpp/:bppBookingId/status', async (req, res) => {
    try {
        const { bppBookingId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({
                success: false,
                error: 'Status is required'
            });
        }
        
        const validStatuses = ['ACTIVE', 'CANCELLED', 'FAILED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid status',
                validStatuses
            });
        }
        
        logger.info('Updating BPP mapping status', { bppBookingId, status });
        
        const updatedMapping = await bppMappingService.updateMappingStatus(bppBookingId, status);
        
        return res.status(200).json({
            success: true,
            message: 'BPP mapping status updated successfully',
            mapping: updatedMapping
        });

    } catch (error) {
        logger.error('Error updating BPP mapping status:', error);
        
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: 'BPP booking mapping not found',
                message: error.message
            });
        }
        
        return res.status(500).json({
            success: false,
            error: 'Failed to update BPP mapping status',
            message: error.message
        });
    }
});

/**
 * Get BPP mapping statistics
 */
router.get('/stats', async (req, res) => {
    try {
        logger.info('Getting BPP mapping statistics');
        
        const stats = await bppMappingService.getMappingStats();
        
        // Transform stats into a more readable format
        const formattedStats = {
            totalMappings: 0,
            byServiceType: {},
            byStatus: {}
        };
        
        stats.forEach(stat => {
            formattedStats.totalMappings += parseInt(stat.count);
            
            if (!formattedStats.byServiceType[stat.bpp_service_type]) {
                formattedStats.byServiceType[stat.bpp_service_type] = {};
            }
            formattedStats.byServiceType[stat.bpp_service_type][stat.mapping_status] = parseInt(stat.count);
            
            if (!formattedStats.byStatus[stat.mapping_status]) {
                formattedStats.byStatus[stat.mapping_status] = 0;
            }
            formattedStats.byStatus[stat.mapping_status] += parseInt(stat.count);
        });
        
        return res.status(200).json({
            success: true,
            statistics: formattedStats,
            rawStats: stats
        });

    } catch (error) {
        logger.error('Error getting BPP mapping statistics:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to retrieve BPP mapping statistics',
            message: error.message
        });
    }
});

module.exports = router;