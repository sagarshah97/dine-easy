const functions = require('firebase-functions');
const admin = require('firebase-admin');
const AWS = require('aws-sdk');

admin.initializeApp();

const sns = new AWS.SNS({
  region: 'us-east-1', 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

exports.checkReservationsAndNotifyPartner = functions.pubsub
  .schedule('every 30 minutes') 
  .timeZone('America/Halifax') 
  .onRun(async (context) => {
    try {
      // Calculate the current time and the reservation time 10 minutes later
      const now = new Date();
      const reservationStartTime = new Date(now.getTime() + 10 * 60 * 1000);

      // Query reservations without a menu scheduled within the next 10 minutes
      const reservationsSnapshot = await admin.firestore()
        .collection('restaurant_reservations')
        .where('menu', '==', null)
        .where('start_time', '>=', now)
        .where('start_time', '<=', reservationStartTime)
        .get();

      // Send notifications for reservations without a menu
      const notificationPromises = [];
      reservationsSnapshot.forEach((reservationDoc) => {
        const reservationData = reservationDoc.data();
        const message = `Reservation without a menu for restaurant ${reservationData.restaurant_id} is scheduled within the next 10 minutes.`;

        const notificationPromise = sns.publish({
          Message: message,
          Subject: 'Upcoming Reservation',
          TopicArn: 'arn:aws:sns:us-east-1:800751411799:Onehourmenu',
        }).promise();

        notificationPromises.push(notificationPromise);
      });

      // Wait for all notifications to be sent
      await Promise.all(notificationPromises);

      console.log('Notifications sent for upcoming reservations without a menu.');

    } catch (error) {
      console.error(`Error checking reservations and sending notifications: ${error.message}`);
    }

    return null;
  });
