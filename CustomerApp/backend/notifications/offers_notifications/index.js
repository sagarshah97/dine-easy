const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json"); 
const moment = require("moment-timezone");
const axios = require('axios'); 
require("dotenv").config();

// Initialize Firebase Admin SDK using service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});


const db = admin.firestore();

exports.handler = async (event, context) => {
  try {

  // Calculate the timestamp for 30 minutes from now
  const currentTimestamp = admin.firestore.Timestamp.now();
  const oneHourBefore = new admin.firestore.Timestamp(
    currentTimestamp.seconds - 60 * 60, // Subtract 1 hour (60 minutes * 60 seconds)
    currentTimestamp.nanoseconds
  );

    // get all the reservations that are in 30 minutes from the current time
    const collectionRef = db.collection("reservations");
    const query = collectionRef;
    const querySnapshot = await query.get();

    const receiversData = [];
    const receiversEmails = [];

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const reservationData = doc.data();
        const startTime = moment(reservationData.start_time.toDate())
          .tz("America/Halifax")
          .format("dddd, MMMM D, YYYY HH:mm:ss");
          receiversData.push({
          id: doc.id,
          startTime,
          email: reservationData.customer_email,
        });

        receiversEmails.push(
          reservationData.customer_email,
        );
      });

      const emailTemplate = "<div> <p>Dear Customer,</p> <p>message</p><p>We look forward to seeing you!</p></div>";

      let html = emailTemplate.replace("message", "messag");

      for(let i=0;i<receiversEmails.length;i++){
       await invokeEmailSendingLambda(receiversEmails[i],html);
      }
    }

    const collectionRef1 = db.collection("offers");
    const query1 = collectionRef1
    .where("added_time", ">=", oneHourBefore);
    const querySnapshot1 = await query1.get();

    const offersData = [];
    let message ='';
    let html='';

    if (!querySnapshot1.empty) {
      querySnapshot1.forEach((doc) => {
        const newOffer = doc.data();
          offersData.push({
          id: doc.id,
          details: newOffer.details,
          
        });

        message +=  newOffer.details + "<br>";

      });

      const emailTemplate = "<div> <p>Dear Customer,</p>Here are some new offers for you: <p>message</p></div>";
      html = emailTemplate.replace("message", message);
    }

    if(message !== null && message !== ''){
      for(let i=0;i<receiversEmails.length;i++){
        await invokeEmailSendingLambda(receiversEmails[i],html);
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
 async function invokeEmailSendingLambda(customer_email, html) {

  await axios.post('https://wvrucrqu4qr2fsfw6rqhwnvwom0fyasj.lambda-url.us-east-1.on.aws/', {
    receiverEmail: customer_email,
    subject: "Reservation Reminder!",
    text: "Dear Customer, Your reservation is due within 30 mins at DineEasy. Hope you see you!",
    html: html,
  });

}