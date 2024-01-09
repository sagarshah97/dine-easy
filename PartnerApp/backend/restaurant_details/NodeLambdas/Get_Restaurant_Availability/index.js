process.env.TZ = "America/Halifax";

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.firestore();
const AWS = require("aws-sdk");
AWS.config.update({ region: "us-east-1" });
const sns = new AWS.SNS();
const iam = new AWS.IAM();
const dynamodb = new AWS.DynamoDB();

exports.handler = async (event) => {
  // Describe the IAM role to get its ARN
  const roleName = "LabRole";
  const roleDescription = await iam.getRole({ RoleName: roleName }).promise();
  const roleArn = roleDescription.Role.Arn;
  const accountNumber = roleArn.split(":")[4];

  const { restaurant_id, restaurant_operation_details, table_details, date } =
    event;

  try {
    const dynamoParams = {
      TableName: "restaurants",
      Key: {
        restaurant_id: { S: restaurant_id },
      },
    };

    const dynamoResponse = await dynamodb.getItem(dynamoParams).promise();
    const restaurantEmail = dynamoResponse.Item.restaurant_email.S;
    const topicName = restaurantEmail.replace(/[^a-zA-Z0-9_-]/g, "_");

    const snsTopicArn = `arn:aws:sns:us-east-1:${accountNumber}:${topicName}`;
    console.log(snsTopicArn);

    const collectionRef = db.collection("restaurant_reservations");
    const query = collectionRef
      .where("restaurant_id", "==", restaurant_id)
      .where("status", "==", "Approved");
    const reservationsSnapshot = await query.get();

    // Get the restaurant's opening and closing hours for the current day
    const currentDate = new Date(date);
    const currentDay = currentDate.toLocaleDateString("en-US", {
      weekday: "long",
    });
    const restaurantHours = restaurant_operation_details.find(
      (day) => day.day === currentDay
    );

    if (!restaurantHours) {
      console.log({
        message: "Restaurant is closed on the current day.",
      });
      return {
        statusCode: 400,
        body: {
          message: "Restaurant is closed on the current day.",
        },
      };
    }

    const openingTime = restaurantHours.opening_time;
    const closingTime = restaurantHours.closing_time;

    // Generate time slots for each table
    const timeSlots = [];
    for (let time = openingTime; time < closingTime; time += 100) {
      const startTime = time.toString().padStart(4, "0");
      const endTime = (time + 59).toString().padStart(4, "0");
      timeSlots.push(
        `${startTime.slice(0, 2)}:${startTime.slice(2)} - ${endTime.slice(
          0,
          2
        )}:${endTime.slice(2)}`
      );
    }

    const calculateTableAvailability = (
      tableNumber,
      reservationsSnapshot,
      timeSlots
    ) => {
      const tableStatus = {};

      reservationsSnapshot.forEach((doc) => {
        const reservation = doc.data();

        if (reservation.table.toString() === tableNumber) {
          if (!tableStatus[tableNumber]) {
            tableStatus[tableNumber] = {};
          }

          const reservationStartTime = reservation.start_time._seconds * 1000;
          const reservationEndTime = reservation.end_time._seconds * 1000;

          timeSlots.forEach((slot) => {
            const [slotStartTime, slotEndTime] = slot.split(" - ");
            const formattedSlotStartTime = `${date
              .split(" ")
              .slice(1, 4)
              .join(" ")} ${slotStartTime}`;
            const formattedSlotEndTime = `${date
              .split(" ")
              .slice(1, 4)
              .join(" ")} ${slotEndTime}`;
            const slotStartTimeMillis = new Date(
              formattedSlotStartTime
            ).getTime();
            const slotEndTimeMillis = new Date(formattedSlotEndTime).getTime();

            if (
              reservationStartTime === slotStartTimeMillis &&
              reservationEndTime === slotEndTimeMillis
            ) {
              tableStatus[tableNumber][slot] = "Occupied";
            }
          });
        }
      });

      console.log(tableStatus);
      const tableAvailability = {};

      if (
        tableStatus[tableNumber] &&
        Object.keys(tableStatus[tableNumber]).length === timeSlots.length
      ) {
        tableAvailability[tableNumber] = "Fully Booked";
      } else {
        tableAvailability[tableNumber] = "Accepting Reservations";
      }

      return tableAvailability;
    };

    const tableAvailability = {};

    table_details.forEach((table) => {
      const tableNumber = table.table_number;
      tableAvailability[tableNumber] = calculateTableAvailability(
        tableNumber,
        reservationsSnapshot,
        timeSlots
      );
    });

    console.log(tableAvailability);
    // Calculate overall restaurant availability
    const isFullyBooked = Object.values(tableAvailability).every((slot) =>
      Object.values(slot).every((status) => status === "Fully Booked")
    );

    if (isFullyBooked) {
      const snsParams = {
        Message: "All tables are fully booked.",
        Subject: "Restaurant Fully Booked",
        TopicArn: snsTopicArn,
      };

      sns.publish(snsParams, (err, data) => {
        if (err) {
          console.error("Error sending SNS notification:", err);
        } else {
          console.log("SNS notification sent:", data);
        }
      });
    }

    return {
      statusCode: 200,
      body: { tableAvailability, isFullyBooked },
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: { message: "Internal Server Error" },
    };
  }
};
