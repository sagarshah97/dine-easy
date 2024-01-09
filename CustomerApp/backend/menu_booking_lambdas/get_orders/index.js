var admin = require("firebase-admin");

var serviceAccount = require("./serverless-menu.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



exports.handler = async (event, context) => {
    // Get a reference to the Firestore database
    const requestBody = JSON.parse(event.body);
    console.log(requestBody);
    const db = admin.firestore();
    let orderList = [];
    const response = {
        statusCode: '',
        headers:{
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify("success")
    }
    try {
      // Your Firestore operations go here
      const collectionRef = db.collection('orders');
      const querySnapshot = await collectionRef.where('user_id', '==', requestBody.user_id)
      .where('order_id', '==', requestBody.order_id).get();
      // Example: Retrieve documents from a Firestore collection
      if (querySnapshot.empty) {
        return {
          statusCode: 404,
          body: JSON.stringify('No order found.'),
        };
      } else {
        const orderList = [];
        querySnapshot.forEach((doc) => {
          console.log(doc.data().order_items)
          let orderslist = doc.data().order_items;
            orderslist.forEach((element)=>{
            orderList.push(element);
          })
        });
        response.statusCode = 200;
        response.body =  JSON.stringify(orderList);
        return response;
      }
    } catch (error) {
        response.statusCode = '500';
        response.body =  JSON.stringify("error");
        return response;
    }
  };





