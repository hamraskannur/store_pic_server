import schedule from 'node-schedule';
import fsPromises from 'fs/promises'; 
import imageSchema from "../models/image.js";

export function setupScheduledJob() {

// Schedule a job to run every day to check for expired images
 schedule.scheduleJob('0 0 * * *', async () => {
  const expiredImages = await imageSchema.find({
    expiration: { $lte: new Date() },
  });
  for (const image of expiredImages) {
    try {
      // Delete the file from the server
      await fsPromises.unlink(`public/${image.image.split('/').pop()}`);
      // Delete the entry from the database
      await imageSchema.findByIdAndRemove(image._id);

    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }
});

}
