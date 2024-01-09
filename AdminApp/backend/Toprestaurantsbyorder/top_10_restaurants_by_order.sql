SELECT
  JSON_EXTRACT_SCALAR(data, '$.restaurant_name') AS Restaurant_Name,
  COUNT(*) AS Order_Count
FROM
  `serverless-401215.firestore_restaurants.orders_raw_latest`
WHERE
  JSON_EXTRACT_SCALAR(data, '$.restaurant_name') IS NOT NULL
GROUP BY
  Restaurant_Name
ORDER BY
  Order_Count DESC
LIMIT 10