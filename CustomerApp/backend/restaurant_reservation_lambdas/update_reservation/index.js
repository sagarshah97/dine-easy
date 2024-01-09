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
    const requestBody = event.body;
    const reservationId = requestBody.reservationId;
    const newReservationData = requestBody.newReservationData;

    const collectionRef = db.collection("restaurant_reservations");
    const reservationRef = collectionRef.doc(reservationId);
    const reservationDoc = await reservationRef.get();

    if (!reservationDoc.exists) {
      console.log({ error: "Reservation not found" });
      return {
        statusCode: 404,
        body: { error: "Reservation not found" },
      };
    }

    const reservationData = reservationDoc.data();
    const currentTime = moment.tz(requestBody.timezone);
    const reservationStartTime = moment(reservationData.start_time.toDate());
    const editWindowStartTime = reservationStartTime
      .clone()
      .subtract(1, "hour");

    // Check if the current time is within the 1-hour edit window
    if (currentTime.isBefore(editWindowStartTime)) {
      const clashes = await checkReservationClashes(
        collectionRef,
        newReservationData.restaurantId,
        newReservationData.tableNumber,
        moment(newReservationData.startTime, "YYYY-MM-DD HH:mm:ss").toDate(),
        moment(newReservationData.endTime, "YYYY-MM-DD HH:mm:ss").toDate()
      );
      if (clashes.length === 0) {
        // No clashes, update the reservation data
        const updatedData = {
          start_time: admin.firestore.Timestamp.fromDate(
            new Date(newReservationData.startTime)
          ),
          end_time: admin.firestore.Timestamp.fromDate(
            new Date(newReservationData.endTime)
          ),
          table: newReservationData.tableNumber,
          table_capacity: requestBody.tableCapacity,
          customer_id: newReservationData.customerId,
          customer_name: encryptData(newReservationData.customerName),
          customer_email: encryptData(newReservationData.customerEmail),
          restaurant_id: newReservationData.restaurantId,
          restaurant_name: newReservationData.restaurantName,
          status: "Pending",
        };
        await reservationRef.set(updatedData);
        return {
          statusCode: 200,
          body: { message: "Reservation updated successfully" },
        };
      } else {
        // Clashes found, return an error
        console.log({
          message: "Reservation clashes with existing reservation(s)",
        });
        return {
          statusCode: 400,
          body: {
            error: "Reservation clashes with existing reservation(s)",
          },
        };
      }
    } else {
      return {
        statusCode: 400,
        body: {
          error: "Reservation cannot be modified within 1 hour of commencing",
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

const checkReservationClashes = async (
  collectionRef,
  restaurantId,
  table,
  startTime,
  endTime
) => {
  const querySnapshot = await collectionRef
    .where("restaurant_id", "==", restaurantId)
    .where("table", "==", table)
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

  const clashes = [];

  querySnapshot.forEach((doc) => {
    clashes.push(doc.id);
  });

  return clashes;
};

const encryptData = (data) => {
  let encryptedData = data;

  const cipher = crypto.createCipher("aes256", encryptionKey);
  encryptedData = cipher.update(data, "utf8", "hex");
  encryptedData += cipher.final("hex");

  return encryptedData;
};
