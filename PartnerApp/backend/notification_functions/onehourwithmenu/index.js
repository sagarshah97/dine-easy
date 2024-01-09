const functions = require('firebase-functions');
const admin = require('firebase-admin');
const AWS = require('aws-sdk');

admin.initializeApp();

const sns = new AWS.SNS({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

exports.checkReservationsAndNotify = functions.pubsub
  .schedule('every 30 minutes')
  .timeZone('America/Halifax') 
  .onRun(async (context) => {
    try {
      // Query reservations with a menu within the next 30 minutes
      const now = new Date();
      const next30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
      
      const reservationsSnapshot = await admin.firestore()
        .collection('restaurant_reservations')
        .where('menu', '!=', null)
        .where('start_time', '>=', now)
        .where('end_time', '<=', next30Minutes)
        .get();

      // Send notifications for reservations with a menu
      const notificationPromises = [];
      reservationsSnapshot.forEach((reservationDoc) => {
        const reservationData = reservationDoc.data();
        const message = `Reservation with menu for restaurant ${reservationData.restaurant_id} is scheduled within the next 30 minutes.`;

        const notificationPromise = sns.publish({
          Message: message,
          Subject: 'Upcoming Reservation',
          TopicArn: 'arn:aws:sns:us-east-1:800751411799:Onehourmenu',
        }).promise();

        notificationPromises.push(notificationPromise);
      });

      // Wait for all notifications to be sent
      await Promise.all(notificationPromises);

      console.log('Notifications sent for upcoming reservations with a menu.');

    } catch (error) {
      console.error(`Error checking reservations and sending notifications: ${error.message}`);
    }

    return null;
  });
