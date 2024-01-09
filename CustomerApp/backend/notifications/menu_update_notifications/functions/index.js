
const {onDocumentUpdated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const axios = require('axios'); 

const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

 exports.menuUpdate = onDocumentUpdated("menu/{menu_id}", (event) => {
    
    const updatedData = event.data.after.data();
   
    const message = `There are some changes in our menu. Please visit our website for more details`;

    const emailTemplate = "<div> <p>Dear Customer,</p> <p>message</p><p>We look forward to seeing you!</p></div>";

    let html = emailTemplate.replace("message", message);

      // get all the reservations customer emails
      const collectionRef = db.collection("reservations");
      const querySnapshot = collectionRef.get().then(()=>{
        
        const receiversData = [];
      const receiversEmails = [];
      
      if (!querySnapshot.empty) {
        console.log("test 0");
        querySnapshot.forEach((doc) => {
          console.log("test 1");
        
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

          axios.post('https://wvrucrqu4qr2fsfw6rqhwnvwom0fyasj.lambda-url.us-east-1.on.aws/', {
            receiverEmail: reservationData.customer_email,
            subject: "Reservation Update!",
            text: "Dear Customer, There are some changes in your reservation. Hope you see you!",
            html: html,
          }).then(()=>{
            console.log("success sent");
          }).catch(error=>{
            console.log(error);
          });
        });
  
        /* for(let i=0;i<receiversEmails.length;i++){
            axios.post('https://wvrucrqu4qr2fsfw6rqhwnvwom0fyasj.lambda-url.us-east-1.on.aws/', {
            receiverEmail: receiversEmails[i],
            subject: "Reservation Update!",
            text: "Dear Customer, There are some changes in your reservation. Hope you see you!",
            html: html,
          }).then(()=>{
            console.log("success sent");
          }).catch(error=>{
            console.log(error);
          });
        } */
      }

      }).catch(error=>{
        console.log(error);
      });;
  
      

     
 });

 function invokeEmailSendingLambda(customer_email,html) {

  axios.post('https://wvrucrqu4qr2fsfw6rqhwnvwom0fyasj.lambda-url.us-east-1.on.aws/', {
        receiverEmail: customer_email,
        subject: "Reservation Update!",
        text: "Dear Customer, There are some changes in your reservation. Hope you see you!",
        html: html,
      }).then(()=>{
        console.log("success sent");
      }).catch(error=>{
        console.log(error);
      });

 }
