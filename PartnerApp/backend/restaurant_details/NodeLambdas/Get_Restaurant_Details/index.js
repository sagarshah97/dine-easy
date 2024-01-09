process.env.TZ = "America/Halifax";

const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const restaurantId = event.restaurant_id;

  const params = {
    TableName: "restaurants",
    Key: {
      restaurant_id: restaurantId,
    },
  };

  try {
    const data = await dynamodb.get(params).promise();
    if (data.Item) {
      return {
        statusCode: 200,
        body: data.Item,
      };
    } else {
      return {
        statusCode: 404,
        body: { message: "Restaurant not found" },
      };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: { message: "Internal Server Error" },
    };
  }
};
