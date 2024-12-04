# DINEASY
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![MUI](https://img.shields.io/badge/MUI-%230081CB.svg?style=for-the-badge&logo=mui&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![AWS](https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-web-services&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)

![Version](https://img.shields.io/badge/version-0.1.0-80b918)
![Pipeline](https://img.shields.io/badge/pipeline-passing-80b918)
![ReactVersion](https://img.shields.io/badge/react-v18.3-f6bd60)
![NodeVersion](https://img.shields.io/badge/node-v16.2-f6bd60)




DinEasy harnesses the capabilities of Google Cloud Platform (GCP) and Amazon Web Services (AWS) serverless architecture. This comprehensive platform offers an array of features tailored to enhance the reservation process. The Customer App provides a seamless experience for guests, allowing them to effortlessly reserve tables, access real-time availability, make special requests, and receive timely confirmation notifications. The Partner App equips restaurant staff with tools to efficiently manage bookings, update availability, set menu items and prices, and engage with customers for a holistic view of reservations. Meanwhile, the Admin App provides super admins with oversight of application usage, comprehensive data analytics, and management capabilities to ensure the smooth functioning of the platform. Each component is intricately designed to optimize the reservation journey, ensuring an intuitive user interface, real-time updates, and robust security measures.

## Contributors

- Sagar Shah
- Aniketh Kazi
- Dharven Doshi
- Dhrumil Gosaliya
- Kainat Khan

## App Components

- Customer App: This app will be used by the customers to book restaurants.
- Partner App: The restaurants will use this app to get to know about the bookings.
- Admin App: This app will be used by the super admins to get to know the usage of the application.

## Key Layers and Services

- Frontend: A responsive web application built using any React.js and MUI.
- Backend Services: Serverless functions for handling reservations, notifications, and analytics.
- Database: Cloud-based database for storing reservation data. Dynamic content for the entire project is built using Firestore, and the static content is stored in the AWS DynamoDB. The restaurant & menu images are stored in Amazon S3 buckets.
- Authentication: Firebase Authentication.
- APIs: Amazon API Gateway for managing RESTful APIs.
- Data Visualization: Looker Studio embedded views on the React.js app and is dynamic in nature. The data is integrated and brought in from the Firebase database utilizing BigQuery.

## Deployment

- Employed a CloudFormation template to orchestrate the provisioning of entire cloud resources, encompassing a suite of five Lambda functions for the CRUD operations and a single API Gateway featuring distinct API endpoints for each lambda. This template will help in spinning up the environment in minimal time with the required resources in any AWS account.
- Hosted all the lambda codes in the S3 bucket which can be directly used by the CloudFormation template to provision the lambdas.
- Leveraged an API Key-based API Gateway to bolster data security in transit, fortifying the overall system's robustness. API Key ensures that no other party can access the request body data without the appropriate key.
- Taken measures to safeguard Personally Identifiable Information (PII) by encrypting user data within the Firestore Database, enhancing data protection by rendering it infeasible to access sensitive information at rest.

### URLs

- Customer App URL: `https://test-volx6e7mpq-uc.a.run.app`
- Partner App URL: `https://partners-app-volx6e7mpq-uc.a.run.app`
- Admin App URL: `https://admin-app-volx6e7mpq-uc.a.run.app/`

### Credentials For Admin App

- Username: `admin@dineasy.com`
- Password: `adminadmin`

## References

- [AWS Services](https://aws.amazon.com/)
- [AWS Lambda](https://aws.amazon.com/pm/lambda/)
- [AWS API Gateway](https://aws.amazon.com/api-gateway/)
- [Cloud Object Storage - Amazon S3](https://aws.amazon.com/pm/serv-s3)
- [Amazon DynamoDB](https://aws.amazon.com/pm/dynamodb)
- [Amazon Simple Notification Service](https://aws.amazon.com/sns/)
- [Google Cloud Platform](https://console.cloud.google.com/)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [React](https://react.dev/)
- [Material UI](https://mui.com/)
