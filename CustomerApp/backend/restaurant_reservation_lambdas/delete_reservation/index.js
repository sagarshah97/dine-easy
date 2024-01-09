process.env.TZ = "America/Halifax";
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const moment = require("moment-timezone");
require("dotenv").config();

// Initialize Firebase Admin SDK using service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.firestore();

exports.handler = async (event, context) => {
  try {
    // Parse the incoming request body to get the reservation_id
    const requestBody = event.body;
    const reservationId = requestBody.reservationId;

    const collectionRef = db.collection("restaurant_reservations");
    const reservationRef = collectionRef.doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      return {
        statusCode: 404,
        body: { error: "Reservation not found" },
      };
    }

    const reservationData = reservationDoc.data();
    const currentTime = moment.tz("America/Halifax");
    const reservationStartTime = moment(reservationData.start_time.toDate()).tz(
      requestBody.timezone
    );
    const deleteWindowStartTime = reservationStartTime
      .clone()
      .subtract(1, "hour");

    // Check if the current time is before the 1-hour delete window
    if (currentTime.isBefore(deleteWindowStartTime)) {
      await reservationRef.delete();
      console.log({ message: "Reservation deleted successfully" });
      return {
        statusCode: 200,
        body: { message: "Reservation deleted successfully" },
      };
    } else {
      console.log({
        message:
          "Reservation can only be deleted anytime before 1 hour of the start time",
      });
      return {
        statusCode: 403,
        body: {
          error:
            "Reservation can only be deleted anytime before 1 hour of the start time",
        },
      };
    }
  } catch (error) {
    console.error("Error: ", error);
    return {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    };
  }
};
