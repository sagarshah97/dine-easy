var admin = require("firebase-admin");
const moment = require("moment-timezone");
var serviceAccount = require("./serverless-menu.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function fetchDataFromAPI() {
  try {
    let apiUrl =
      "https://k7gf4d2487.execute-api.us-east-1.amazonaws.com/dev-get-rd/getRestaurantDetails";

    const apiKey = "";
    let postData = {
      restaurant_id: "1",
    };
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    //console.log('Success:', data);
    return data;
  } catch (error) {
    console.error("Error:", error.message);
  }
}
async function updateDataFromAPI(req) {
  try {
    let apiUrl =
      "https://k7gf4d2487.execute-api.us-east-1.amazonaws.com/dev-update-rd/updateRestaurantDetails";

    const apiKey = "";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(req),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    //console.log('Success:', data);
    return data;
  } catch (error) {
    console.error("Error:", error.message);
  }
}

exports.handler = async (event) => {
  const db = admin.firestore();

  // Your Firestore operations go here
  let itemReview = "itemReview";
  let restaurantDetails = "restaurantDetails";
  let restaurant_reservations = "restaurant_reservations";

  try {
    if (
      event &&
      event["interpretations"] &&
      event["interpretations"].length > 0
    ) {
      const interpretations = event["interpretations"];
      let highestConfidence = -1;
      let selectedIntent = null;
      const arbitraryDate = new Date();

      interpretations.forEach((interpretation) => {
        if (
          interpretation.intent &&
          interpretation.nluConfidence > highestConfidence
        ) {
          highestConfidence = interpretation.nluConfidence;
          selectedIntent = interpretation.intent;
        }
      });
      console.log(selectedIntent.name);
      if (selectedIntent && selectedIntent.name == "GetOpeningHours") {
        const response = {
          sessionState: {
            intent: {
              name: "GetOpeningHours",
              slots: selectedIntent.slots,
              confirmationState: "Confirmed",
            },
          },
        };

        if (selectedIntent.slots.Day == null) {
          console.log("HEEEELLL");
          response.sessionState.dialogAction = {
            type: "ElicitSlot",
            slotToElicit: "Day",
          };
        } else if (
          selectedIntent.confirmationState &&
          selectedIntent.confirmationState === "None"
        ) {
          console.log("HEEEO");
          response.sessionState.dialogAction = {
            type: "ConfirmIntent",
          };
        } else {
          let apiUrl =
            "https://k7gf4d2487.execute-api.us-east-1.amazonaws.com/dev-get-rd/getRestaurantDetails";

          try {
            const data = await fetchDataFromAPI();
            let operationDetails = data.body.restaurant_operation_details;
            console.log(
              selectedIntent.slots.Day.value.interpretedValue,
              "hereeee"
            );
            let days = operationDetails.find((element) => {
              console.log(element, "blaaa");
              return (
                element.day == selectedIntent.slots.Day.value.interpretedValue
              );
            });
            console.log(days, "here");

            return {
              sessionState: {
                dialogAction: {
                  type: "Close",
                  fulfillmentState: "Fulfilled",
                },
                intent: {
                  confirmationState: "Confirmed",
                  name: "GetOpeningHours",
                  state: "Fulfilled",
                },
              },
              messages: [
                {
                  contentType: "PlainText",
                  content: `Opening timing : ${days.closing_time} 
                            Closing timing :  ${days.opening_time}`,
                },
              ],
            };
          } catch (err) {
            console.error("Error fetching feedback:", err);
            throw err;
          }
        }

        console.log(response);
        return response;
      } else if (selectedIntent && selectedIntent.name == "EditOpeningTime") {
        const response = {
          sessionState: {
            intent: {
              name: "EditOpeningTime",
              slots: selectedIntent.slots,
              confirmationState: "Confirmed",
            },
          },
        };

        if (selectedIntent.slots.DayOfTheWeek == null) {
          //  console.log("HEEEELLL")
          response.sessionState.dialogAction = {
            type: "ElicitSlot",
            slotToElicit: "DayOfTheWeek",
          };
        } else if (selectedIntent.slots.UpdatedOpeningTime == null) {
          //  console.log("HEEEELLL")
          response.sessionState.dialogAction = {
            type: "ElicitSlot",
            slotToElicit: "UpdatedOpeningTime",
          };
        } else {
          try {
            let getOperation = await fetchDataFromAPI();
            let operationDetails =
              getOperation.body.restaurant_operation_details;
            operationDetails.forEach((interpretation) => {
              if (
                interpretation.day ===
                selectedIntent.slots.DayOfTheWeek.value.interpretedValue
              ) {
                let numberTime =
                  selectedIntent.slots.UpdatedOpeningTime.value.interpretedValue.replace(
                    /:/g,
                    ""
                  );
                console.log(parseInt(numberTime), "hellllooooooooooooo");
                interpretation.opening_time = parseInt(numberTime);
              }
            });
            // console.log(selectedIntent.slots.UpdatedOpeningTime.value.interpretedValue)
            let req = {
              restaurant_id: "1",
              restaurant_operation_details: operationDetails,
            };

            console.log(req, "asssswell");
            const data = await updateDataFromAPI(req);
            console.log(
              selectedIntent.slots.UpdatedOpeningTime.value.interpretedValue,
              "hereeee"
            );
            return {
              sessionState: {
                dialogAction: {
                  type: "Close",
                  fulfillmentState: "Fulfilled",
                },
                intent: {
                  confirmationState: "Confirmed",
                  name: "EditOpeningTime",
                  state: "Fulfilled",
                },
              },
              messages: [
                {
                  contentType: "PlainText",
                  content: `Opening time updated succesfully`,
                },
              ],
            };
          } catch (err) {
            console.error("Error fetching feedback:", err);
            throw err;
          }
        }

        console.log(response);
        return response;
      } else if (
        selectedIntent &&
        selectedIntent.name == "EditRestaurantLocation"
      ) {
        const response = {
          sessionState: {
            intent: {
              name: "EditRestaurantLocation",
              slots: selectedIntent.slots,
              confirmationState: "Confirmed",
            },
          },
        };

        if (selectedIntent.slots.UpdatedRestaurantLocation == null) {
          //  console.log("HEEEELLL")
          response.sessionState.dialogAction = {
            type: "ElicitSlot",
            slotToElicit: "UpdatedRestaurantLocation",
          };
        } else {
          try {
            let req = {
              restaurant_id: "1",
              address:
                selectedIntent.slots.UpdatedRestaurantLocation.value
                  .interpretedValue,
            };

            console.log(req, "asssswell");
            const data = await updateDataFromAPI(req);
            //    console.log(selectedIntent.slots.UpdatedOpeningTime.value.interpretedValue, "hereeee")
            return {
              sessionState: {
                dialogAction: {
                  type: "Close",
                  fulfillmentState: "Fulfilled",
                },
                intent: {
                  confirmationState: "Confirmed",
                  name: "EditRestaurantLocation",
                  state: "Fulfilled",
                },
              },
              messages: [
                {
                  contentType: "PlainText",
                  content: `Location updated succesfully`,
                },
              ],
            };
          } catch (err) {
            console.error("Error fetching feedback:", err);
            throw err;
          }
        }

        console.log(response);
        return response;
      } else if (selectedIntent && selectedIntent.name == "GetLocationIntent") {
        // let apiUrl = "https://k7gf4d2487.execute-api.us-east-1.amazonaws.com/dev-get-rd/getRestaurantDetails"
        const data = await fetchDataFromAPI();
        let location = data.body.restaurant_location;

        return {
          sessionState: {
            dialogAction: {
              type: "Close",
              fulfillmentState: "Fulfilled",
            },
            intent: {
              confirmationState: "Confirmed",
              name: "GetLocationIntent",
              state: "Fulfilled",
            },
          },
          messages: [
            {
              contentType: "PlainText",
              content: location,
            },
          ],
        };
      } else if (selectedIntent && selectedIntent.name == "MenuAvailability") {
        let apiUrl =
          "https://k7gf4d2487.execute-api.us-east-1.amazonaws.com/dev-get-rd/getRestaurantDetails";
        const data = await fetchDataFromAPI(apiUrl);

        let foodMenu = data.body.restaurant_food_menu;
        console.log(data.body);
        let menu_available = foodMenu.filter((element) => {
          console.log(element, "blaaa");
          return element.menu_item_availability == "available";
        });
        console.log(menu_available, "here");
        let listString = "";

        menu_available.forEach((item) => {
          const listItem = `${item.menu_item_name} \n`;
          listString += listItem;
        });

        return {
          sessionState: {
            dialogAction: {
              type: "Close",
              fulfillmentState: "Fulfilled",
            },
            intent: {
              confirmationState: "Confirmed",
              name: "MenuAvailability",
              state: "Fulfilled",
            },
          },
          messages: [
            {
              contentType: "PlainText",
              content: listString,
            },
          ],
        };
      } else if (selectedIntent && selectedIntent.name == "GetReviews") {
        let restauntrantReviews = db.collection(restaurantDetails);
        let resID = "1";
        const itemQuery = restauntrantReviews.where(
          "restaurant_id",
          "==",
          resID
        );
        try {
          const itemSnapshot = await itemQuery.get();
          console.log(itemSnapshot, "please come here please");
          if (!itemSnapshot.empty) {
            // Update the item's quantity
            const itemDoc = itemSnapshot.docs[0];
            console.log(itemDoc.data(), "if item matched");
            let itemDocObj = itemDoc.data();
            feedback = itemDocObj.review;
          } else {
            console.log(`Item '${item}' not found in the collection.`);
          }
          //console.log("Some data")
          return {
            sessionState: {
              dialogAction: {
                type: "Close",
                fulfillmentState: "Fulfilled",
              },
              intent: {
                confirmationState: "Confirmed",
                name: "GetReviews",
                state: "Fulfilled",
              },
            },
            messages: [
              {
                contentType: "PlainText",
                content: feedback,
              },
            ],
          };
        } catch (err) {
          console.error("Error fetching feedback:", err);
          throw err;
        }
      } else if (selectedIntent && selectedIntent.name == "ItemReview") {
        const response = {
          sessionState: {
            intent: {
              name: "ItemReview",
              slots: selectedIntent.slots,
              confirmationState: "Confirmed",
            },
          },
        };

        if (selectedIntent.slots.FoodItem == null) {
          //console.log("PPP")
          response.sessionState.dialogAction = {
            type: "ElicitSlot",
            slotToElicit: "FoodItem",
          };
        } else {
          //   console.log("zzz")

          let item = selectedIntent.slots.FoodItem.value.interpretedValue;
          let feedback = "";
          let itemsCollection = db.collection(itemReview);
          const itemQuery = itemsCollection.where("item", "==", item);
          try {
            const itemSnapshot = await itemQuery.get();
            console.log(itemSnapshot, "please come here please");
            if (!itemSnapshot.empty) {
              // Update the item's quantity
              const itemDoc = itemSnapshot.docs[0];
              console.log(itemDoc.data(), "if item matched");
              let itemDocObj = itemDoc.data();
              feedback = itemDocObj.feedback;
            } else {
              console.log(`Item '${item}' not found in the items collection.`);
            }
            //console.log("Some data")
            return {
              sessionState: {
                dialogAction: {
                  type: "Close",
                  fulfillmentState: "Fulfilled",
                },
                intent: {
                  confirmationState: "Confirmed",
                  name: "ItemReview",
                  state: "Fulfilled",
                },
              },
              messages: [
                {
                  contentType: "PlainText",
                  content: feedback,
                },
              ],
            };
          } catch (err) {
            console.error("Error fetching feedback:", err);
            throw err;
          }

          // const querySnapshot = await query.get();
        }

        console.log(response);
        return response;
      } else if (selectedIntent && selectedIntent.name == "CancelReservation") {
        const response = {
          sessionState: {
            intent: {
              name: "CancelReservation",
              slots: selectedIntent.slots,
              confirmationState: "Confirmed",
            },
          },
        };

        if (selectedIntent.slots.ReservationID == null) {
          //console.log("PPP")
          response.sessionState.dialogAction = {
            type: "ElicitSlot",
            slotToElicit: "ReservationID",
          };
        } else {
          //   console.log("zzz")
          let cancelReservationRef = db
            .collection(restaurant_reservations)
            .doc(selectedIntent.slots.ReservationID.value.interpretedValue);
          try {
            const itemSnapshot = await cancelReservationRef.delete();

            console.log(itemSnapshot, "please come here please");
            return {
              sessionState: {
                dialogAction: {
                  type: "Close",
                  fulfillmentState: "Fulfilled",
                },
                intent: {
                  confirmationState: "Confirmed",
                  name: "CancelReservation",
                  state: "Fulfilled",
                },
              },
              messages: [
                {
                  contentType: "PlainText",
                  content: "Order cancelled succesfully",
                },
              ],
            };
          } catch (err) {
            console.error("Error fetching feedback:", err);
            throw err;
          }

          // const querySnapshot = await query.get();
        }

        console.log(response);
        return response;
      } else if (selectedIntent && selectedIntent.name == "EditReservation") {
        const response = {
          sessionState: {
            intent: {
              name: "EditReservation",
              slots: selectedIntent.slots,
              confirmationState: "Confirmed",
            },
          },
        };

        if (selectedIntent.slots.ReservationID == null) {
          console.log("PPPqqq");
          response.sessionState.dialogAction = {
            type: "ElicitSlot",
            slotToElicit: "ReservationID",
          };
        } else if (selectedIntent.slots.NewReservationDate == null) {
          console.log("PPPddddd");
          response.sessionState.dialogAction = {
            type: "ElicitSlot",
            slotToElicit: "NewReservationDate",
          };
        } else if (selectedIntent.slots.NewReservationTime == null) {
          console.log("PPPxxxx");
          response.sessionState.dialogAction = {
            type: "ElicitSlot",
            slotToElicit: "NewReservationTime",
          };
        } else {
          let updateReservationRef = db
            .collection(restaurant_reservations)
            .doc(selectedIntent.slots.ReservationID.value.interpretedValue);

          try {
            const combinedTimestamp = new Date(
              `${selectedIntent.slots.NewReservationDate.value.interpretedValue}T${selectedIntent.slots.NewReservationTime.value.interpretedValue}:00`
            );
            console.log(combinedTimestamp);
            const itemSnapshot = await updateReservationRef.update({
              end_time: combinedTimestamp,
            });
            console.log(itemSnapshot, "please come here please");
            return {
              sessionState: {
                dialogAction: {
                  type: "Close",
                  fulfillmentState: "Fulfilled",
                },
                intent: {
                  confirmationState: "Confirmed",
                  name: "EditReservation",
                  state: "Fulfilled",
                },
              },
              messages: [
                {
                  contentType: "PlainText",
                  content: "Time and Date updated succesfully",
                },
              ],
            };
          } catch (err) {
            console.error("Error fetching feedback:", err);
            throw err;
          }
        }

        console.log(response);
        return response;
      } else if (
        selectedIntent &&
        selectedIntent.name == "ReadRestaurantRating"
      ) {
        let restauntrantReviews = db.collection(restaurantDetails);
        let resID = "1";
        const itemQuery = restauntrantReviews.where(
          "restaurant_id",
          "==",
          resID
        );
        try {
          const itemSnapshot = await itemQuery.get();
          console.log(itemSnapshot, "please come here please");
          if (!itemSnapshot.empty) {
            // Update the item's quantity
            const itemDoc = itemSnapshot.docs[0];
            console.log(itemDoc.data(), "if item matched");
            let itemDocObj = itemDoc.data();
            feedback = itemDocObj.rating;
          } else {
            //console.log(`Item '${item}' not found in the collection.`);
          }
          //console.log("Some data")
          return {
            sessionState: {
              dialogAction: {
                type: "Close",
                fulfillmentState: "Fulfilled",
              },
              intent: {
                confirmationState: "Confirmed",
                name: "ReadRestaurantRating",
                state: "Fulfilled",
              },
            },
            messages: [
              {
                contentType: "PlainText",
                content: feedback,
              },
            ],
          };
        } catch (err) {
          console.error("Error fetching feedback:", err);
          throw err;
        }
      }
    }
  } catch (err) {
    console.error(err);
    // Handle the error if necessary
  }

  // If no valid response is generated, return a default response
  return {
    dialogAction: {
      type: "ElicitIntent",
      message: {
        contentType: "PlainText",
        content:
          "I'm sorry, I couldn't understand your request. Can you please try again?",
      },
    },
  };
};
