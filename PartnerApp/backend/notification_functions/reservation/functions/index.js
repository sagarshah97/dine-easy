const functions = require('firebase-functions');
const admin = require('firebase-admin');
const AWS = require('aws-sdk');

admin.initializeApp();

// Initialize AWS SNS client

const sns = new AWS.SNS({
  region: 'us-east-1', 
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

exports.notifyRestaurant = functions.firestore
  .document('restaurant_reservations/{restaurant_id}')
  .onWrite(async (change, context) => {
    const reservationData = change.after.exists ? change.after.data() : null;
    const restaurantId = reservationData ? reservationData.restaurant_id : null;

    if (restaurantId) {
      const message = `Reservation for restaurant ${restaurantId} has been updated.`;

      try {
        // Publish a message to the specified AWS SNS topic
        await sns.publish({
          Message: message,
          Subject: 'Reservation Update',
          TopicArn: 'arn:aws:sns:us-east-1:800751411799:Reservation',
        }).promise();

        console.log(`Notification sent: ${message}`);
      } catch (error) {
        console.error(`Error sending notification: ${error.message}`);
      }
    }

    return null;
  });
