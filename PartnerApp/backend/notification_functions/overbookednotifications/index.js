const functions = require('firebase-functions');
const admin = require('firebase-admin');
const AWS = require('aws-sdk');

admin.initializeApp();

const sns = new AWS.SNS({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

exports.checkTablesAndMenuBooking = functions.pubsub
  .schedule('every 1 hour') 
  .timeZone('America/Halifax') 
  .onRun(async (context) => {
    try {
      // Check for overbooked tables
      const overbookedTablesSnapshot = await admin.firestore()
        .collection('restaurant_reservations')
        .where('status', '==', 'Pending') 
        .where('table_capacity', '<', 'tables_required') 
        .get();

      // Notify if tables are overbooked
      if (!overbookedTablesSnapshot.empty) {
        const overbookedMessage = `Tables are being overbooked. Please review reservations.`;

        await sns.publish({
          Message: overbookedMessage,
          Subject: 'Overbooked Tables',
          TopicArn: 'arn:aws:sns:us-east-1:800751411799:Onehourmenu',
        }).promise();

        console.log('Notification sent for overbooked tables.');
      }

      // Get the top three menu items mostly booked
      const menuBookingSnapshot = await admin.firestore()
        .collection('restaurant_reservations')
        .where('menu', '!=', null)
        .get();

      const menuItemsCounter = new Map();

      menuBookingSnapshot.forEach((reservationDoc) => {
        const reservationData = reservationDoc.data();
        const menuItems = reservationData.menu;

        if (menuItems && Array.isArray(menuItems)) {
          menuItems.forEach((menuItem) => {
            const count = menuItemsCounter.get(menuItem) || 0;
            menuItemsCounter.set(menuItem, count + 1);
          });
        }
      });

      // Sort menu items by booking count in descending order
      const sortedMenuItems = Array.from(menuItemsCounter.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3); // Take the top three menu items

      // Notify about the top three mostly booked menu items
      if (sortedMenuItems.length > 0) {
        const topMenuItemsMessage = `Top three mostly booked menu items: ${sortedMenuItems.map(item => `${item[0]} (${item[1]} bookings)`).join(', ')}`;

        await sns.publish({
          Message: topMenuItemsMessage,
          Subject: 'Top Three Booked Menu Items',
          TopicArn: 'arn:aws:sns:us-east-1:800751411799:Onehourmenu',
        }).promise();

        console.log('Notification sent for top three mostly booked menu items.');
      }

    } catch (error) {
      console.error(`Error checking tables and menu bookings: ${error.message}`);
    }

    return null;
  });
