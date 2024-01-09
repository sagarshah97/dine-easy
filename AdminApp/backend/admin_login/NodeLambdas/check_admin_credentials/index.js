require("dotenv").config();
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK with credentials
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

exports.handler = async (event) => {
  const { username, password } = event;

  try {
    // Get a reference to the 'admin_credentials' collection
    const credentialsRef = admin.firestore().collection("admin_credentials");

    // Retrieve the record that matches the username
    const querySnapshot = await credentialsRef
      .where("username", "==", username)
      .get();

    // Check if there is a matching record
    if (querySnapshot.empty) {
      console.log("User not found");
      return {
        statusCode: 401,
        body: {
          message: "Login unsuccessful - User not found",
        },
      };
    }

    // Check if the password matches
    const userRecord = querySnapshot.docs[0].data();
    if (userRecord.password === password) {
      console.log("Success");
      return {
        statusCode: 200,
        body: { message: "Login successful!" },
      };
    } else {
      console.log("Failed");
      return {
        statusCode: 401,
        body: {
          message: "Login unsuccessful!",
        },
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: { message: "Internal server error" },
    };
  }
};
