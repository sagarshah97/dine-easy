WITH WeeklyOrders AS (
  SELECT
    DATE_TRUNC(DATE(TIMESTAMP_SECONDS(CAST(JSON_EXTRACT_SCALAR(data, '$.ordered_at._seconds') AS INT64))), WEEK) AS week_start,
    COUNT(*) AS order_count
  FROM
    `serverless-401215.firestore_export.sagar_orders_raw_latest`
  WHERE
    EXTRACT(MONTH FROM TIMESTAMP_SECONDS(CAST(JSON_EXTRACT_SCALAR(data, '$.ordered_at._seconds') AS INT64))) = EXTRACT(MONTH FROM CURRENT_DATE())
      AND EXTRACT(YEAR FROM TIMESTAMP_SECONDS(CAST(JSON_EXTRACT_SCALAR(data, '$.ordered_at._seconds') AS INT64))) = EXTRACT(YEAR FROM CURRENT_DATE())
  GROUP BY
    week_start
  HAVING
    week_start < DATE_ADD(DATE_TRUNC(CURRENT_DATE(), MONTH), INTERVAL 1 MONTH)
)

SELECT
  CONCAT(
    FORMAT_DATE('%Y-%m-%d', DATE(week_start)),
    ' - ',
    FORMAT_DATE('%Y-%m-%d', DATE_ADD(DATE(week_start), INTERVAL 6 DAY))
  ) AS week_range,
  order_count
FROM
  WeeklyOrders
ORDER BY
  week_start;
