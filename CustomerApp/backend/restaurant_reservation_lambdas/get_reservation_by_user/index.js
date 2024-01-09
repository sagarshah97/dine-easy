process.env.TZ = "America/Halifax";
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const moment = require("moment-timezone");
const crypto = require("crypto");
require("dotenv").config();

// Initialize Firebase Admin SDK using service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.firestore();
const encryptionKey = process.env.ENCRYPTION_KEY;

exports.handler = async (event, context) => {
  try {
    const collectionRef = db.collection("restaurant_reservations");
    const query = collectionRef.where("customer_id", "==", event.body.userId);
    const reservationsSnapshot = await query.get();

    if (reservationsSnapshot.empty) {
      return {
        statusCode: 404,
        body: { error: "No reservations found" },
      };
    }

    const reservationsData = [];
    reservationsSnapshot.forEach((doc) => {
      const reservationData = doc.data();
      console.log(reservationData);
      const table = reservationData.table;
      const startTime = moment(reservationData.start_time.toDate())
        .tz(event.body.timezone)
        .format("dddd, MMMM D, YYYY HH:mm:ss");
      const endTime = moment(reservationData.end_time.toDate())
        .tz(event.body.timezone)
        .format("dddd, MMMM D, YYYY HH:mm:ss");

      reservationsData.push({
        id: doc.id,
        table,
        tableCapacity: reservationData.table_capacity,
        startTime,
        endTime,
        customerId: reservationData.customer_id,
        customerName: decryptData(reservationData.customer_name),
        customerEmail: decryptData(reservationData.customer_email),
        restaurantName: reservationData.restaurant_name,
        restaurantId: reservationData.restaurant_id,
        status: reservationData.status,
      });
    });

    console.log(reservationsData);

    return {
      statusCode: 200,
      body: reservationsData,
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    };
  }
};

const decryptData = (encryptedData) => {
  let decryptedData = encryptedData;

  const decipher = crypto.createDecipher("aes256", encryptionKey);
  decryptedData = decipher.update(encryptedData, "hex", "utf8");
  decryptedData += decipher.final("utf8");

  return decryptedData;
};
