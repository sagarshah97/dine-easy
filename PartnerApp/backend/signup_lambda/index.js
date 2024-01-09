const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  try {
    const { restaurant_email, 
            restaurant_id,  
            restaurant_description, 
            restaurant_name} = event;
    
    const restaurantDetails = {
      restaurant_id,
      restaurant_email,
      restaurant_status: "Open",
      restaurant_food_menu: null,
      restaurant_offers: null,
      restaurant_description,
      restaurant_location: null,
      restaurant_name,
      restaurant_operation_details: null,
      table_details: null
    };

    // Add restaurant details to DynamoDB
    await addRestaurantDetailsToDatabase(restaurantDetails);

    const insertedValues = await getInsertedValuesFromDatabase(restaurant_id);

    // Return the retrieved values
    return {
      statusCode: 200,
      body: insertedValues
    };
  } catch (error) {
    // Handle any errors that occur during the execution
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};

// Function to add restaurant details to DynamoDB
const addRestaurantDetailsToDatabase = async (restaurantDetails) => {
  const params = {
    TableName: 'namesofrestaurants',
    Item: restaurantDetails
  };

  await dynamoDB.put(params).promise();
};

// Function to retrieve inserted/updated values from DynamoDB
const getInsertedValuesFromDatabase = async (restaurant_id) => {
  const params = {
    TableName: 'namesofrestaurants',
    Key: { restaurant_id: restaurant_id }
  };

  const result = await dynamoDB.get(params).promise();
  return result.Item;
};