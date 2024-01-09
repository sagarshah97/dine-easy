process.env.TZ = "America/Halifax";

const AWS = require("aws-sdk");
const S3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const tableName = "restaurants";
  const restaurantId = event.restaurant_id;
  const tableDetails = event.table_details;
  const operationDetails = event.restaurant_operation_details;
  const status = event.status;
  const restaurantFoodMenu = event.restaurant_food_menu;
  const restaurantImageBase64 = event.restaurant_image;
  const address = event.address;

  // Check if any update parameters are provided
  if (
    tableDetails ||
    operationDetails ||
    status ||
    restaurantFoodMenu ||
    restaurantImageBase64 ||
    address
  ) {
    // Prepare the update expression and attribute values
    let updateExpression = "SET";
    const expressionAttributeValues = {};

    // Handle tableDetails parameter
    if (tableDetails) {
      updateExpression += " table_details = :tableDetails";
      expressionAttributeValues[":tableDetails"] = tableDetails;
    }

    // Handle operationDetails parameter
    if (operationDetails) {
      updateExpression +=
        (updateExpression !== "SET" ? "," : "") +
        " restaurant_operation_details = :operationDetails";
      expressionAttributeValues[":operationDetails"] = operationDetails;
    }

    // Handle status parameter
    if (status) {
      updateExpression +=
        (updateExpression !== "SET" ? "," : "") +
        " restaurant_status = :status";
      expressionAttributeValues[":status"] = status;
    }

    if (address) {
      updateExpression +=
        (updateExpression !== "SET" ? "," : "") +
        " restaurant_location = :address";
      expressionAttributeValues[":address"] = address;
    }

    if (restaurantImageBase64) {
      // Decode base64 string to buffer
      const imageBuffer = Buffer.from(restaurantImageBase64, "base64");

      // Create a unique filename for the S3 object
      const filename = `${restaurantId}_${Date.now()}.jpeg`;

      // Set S3 parameters
      const s3Params = {
        Bucket: "imagesofrestaurants-sagar",
        Key: filename,
        Body: imageBuffer,
        ContentType: "image/jpeg",
        ACL: "public-read",
      };

      // Upload the image to S3
      const s3UploadResponse = await S3.upload(s3Params).promise();

      // Get the public URL of the uploaded image
      const imageURL = s3UploadResponse.Location;

      // Update the imageURL in DynamoDB
      expressionAttributeValues[":img"] = imageURL;
      updateExpression += `${updateExpression !== "SET" ? "," : ""} img = :img`;
    }

    // Prepare the update params
    const params = {
      TableName: tableName,
      Key: {
        restaurant_id: restaurantId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };

    try {
      // Execute the update
      const updatedData = await dynamodb.update(params).promise();
      return {
        statusCode: 200,
        body: updatedData.Attributes,
      };
    } catch (error) {
      console.error("Error:", error);
      return {
        statusCode: 500,
        body: { message: "Internal Server Error" },
      };
    }
  } else {
    // No update parameters provided.
    return {
      statusCode: 400,
      body: { message: "No update parameters provided" },
    };
  }
};
