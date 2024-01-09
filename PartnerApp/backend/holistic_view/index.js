const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://serverless-401215.firebaseio.com/",
});

const db = admin.firestore();

exports.handler = async (event, context) => {
  try {
    const restaurantId = event.restaurantId;
    const reservationsRef = db.collection("restaurant_reservations");
    const snapshot = await reservationsRef
      .where("restaurant_id", "==", restaurantId)
      .get();

    const reservationsData = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      reservationsData.push({ id: doc.id, ...data });
    });

    // Set CORS headers to allow requests from any origin
    const headers = {
      "Access-Control-Allow-Origin": "*", // Replace * with specific origins if needed
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    };

    return {
      statusCode: 200,
      headers: headers,
      body: JSON.stringify(reservationsData),
    };
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
