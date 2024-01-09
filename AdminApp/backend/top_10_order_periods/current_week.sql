SELECT
  'CurrentWeek' AS Current_Week,
  COUNT(*) AS Order_Count
FROM
  `serverless-401215.firestore_export.sagar_orders_raw_latest`
WHERE
  DATE_TRUNC(DATE(TIMESTAMP_SECONDS(CAST(JSON_EXTRACT_SCALAR(data, '$.ordered_at._seconds') AS INT64))), WEEK) = DATE_TRUNC(CURRENT_DATE(), WEEK);
