const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialize Firebase Admin SDK using service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://serverless-401215.firebaseio.com/",
});

const db = admin.firestore();

exports.handler = async (event, context) => {
  try {
    const reservationId = event.reservationId;
    // Delete the reservation document
    await db.collection("restaurant_reservations").doc(reservationId).delete();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Reservation deleted successfully" }),
    };
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
