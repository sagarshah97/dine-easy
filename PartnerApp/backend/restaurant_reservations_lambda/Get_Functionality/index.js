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
    const restaurantId = event.restaurantId;

    const reservationsRef = db.collection("restaurant_reservations");
    const querySnapshot = await reservationsRef
      .where("status", "==", "Pending")
      .where("restaurant_id", "==", restaurantId)
      .get();

    const pendingReservations = [];
    querySnapshot.forEach((doc) => {
      pendingReservations.push({ id: doc.id, ...doc.data() });
    });

    return {
      statusCode: 200,
      body: JSON.stringify(pendingReservations),
    };
  } catch (error) {
    console.error("Error fetching pending reservations:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
