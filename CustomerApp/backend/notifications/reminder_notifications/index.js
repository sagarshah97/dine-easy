const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json"); 
const moment = require("moment-timezone");
const AWS = require('aws-sdk');
const axios = require('axios'); 
require("dotenv").config();

// Initialize Firebase Admin SDK using service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});


const db = admin.firestore();
const lambda = new AWS.Lambda({ region: "us-east-1" });

exports.handler = async (event, context) => {
  try {

  // Calculate the timestamp for 30 minutes from now
  const currentTimestamp = admin.firestore.Timestamp.now();
  const thirtyMinutesFromNow = new admin.firestore.Timestamp(
    currentTimestamp.seconds + 30 * 60, 
    currentTimestamp.nanoseconds
  )

    // get all the reservations that are in 30 minutes from the current time
    const collectionRef = db.collection("reservations");
    const query = collectionRef
      .where("start_time", ">=", thirtyMinutesFromNow);
    const querySnapshot = await query.get();

    const receiversData = [];
    const receiversEmails = [];

    if (!querySnapshot.empty) {
      console.log ("inside loop query");
      querySnapshot.forEach((doc) => {
        console.log("test 0");
        const reservationData = doc.data();
        const startTime = moment(reservationData.start_time.toDate())
          .tz("America/Halifax")
          .format("dddd, MMMM D, YYYY HH:mm:ss");
          receiversData.push({
          id: doc.id,
          startTime,
          email: reservationData.email,
        });

        receiversEmails.push(
          reservationData.email,
        );

        console.log("test 1");
        console.log(reservationData.email);
          // invoke other lambda
      });

     /*  const emailPromises = receiversEmails.map(async (email) => {
        // Define the parameters for the other Lambda function for each email
        console.log("test 2", email);
        const params = {
          FunctionName: 'nodeMailerFunction',
          InvocationType: 'RequestResponse', // This ensures the Lambda function runs synchronously
          Payload: JSON.stringify({
            receiverEmail: email, // Pass an array with a single email address
            subject: 'Reservation Reminder!',
            text: 'Dear Customer,\n\nYour reservation is due within 30 mins at DineEasy.\n\nHope you see you!',
            html: '<p>Dear Customer, We look forward to seeing you!</p>',
          }),
        };
        console.log("test 3");
        console.log(params);
        // Call the other Lambda function for each email
        const response = await lambda.invoke(params).promise();
        console.log("test 4", response);
        // Handle the response from the other Lambda function
        if (response.StatusCode === 200) {
          const result = JSON.parse(response.Payload);
          console.log(result); // Log the result for debugging
        } else {
          console.error('Error calling the other Lambda function:', response);
        }
      });
  
      // Wait for all email invocations to complete
      await Promise.all(emailPromises);  */

      for(let i=0;i<receiversEmails.length;i++){
        console.log("test 1-1");
       await invokeEmailSendingLambda(receiversEmails[i]);
      }
    }
    return {
      statusCode: 200,
      body: ({
        message: "Success",    
      }),
    };

  } catch (error) {
    console.log("Error: ", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error!!!" }),
    };
  }
};


// Function to invoke the other Lambda function
 async function invokeEmailSendingLambda(email) {
  // Construct your payload for the other Lambda function
  console.log("email: ",email);
  const payload = {
    receiverEmail: email,
    subject: "Reservation Reminder!",
    text: "Dear Customer, Your reservation is due within 30 mins at DineEasy. Hope you see you!",
    html: "",
  };

  await axios.post('https://wvrucrqu4qr2fsfw6rqhwnvwom0fyasj.lambda-url.us-east-1.on.aws/', {
    receiverEmail: email,
    subject: "Reservation Reminder!",
    text: "Dear Customer, Your reservation is due within 30 mins at DineEasy. Hope you see you!",
    html: "<div>      <p>Dear Customer,</p>      <p>Your reservation is due within 30 minutes at DineEasy.</p>      <p>We look forward to seeing you!</p></div>",
  });

/*   console.log("test 2");
  // Use AWS SDK or any other method to invoke the other Lambda function with the payload
  // Example: AWS Lambda SDK
  const AWS = require('aws-sdk');
  const lambda = new AWS.Lambda({ region: "us-east-1" });
  console.log("test 3");
  const params = {
    FunctionName: 'nodeMailerFunction', // Replace with your Lambda function name
    InvocationType: 'RequestResponse', // This invokes the function asynchronously
    Payload: JSON.stringify(payload),
  };
  console.log("test 4");
  console.log(params);
  try {
    console.log("test 5");
    await lambda.invoke(params);
    console.log("test 6");
  } catch (error) {
    console.error('Error invoking Lambda function: ', error);
  } */
}