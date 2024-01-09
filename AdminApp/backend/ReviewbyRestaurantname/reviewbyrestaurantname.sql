SELECT   JSON_EXTRACT_SCALAR(data, '$.restaurant_name') AS Restaurant,  
JSON_EXTRACT_SCALAR(data, '$.rating') AS Rating,
JSON_EXTRACT_SCALAR(data, '$.review') AS Review
 FROM `serverless-401215.reviewbyrestaurant.reviewtable_raw_latest`
 GROUP BY  name, review  LIMIT 
1000
