process.env.TZ = "America/Halifax";
const admin = require("firebase-admin");
const crypto = require("crypto");
const moment = require("moment-timezone");
const serviceAccount = require("./serviceAccountKey.json");
require("dotenv").config();

// Initialize Firebase Admin SDK using service account credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.firestore();
const encryptionKey = process.env.ENCRYPTION_KEY;

exports.handler = async (event, context) => {
  try {
    const requestBody = event.body;
    const timezone = requestBody.timezone;

    // Convert date and time strings to JavaScript Date objects along with Timezone
    const startTime = moment.tz(requestBody.startTime, timezone).toDate();
    const endTime = moment.tz(requestBody.endTime, timezone).toDate();

    // Check if a reservation for the given restaurant, table and time already exists
    const collectionRef = db.collection("restaurant_reservations");
    const querySnapshot = await collectionRef
      .where("table", "==", requestBody.tableNumber)
      .where("restaurant_id", "==", requestBody.restaurantId)
      .where(
        "end_time",
        "==",
        admin.firestore.Timestamp.fromDate(new Date(endTime))
      )
      .where(
        "start_time",
        "==",
        admin.firestore.Timestamp.fromDate(new Date(startTime))
      )
      .get();

    if (!querySnapshot.empty) {
      console.log({
        message: "Table is already reserved for the requested time",
      });
      return {
        statusCode: 400,
        body: {
          error: "Table is already reserved for the requested time",
        },
      };
    }

    // If no reservation exists, create a new reservation
    const reservationData = {
      table: requestBody.tableNumber,
      table_capacity: requestBody.tableCapacity,
      start_time: admin.firestore.Timestamp.fromDate(new Date(startTime)),
      end_time: admin.firestore.Timestamp.fromDate(new Date(endTime)),
      customer_id: requestBody.customerId,
      customer_name: encryptData(requestBody.customerName),
      customer_email: encryptData(requestBody.customerEmail),
      restaurant_id: requestBody.restaurantId,
      restaurant_name: requestBody.restaurantName,
      status: "Pending",
    };

    console.log(reservationData);
    const newReservationRef = await collectionRef.add(reservationData);
    console.log(newReservationRef.id);
    return {
      statusCode: 200,
      body: {
        message: "Reservation created successfully",
        id: newReservationRef.id,
      },
    };
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    };
  }
};

const encryptData = (data) => {
  let encryptedData = data;

  const cipher = crypto.createCipher("aes256", encryptionKey);
  encryptedData = cipher.update(data, "utf8", "hex");
  encryptedData += cipher.final("hex");

  return encryptedData;
};
