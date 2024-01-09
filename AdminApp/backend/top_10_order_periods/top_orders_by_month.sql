SELECT
  FORMAT_DATE('%B', TIMESTAMP_SECONDS(CAST(JSON_EXTRACT_SCALAR(data, '$.ordered_at._seconds') AS INT64))) AS Month,
  COUNT(*) AS Order_Count
FROM
  `serverless-401215.firestore_export.sagar_orders_raw_latest`
GROUP BY
  Month
ORDER BY
  EXTRACT(MONTH FROM TIMESTAMP_SECONDS(CAST(JSON_EXTRACT_SCALAR(MAX(data), '$.ordered_at._seconds') AS INT64))) DESC
