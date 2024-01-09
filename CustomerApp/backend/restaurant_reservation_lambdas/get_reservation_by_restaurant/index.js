process.env.TZ = "America/Halifax";
require("dotenv").config();
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const moment = require("moment-timezone");

// Initialize Firebase Admin SDK using service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.firestore();

exports.handler = async (event, context) => {
  try {
    const collectionRef = db.collection("restaurant_reservations");
    const requestBody = event.body;
    const restaurantId = requestBody.restaurantId;

    // Convert the desired date to a Firebase Timestamp
    const desiredDate = admin.firestore.Timestamp.fromDate(
      moment(requestBody.date, "MMMM DD, YYYY")
        .tz(requestBody.timezone)
        .toDate()
    );

    // Add a condition to check restaurant_id and start_time
    const query = collectionRef
      .where("restaurant_id", "==", restaurantId)
      .where("start_time", ">=", desiredDate) // Compare only the date part
      .where(
        "start_time",
        "<=",
        admin.firestore.Timestamp.fromDate(
          moment(requestBody.date)
            .tz(requestBody.timezone)
            .endOf("day")
            .toDate()
        )
      ); // Compare for a 24-hour period

    const query2 = collectionRef.where("status", "!=", "Rejected");

    const reservationsSnapshot1 = await query.get();
    const reservationsSnapshot2 = await query2.get();

    const mergedResults = [];
    reservationsSnapshot1.forEach((doc) => mergedResults.push(doc));
    reservationsSnapshot2.forEach((doc) => mergedResults.push(doc));

    const reservationsSnapshot = mergedResults;

    if (reservationsSnapshot.empty) {
      console.log({ error: "No reservations found" });
      return {
        statusCode: 404,
        body: { error: "No reservations found" },
      };
    }

    const reservationsData = [];
    reservationsSnapshot.forEach((doc) => {
      const reservationData = doc.data();
      const table = reservationData.table;
      const startTime = moment(reservationData.start_time.toDate())
        .tz(requestBody.timezone)
        .format("dddd, MMMM D, YYYY HH:mm:ss");
      const endTime = moment(reservationData.end_time.toDate())
        .tz(requestBody.timezone)
        .format("dddd, MMMM D, YYYY HH:mm:ss");

      reservationsData.push({
        id: doc.id,
        table,
        tableCapacity: reservationData.table_capacity,
        startTime,
        endTime,
        restaurantName: reservationData.restaurant_name,
        restaurantId: reservationData.restaurant_id,
      });
    });

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
