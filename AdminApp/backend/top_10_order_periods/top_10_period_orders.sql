SELECT
  CONCAT(
    FORMAT_DATETIME('%H', TIMESTAMP_SECONDS(CAST(JSON_EXTRACT_SCALAR(data, '$.ordered_at._seconds') AS INT64))),
    ':00 - ',
    FORMAT_DATETIME(
      '%H',
      TIMESTAMP_ADD(
        TIMESTAMP_SECONDS(CAST(JSON_EXTRACT_SCALAR(data, '$.ordered_at._seconds') AS INT64)),
        INTERVAL 1 HOUR
      )
    ),
    ':00'
  ) AS Time_Range,
  COUNT(*) AS Order_Count
FROM
  `serverless-401215.firestore_export.sagar_orders_raw_latest`
GROUP BY
  Time_Range
ORDER BY
  Time_Range
LIMIT 10

-- Following is adjusted for Halifax Time Zone

SELECT
  CONCAT(
    FORMAT_DATETIME(
      '%H',
      TIMESTAMP_ADD(
        TIMESTAMP_SECONDS(CAST(JSON_EXTRACT_SCALAR(data, '$.ordered_at._seconds') AS INT64)),
        INTERVAL -4 HOUR  -- Adjusted for America/Halifax (UTC-4)
      )
    ),
    ':00 - ',
    FORMAT_DATETIME(
      '%H',
      TIMESTAMP_ADD(
        TIMESTAMP_SECONDS(CAST(JSON_EXTRACT_SCALAR(data, '$.ordered_at._seconds') AS INT64)),
        INTERVAL -3 HOUR  -- Adjusted for America/Halifax (UTC-3)
      )
    ),
    ':00'
  ) AS Time_Range,
  COUNT(*) AS Order_Count
FROM
  `serverless-401215.firestore_export.food_orders_raw_latest`
GROUP BY
  Time_Range
ORDER BY
  Time_Range
LIMIT 10;
