
//const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentUpdated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const moment = require("moment-timezone");
const axios = require('axios'); 

 exports.reservationUpdate = onDocumentUpdated("reservations/{reservation_id}", (event) => {
    
    const updatedData = event.data.after.data();
    console.log(updatedData);

    const formattedStartTime = moment(updatedData.start_time.toDate()).format('MMMM D, YYYY HH:mm:ss');

    const message = `There are some changes in your reservation. Here are the updated details:
    Your reservation is on : ${formattedStartTime} for table ${updatedData.table}`;

    const emailTemplate = "<div> <p>Dear Customer,</p> <p>message</p><p>We look forward to seeing you!</p></div>";

    let html = emailTemplate.replace("message", message);

     axios.post('https://wvrucrqu4qr2fsfw6rqhwnvwom0fyasj.lambda-url.us-east-1.on.aws/', {
        receiverEmail: updatedData.customer_email,
        subject: "Reservation Update!",
        text: "Dear Customer, There are some changes in your reservation. Hope you see you!",
        html: html,
      }).then(()=>{
        console.log("success sent");
      }).catch(error=>{
        console.log(error);
      });
 });
