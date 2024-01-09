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
    const reservationRef = db
      .collection("restaurant_reservations")
      .doc(reservationId);

    await reservationRef.update({ status: event.status });
    console.log("Status changed");
    return {
      statusCode: 200,
      body: { message: "Reservation changed successfully" },
    };
  } catch (error) {
    console.error("Error accepting reservation:", error);
  }
};
