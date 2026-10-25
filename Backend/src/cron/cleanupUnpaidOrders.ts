import cron from 'node-cron';
import PrintRequest from '../models/PrintRequest.model';
import { deleteLocalFile } from '../config/s3.config';

/**
 * Clean up unpaid orders after 14 minutes
 * - Finds print requests with payment_status = 'pending' created > 14 mins ago
 * - Deletes associated files from local VPS disk
 * - Removes the print request from database
 */
export const startCleanupUnpaidOrdersCron = () => {
  // Run every 15 minutes
  const cronSchedule = '*/15 * * * *'; // Every 15 minutes

  cron.schedule(cronSchedule, async () => {
    try {
      console.log('🧹 Running unpaid orders cleanup...');

      // Find orders that are pending payment and older than 14 minutes
        const cutoffTime = new Date(Date.now() - 14 * 60 * 1000);

        const unpaidOrders = await PrintRequest.find({
          payment_status: 'pending',
          createdAt: { $lt: cutoffTime },
        });

      if (unpaidOrders.length === 0) {
        console.log('✅ No unpaid orders to clean up');
        return;
      }

      console.log(`📋 Found ${unpaidOrders.length} unpaid order(s) to clean up`);

      let deletedCount = 0;
      let failedCount = 0;

      for (const order of unpaidOrders) {
        try {
          // Delete files from local VPS disk
          for (const file of order.files) {
            if (!file.s3Key || file.s3Key.startsWith('memory-')) continue;
            await deleteLocalFile(file.s3Key);
            console.log(`  🗑️ Deleted local file: ${file.s3Key}`);
          }

          // Delete the order from database
          await PrintRequest.deleteOne({ _id: order._id });
          deletedCount++;
          console.log(`  ✅ Deleted unpaid order: ${order._id}`);
        } catch (error) {
          failedCount++;
          console.error(`  ❌ Failed to clean up order ${order._id}:`, error);
        }
      }

      console.log(
        `✅ Cleanup complete: ${deletedCount} deleted, ${failedCount} failed`
      );
    } catch (error: any) {
      console.error('❌ Cleanup unpaid orders cron error:', error.message);
    }
  });

  console.log('✅ Unpaid orders cleanup cron job scheduled (every 15 minutes)');
};

export default {
  startCleanupUnpaidOrdersCron,
};
