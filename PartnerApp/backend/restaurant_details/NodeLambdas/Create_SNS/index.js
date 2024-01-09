const AWS = require("aws-sdk");
const sns = new AWS.SNS();
const iam = new AWS.IAM();

exports.handler = async (event, context) => {
  try {
    const email = event.email;

    // Convert the email address to a valid SNS topic name
    const topicName = email.replace(/[^a-zA-Z0-9_-]/g, "_");

    // Create SNS topic
    const createTopicParams = {
      Name: topicName,
    };

    const createTopicResponse = await sns
      .createTopic(createTopicParams)
      .promise();

    const snsTopicArn = createTopicResponse.TopicArn;

    // Create SNS subscription
    const subscribeParams = {
      Protocol: "email",
      TopicArn: snsTopicArn,
      Endpoint: email,
    };

    const subscriptionArn = await sns.subscribe(subscribeParams).promise();

    console.log(
      "Subscription created successfully. Subscription ARN:",
      subscriptionArn
    );

    return {
      statusCode: 200,
      body: "Subscription created successfully.",
    };
  } catch (error) {
    console.error("Error creating subscription:", error);
    return {
      statusCode: 500,
      body: "Error creating subscription.",
    };
  }
};
