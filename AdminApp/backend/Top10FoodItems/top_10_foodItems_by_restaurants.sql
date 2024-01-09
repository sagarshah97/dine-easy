WITH orders_data AS (
  SELECT
    JSON_EXTRACT_SCALAR(data, '$.order_id') AS order_id,
    JSON_EXTRACT_SCALAR(data, '$.customerName') AS customer_name,
    JSON_EXTRACT_SCALAR(data, '$.restaurant_id') AS restaurant_id,
    JSON_EXTRACT_SCALAR(data, '$.restaurant_name') AS restaurant_name,
    ARRAY(
      SELECT 
        STRUCT(
          JSON_EXTRACT_SCALAR(menu_item, '$.menu_item_id.S') AS menu_item_id,
          JSON_EXTRACT_SCALAR(menu_item, '$.menu_item_name.S') AS menu_item_name
        )
      FROM UNNEST(JSON_EXTRACT_ARRAY(data, '$.order_items')) AS menu_item
    ) AS menu_items
  FROM
    `serverless-401215.firestore_restaurants.orders_raw_latest`
)

SELECT
  restaurant_name,
  menu_item.menu_item_name AS menu_item_name,
  COUNT(*) AS total_orders
FROM
  orders_data,
  UNNEST(menu_items) AS menu_item
GROUP BY
  restaurant_id, restaurant_name, menu_item.menu_item_id, menu_item.menu_item_name
ORDER BY
  restaurant_id, total_orders DESC;
