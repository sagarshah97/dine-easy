var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dineeasy-5410-default-rtdb.firebaseio.com"
});


exports.handler = async (event, context) => {
    // Get a reference to the Firestore database
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
    try {
      // Your Firestore operations go here
      const collectionRef = db.collection('menu');
    
      // Example: Retrieve documents from a Firestore collection
      await collectionRef.get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          console.log(doc.id, ' => ', doc.data());
          menuList.push(doc.data());
          // return response;
        });
        response.statusCode = '200';
        response.body =  JSON.stringify({message:"success",menu:menuList});
        console.log(menuList)
      })
      .catch((error) => {
        response.statusCode = '500';
        response.body =  JSON.stringify("error");
        //return response;
      });
     
    } catch (error) {
        response.statusCode = '500';
        response.body =  JSON.stringify("error");
        //return response;
    }
    finally {
        return response
    }
  };