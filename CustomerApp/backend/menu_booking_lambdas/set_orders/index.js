var admin = require("firebase-admin");

var serviceAccount = require("./serverless-menu.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



exports.handler = async (event, context) => {
  // Get a reference to the Firestore database
  var requestBody = JSON.parse(event.body);
    console.log(requestBody)
    var documentData = {
      order_id: requestBody.order_id,
      user_id: requestBody.user_id,
      order_items: requestBody.order
    }
    const db = admin.firestore();
    let menuList = [];
    const response = {
        statusCode: '',
        headers:{
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*"
        },
        body: JSON.stringify("success")
      }
      
      // Your Firestore operations go here
      let collectionName = 'orders'
      let  itemsCollectionName = 'items';
      let itemsCollection = db.collection(itemsCollectionName);
      const collectionRef = db.collection(collectionName);
      
      try {
        const querySnapshot = await collectionRef.get();
    
        if (querySnapshot.empty) {
          var newDocRef = await collectionRef.add({
            order_id: requestBody.order_id,
            user_id: requestBody.user_id,
            order_items: JSON.parse(event.body).order_items
          });



          response.body = `${collectionName} addeded successfully.`
          response.statusCode=200;
          return response;
        } else {
          let findOrderId = JSON.parse(event.body).order_id
          const orderRef = db.collection(collectionName);
          const query = collectionRef.where('order_id', '==', findOrderId);
          const querySnapshot = await query.get();
          if(!querySnapshot.empty){
            console.log("heree");
            const docRef = querySnapshot.docs[0].ref;
            await docRef.update({
              order_id: requestBody.order_id,
              user_id: requestBody.user_id,
              order_items: JSON.parse(event.body).order_items
            });
            
            let orderList = JSON.parse(event.body).order_items;
            for (const orderItem of orderList) {
              const { item, quantity } = orderItem;
              console.log(item," ---",quantity)
              const itemQuery = itemsCollection.where('item', '==', item);
              const itemSnapshot = await itemQuery.get();
              if (!itemSnapshot.empty) {
                // Update the item's quantity
                  const itemDoc = itemSnapshot.docs[0];
                  console.log(itemDoc.data(), "if item matched")
                  const existingQuantity = itemDoc.data().quantity;
                  const newQuantity = existingQuantity - quantity;
                  console.log("new quantity",newQuantity)
                  // Update Firestore document with the adjusted quantity
                  await itemsCollection.doc(itemDoc.id).update({ quantity: newQuantity });
        
                  console.log(`Item '${item}' quantity updated to ${newQuantity}`);
                } else {
                  console.log(`Item '${item}' not found in the items collection.`);
                }
            }
            response.body = `order updated successfully.`
            response.statusCode=200;
            return response;
          }
          else{

            const newDocRef = collectionRef.doc();
            await newDocRef.set({
              order_id: requestBody.order_id,
              user_id: requestBody.user_id,
              order_items: JSON.parse(event.body).order_items
            });
            let orderList = JSON.parse(event.body).order_items;
            for (const orderItem of orderList) {
              const { item, quantity } = orderItem;
              console.log(item," ---",quantity)
              const itemQuery = itemsCollection.where('item', '==', item);
              const itemSnapshot = await itemQuery.get();
              if (!itemSnapshot.empty) {
                // Update the item's quantity
                  const itemDoc = itemSnapshot.docs[0];
                  console.log(itemDoc.data(), "if item matched")
                  const existingQuantity = itemDoc.data().quantity;
                  const newQuantity = existingQuantity - quantity;
                  console.log("new quantity",newQuantity)
                  // Update Firestore document with the adjusted quantity
                  await itemsCollection.doc(itemDoc.id).update({ quantity: newQuantity });
                  console.log(`Item '${item}' quantity updated to ${newQuantity}`);
                } else {
                  console.log(`Item '${item}' not found in the items collection.`);
                }
            }
            response.body = `Order addeded successfully.`
            response.statusCode=200;
            return response;
          }
        }
      } catch (error) {
        console.error('Error checking collection existence:', error);
        response.body = `An error occurred: ${error.message}`;
        response.statusCode = 500;
        return response
      }
  
  }




