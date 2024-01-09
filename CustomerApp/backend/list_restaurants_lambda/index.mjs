import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

export const handler = async (event) => {
  const dynamodb = new DynamoDBClient();
  const tableName = "namesofrestaurants";

  try {
    const scanCommand = new ScanCommand({
      TableName: tableName,
    });

    const response = await dynamodb.send(scanCommand);

    if ("Items" in response) {
      const restaurantData = response.Items.map((item) => {
        return item;
      });

      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      };
      const responseBody = JSON.stringify(restaurantData);
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: responseBody,
      };
    } else {
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      };
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: "No items found",
      };
    }
  } catch (error) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    };
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: `Error: ${error.message}`,
    };
  }
};
