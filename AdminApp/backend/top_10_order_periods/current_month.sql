SELECT
  'CurrentMonth' AS Current_Month,
  COUNT(*) AS Order_Count
FROM
  `serverless-401215.firestore_export.sagar_orders_raw_latest`
WHERE
  EXTRACT(MONTH FROM TIMESTAMP_SECONDS(CAST(JSON_EXTRACT_SCALAR(data, '$.ordered_at._seconds') AS INT64))) = EXTRACT(MONTH FROM CURRENT_DATE());
