import https from 'https';

export const handler = async (event) => {
  try {
    console.log("Received event:");
    console.log(JSON.stringify(event, null, 2));

    if (event && event['interpretations'] && event['interpretations'].length > 0) {
      const interpretations = event['interpretations'];
      let highestConfidence = -1;
      let selectedIntent = null;

      interpretations.forEach((interpretation) => {
        if (interpretation.intent && interpretation.nluConfidence > highestConfidence) {
          highestConfidence = interpretation.nluConfidence;
          selectedIntent = interpretation.intent.name;
        }
      });

      const apiUrl = 'https://i6morut7a6.execute-api.us-east-1.amazonaws.com/restaurantdetails/restaurants';

      if (selectedIntent) {
        console.log(selectedIntent);
        switch (selectedIntent) {
          case "helpIntentCommon":
            return {
              sessionState: {
                dialogAction: {
                  type: "Close",
                  fulfillmentState: "Fulfilled",
                },
                intent: {
                  confirmationState: "Confirmed",
                  name: selectedIntent, 
                  state: "Fulfilled",
                },
              },
              messages: [
                {
                  contentType: "PlainText",
                  content: "How may I help you?",
                },
              ],
            };
            
          case "GetAllRestaurants":
            console.log("URL:::::", apiUrl);

            
            const data = await fetchDataFromAPI(apiUrl);
            console.log("DATA:::>>>>", data);

            
            const restaurantNames = extractRestaurantNames(data);
            console.log("Restaurant Names:", restaurantNames);

           
            return createResponse(selectedIntent, restaurantNames);

          case "FindRestaurantLocationIntent":

            const transcription = event.interpretations[0];
            var interpretedValue = null;

            if (transcription) {
              console.log(event.interpretations[0]);
              interpretedValue = transcription.intent.slots.RestaurantName.value.interpretedValue;
              console.log("Interpreted Value:", interpretedValue);
            }

            
            const locationData = await fetchDataFromAPI(apiUrl);
            console.log("Location Data:::>>>>", locationData);


            const locationInfo = extractLocationInfo(locationData, interpretedValue);
            console.log("Location Info:", locationInfo);

            
            return createLocationResponse(selectedIntent, locationInfo);

          case "FindRestaurantOpeningHoursIntent":
            
            const hours = event.interpretations[0];
            var interpretedValue = null;

            if (hours) {
              console.log(event.interpretations[0]);
              interpretedValue = hours.intent.slots.RestaurantName.value.interpretedValue;
              console.log("Interpreted Value:", interpretedValue);
            }
            
            const openingHoursData = await fetchDataFromAPI(apiUrl);
            console.log("Opening Hours Data:::>>>>", openingHoursData);

            
            const openingHoursInfo = extractOpeningHoursInfo(openingHoursData, interpretedValue);
            console.log("Opening Hours Info:", openingHoursInfo);

            
            return createOpeningHoursResponse(selectedIntent, openingHoursInfo);

          case "FindMenuAvailabilityIntent":
            
            const menu = event.interpretations[0];
            var interpretedValue = null;

            if (menu) {
              console.log(event.interpretations[0]);
              interpretedValue = menu.intent.slots.RestaurantName.value.interpretedValue;
              console.log("Interpreted Value:", interpretedValue);
            }
            
            const menuData = await fetchDataFromAPI(apiUrl);
            console.log("Menu Data:::>>>>", menuData);

            
            const menuAvailability = extractMenuAvailability(menuData, interpretedValue);
            console.log("Menu Availability:", menuAvailability);

            
            return createMenuAvailabilityResponse(selectedIntent, menuAvailability);

          default:
            return createUnknownIntentResponse();

            case "GetReservationAvailability":
              const reservationAvailabilityData = await fetchDataFromAPI(apiUrl);
              console.log("Reservation Availability Data:::>>>>", reservationAvailabilityData);
            
              const reservationAvailability = extractReservationAvailability(reservationAvailabilityData, interpretedValue);
              console.log("Reservation Availability:", reservationAvailability);
            
              return createReservationAvailabilityResponse(selectedIntent, reservationAvailability);
            
            case "ProvideRestaurantReview":
              
              const reviewData = event.interpretations[0];
              const review = reviewData.intent.slots.RestaurantReview.value.interpretedValue;
            
              await saveReviewToAPI(apiUrl, interpretedValue, review);
            
              return {
                sessionState: {
                  dialogAction: {
                    type: "Close",
                    fulfillmentState: "Fulfilled",
                  },
                  intent: {
                    confirmationState: "Confirmed",
                    name: "ProvideRestaurantReview",
                    state: "Fulfilled",
                  },
                },
                messages: [
                  {
                    contentType: "PlainText",
                    content: "Thank you for providing a review for the restaurant.",
                  },
                ],
              };
            
            case "ProvideMenuReview":
              const menuReviewData = event.interpretations[0];
              const menuReview = menuReviewData.intent.slots.MenuReview.value.interpretedValue;
            
              await saveMenuReviewToAPI(apiUrl, interpretedValue, menuReview);
            
              return {
                sessionState: {
                  dialogAction: {
                    type: "Close",
                    fulfillmentState: "Fulfilled",
                  },
                  intent: {
                    confirmationState: "Confirmed",
                    name: "ProvideMenuReview",
                    state: "Fulfilled",
                  },
                },
                messages: [
                  {
                    contentType: "PlainText",
                    content: "Thank you for providing a review for the menu item.",
                  },
                ],
              };
            
            case "ProvideRestaurantRating":
              const ratingData = event.interpretations[0];
              const rating = parseInt(ratingData.intent.slots.RestaurantRating.value.interpretedValue);
            
              await saveRatingToAPI(apiUrl, interpretedValue, rating);
            
              return {
                sessionState: {
                  dialogAction: {
                    type: "Close",
                    fulfillmentState: "Fulfilled",
                  },
                  intent: {
                    confirmationState: "Confirmed",
                    name: "ProvideRestaurantRating",
                    state: "Fulfilled",
                  },
                },
                messages: [
                  {
                    contentType: "PlainText",
                    content: `Thank you for providing a rating of ${rating} for the restaurant.`,
                  },
                ],
              };
            
            case "BookReservation":
              const reservationDetailsData = event.interpretations[0];
              const reservationDetails = reservationDetailsData.intent.slots.ReservationDetails.value.interpretedValue;
            
              await bookReservation(apiUrl, interpretedValue, reservationDetails);
            
              return {
                sessionState: {
                  dialogAction: {
                    type: "Close",
                    fulfillmentState: "Fulfilled",
                  },
                  intent: {
                    confirmationState: "Confirmed",
                    name: "BookReservation",
                    state: "Fulfilled",
                  },
                },
                messages: [
                  {
                    contentType: "PlainText",
                    content: `Your reservation for ${interpretedValue} has been booked. Details: ${reservationDetails}`,
                  },
                ],
              };
            
            case "BookReservationWithMenuItems":
              const reservationWithMenuItemsData = event.interpretations[0];
              const reservationWithMenuItems = reservationWithMenuItemsData.intent.slots.ReservationWithMenuItems.value.interpretedValue;
            
              await bookReservationWithMenuItems(apiUrl, interpretedValue, reservationWithMenuItems);
            
              return {
                sessionState: {
                  dialogAction: {
                    type: "Close",
                    fulfillmentState: "Fulfilled",
                  },
                  intent: {
                    confirmationState: "Confirmed",
                    name: "BookReservationWithMenuItems",
                    state: "Fulfilled",
                  },
                },
                messages: [
                  {
                    contentType: "PlainText",
                    content: `Your reservation for ${interpretedValue} with menu items has been booked. Details: ${reservationWithMenuItems}`,
                  },
                ],
              };
        }
      }
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

async function fetchDataFromAPI(apiUrl) {
  return new Promise((resolve, reject) => {
    https.get(apiUrl, (response) => {
      console.log(">>>> " + response);
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP Status Code ${response.statusCode}`));
        return;
      }

      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        resolve(data);
      });

      response.on('error', (error) => {
        reject(error);
      });
    });
  });
}

function extractRestaurantNames(data) {
  try {
    
    const jsonData = JSON.parse(data);
    console.log("get json data now after parsing");
    console.log(jsonData.body);

    var array = JSON.parse(jsonData.body);
    console.log("<<< " + array.length);
    var restaurantNames = [];
    for (var i = 0; i < array.length; i++) {
      if (array[i]["restaurant_name"])
        restaurantNames.push(array[i]["restaurant_name"].S);
    }

    return restaurantNames;
  } catch (error) {
    console.error("Error extracting restaurant names:", error);
    return [];
  }
}

function extractLocationInfo(data, interpretedValue) {
  try {
    const jsonData = JSON.parse(data);
    const restaurantData = JSON.parse(jsonData.body);

    const length = restaurantData.length;
    console.log("length: " + length);

    const locationInfos = [];
    for (var i = 0; i < length; i++) {
      const restaurant = restaurantData[i];
      const location = restaurant.restaurant_location.S;
      const name = restaurant.restaurant_name.S;
      console.log(interpretedValue, name);
      if (name.toLowerCase() !== interpretedValue.toLowerCase())
        continue;
      const restaurant_operation_details = restaurant.restaurant_operation_details.L;
      const operationDetailsLength = restaurant_operation_details.length;
      const operationDetails = [];

      for (var j = 0; j < operationDetailsLength; j++) {
        const operationDetail = restaurant_operation_details[j];
        const day = operationDetail.M.day.S;
        const openingTime = operationDetail.M.opening_time.N;
        const closingTime = operationDetail.M.closing_time.N;
        operationDetails.push({ day, openingTime, closingTime });
      }

      locationInfos.push({ name, location, operationDetails });
    }

    return locationInfos;
  } catch (error) {
    console.error("Error extracting restaurant location information:", error);
    return [];
  }
}

function extractOpeningHoursInfo(data, interpretedValue) {
  try {
    const jsonData = JSON.parse(data);
    const restaurantData = JSON.parse(jsonData.body);

    const length = restaurantData.length;
    console.log("length: " + length);

    const openingHoursInfo = [];

    for (var i = 0; i < length; i++) {
      const restaurant = restaurantData[i];
      const name = restaurant.restaurant_name.S;
      console.log(interpretedValue, name);
      if (name.toLowerCase() !== interpretedValue.toLowerCase())
        continue;
      const restaurant_operation_details = restaurant.restaurant_operation_details.L;
      const operationDetailsLength = restaurant_operation_details.length;
      const operationDetails = [];

      for (var j = 0; j < operationDetailsLength; j++) {
        const operationDetail = restaurant_operation_details[j];
        const day = operationDetail.M.day.S;
        const openingTime = operationDetail.M.opening_time.N;
        const closingTime = operationDetail.M.closing_time.N;
        operationDetails.push({ day, openingTime, closingTime });
      }

      openingHoursInfo.push({ name, operationDetails });
    }

    return openingHoursInfo;
  } catch (error) {
    console.error("Error extracting restaurant opening hours information:", error);
    return [];
  }
}
function extractMenuAvailability(data, interpretedValue) {
  try {
    const jsonData = JSON.parse(data);
    const restaurantData = JSON.parse(jsonData.body);

    const length = restaurantData.length;
    console.log("length: " + length);

    const menuAvailability = [];

    for (var i = 0; i < length; i++) {
      const restaurant = restaurantData[i];
      const name = restaurant.restaurant_name.S;
      console.log(interpretedValue, name);
      if (name.toLowerCase() !== interpretedValue.toLowerCase())
        continue;
      const restaurant_food_menu = restaurant.restaurant_food_menu.L;
      const menuLength = restaurant_food_menu.length;
      const menu = [];

      for (var j = 0; j < menuLength; j++) {
        const menuItem = restaurant_food_menu[j];
        const menuItemName = menuItem.M.menu_item_name.S;
        const menuItemAvailability = menuItem.M.menu_item_availability.S;
        menu.push({ name: menuItemName, availability: menuItemAvailability });
      }

      menuAvailability.push({ name, menu });
    }

    return menuAvailability;
  } catch (error) {
    console.error("Error extracting menu availability information:", error);
    return [];
  }
}

function createResponse(intentName, restaurantNames) {
  return {
    sessionState: {
      dialogAction: {
        type: "Close",
        fulfillmentState: "Fulfilled",
      },
      intent: {
        confirmationState: "Confirmed",
        name: intentName,
        state: "Fulfilled",
      },
    },
    messages: [
      {
        contentType: "PlainText",
        content: "Sure, here are the restaurant names:\n" + restaurantNames.join(", "),
      },
    ],
  };
}

function createLocationResponse(intentName, locationInfo) {
  let responseText = "Here are the restaurant locations and opening times:\n";

  locationInfo.forEach(restaurant => {
    responseText += `\n${restaurant.name}:\n`;
    responseText += `Location: ${restaurant.location}\n`;

    responseText += "Opening Times:\n";
    restaurant.operationDetails.forEach(day => {
      responseText += `${day.day}: ${formatTime(day.openingTime)} - ${formatTime(day.closingTime)}\n`;
    });
  });

  return {
    sessionState: {
      dialogAction: {
        type: "Close",
        fulfillmentState: "Fulfilled",
      },
      intent: {
        confirmationState: "Confirmed",
        name: intentName,
        state: "Fulfilled",
      },
    },
    messages: [
      {
        contentType: "PlainText",
        content: responseText,
      },
    ],
  };
}

function createOpeningHoursResponse(intentName, openingHoursInfo) {
  let responseText = "Here are the restaurant opening hours:\n";

  openingHoursInfo.forEach(restaurant => {
    responseText += `\n${restaurant.name}:\n`;
    responseText += "Opening Hours:\n";
    restaurant.operationDetails.forEach(day => {
      responseText += `${day.day}: ${formatTime(day.openingTime)} - ${formatTime(day.closingTime)}\n`;
    });
  });

  return {
    sessionState: {
      dialogAction: {
        type: "Close",
        fulfillmentState: "Fulfilled",
      },
      intent: {
        confirmationState: "Confirmed",
        name: intentName,
        state: "Fulfilled",
      },
    },
    messages: [
      {
        contentType: "PlainText",
        content: responseText,
      },
    ],
  };
}

function createMenuAvailabilityResponse(intentName, menuAvailability) {
  let responseText = "Here is the menu availability:\n";

  menuAvailability.forEach(restaurant => {
    responseText += `\n${restaurant.name}:\n`;
    responseText += "Menu Availability:\n";
    restaurant.menu.forEach(item => {
      responseText += `${item.name}: ${item.availability}\n`;
    });
  });

  return {
    sessionState: {
      dialogAction: {
        type: "Close",
        fulfillmentState: "Fulfilled",
      },
      intent: {
        confirmationState: "Confirmed",
        name: intentName,
        state: "Fulfilled",
      },
    },
    messages: [
      {
        contentType: "PlainText",
        content: responseText,
      },
    ],
  };
}

async function extractReservationAvailability(data, interpretedValue) {
  try {
    const jsonData = JSON.parse(data);
    const reservationData = JSON.parse(jsonData.body);

    const length = reservationData.length;
    console.log("length: " + length);

    const reservationAvailability = [];

    for (var i = 0; i < length; i++) {
      const reservation = reservationData[i];
      const name = reservation.restaurant_name.S;
      console.log(interpretedValue, name);
      if (name.toLowerCase() !== interpretedValue.toLowerCase())
        continue;
      const availability = reservation.reservation_availability.S;
      reservationAvailability.push({ name, availability });
    }

    return reservationAvailability;
  } catch (error) {
    console.error("Error extracting reservation availability information:", error);
    return [];
  }
}

async function saveReviewToAPI(apiUrl, restaurantName, review) {
  try {
    const requestBody = {
      restaurantName: restaurantName,
      review: review,
    };

    return await postDataToAPI(apiUrl, requestBody);
  } catch (error) {
    console.error("Error saving restaurant review to API:", error);
    throw error;
  }
}

async function saveMenuReviewToAPI(apiUrl, menuItemName, menuReview) {
  try {
    const requestBody = {
      menuItemName: menuItemName,
      menuReview: menuReview,
    };

    return await postDataToAPI(apiUrl, requestBody);
  } catch (error) {
    console.error("Error saving menu item review to API:", error);
    throw error;
  }
}

async function postDataToAPI(apiUrl, requestBody) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(apiUrl, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve(data);
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify(requestBody));
    req.end();
  });
}

async function saveRatingToAPI(apiUrl, restaurantName, rating) {
  try {
    const requestBody = {
      restaurantName: restaurantName,
      rating: rating,
    };

    return await postDataToAPI(apiUrl, requestBody);
  } catch (error) {
    console.error("Error saving restaurant rating to API:", error);
    throw error;
  }
}

async function bookReservation(apiUrl, restaurantName, reservationDetails) {
  try {
    const requestBody = {
      restaurantName: restaurantName,
      reservationDetails: reservationDetails,
    };

    return await postDataToAPI(apiUrl, requestBody);
  } catch (error) {
    console.error("Error booking reservation and saving details to API:", error);
    throw error;
  }
}

async function bookReservationWithMenuItems(apiUrl, restaurantName, reservationWithMenuItems) {
  try {
    const requestBody = {
      restaurantName: restaurantName,
      reservationWithMenuItems: reservationWithMenuItems,
    };

    return await postDataToAPI(apiUrl, requestBody);
  } catch (error) {
    console.error("Error booking reservation with menu items and saving details to API:", error);
    throw error;
  }
}

function createUnknownIntentResponse() {
  return {
  };
}

function formatTime(timeStr) {
  const time = parseInt(timeStr, 10);
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  return `${hours}:${minutes}`;
}