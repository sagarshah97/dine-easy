# DINE EASY (Customer App) - Backend

This folder contains all the backend code for e.g.: Lambdas, Cloud Functions etc.

## API Specifications

- Base URL: `https://skupl1q3db.execute-api.us-east-1.amazonaws.com`
- The API endpoint (base URL) can also be found at `CustomerApp/frontend/.env`

### restaurant_reservation_lambdas

The following are the event body JSONs that each lambda will expect in the request body to function as expected:

> `create_reservation`

- API Path: `/dev-create/createReservation`

```JSON
{
  body: {
    tableNumber: 4,
    tableCapacity: 2,
    startTime: "2023-10-31 12:00:00",
    endTime: "2023-10-31 12:59:00",
    timezone: "America/Halifax",
    customerId: "user003",
    customerName: "Ryan Doe",
    customerEmail: "ryan@doe.com",
    restaurantId: "res003",
    restaurantName: "Oysters and Shells",
  },
}

```

> `update_reservation`

- API Path: `/dev-update/updateReservation`

```JSON
{
  body: {
    reservationId: "XrB0kRiGC5loepavoaZk",
    newReservationData: {
      tableNumber: 1,
      tableCapacity: 2,
      startTime: "2023-10-26 15:00:00",
      endTime: "2023-10-26 15:59:00",
      timezone: "America/Halifax",
      customerId: "user001",
      customerName: "John Doe",
      customerEmail: "john@doe.com",
      restaurantId: "res003",
      restaurantName: "Oysters and Shells",
    },
  },
}

```

> `delete_reservation`

- API Path: `/dev-delete/deleteReservation`

```JSON
{
  body: {
    reservationId: "OfpqUtaJu6DoBbaLBnwD",
    timezone: "America/Halifax"
  },
}

```

> `get_reservation_by_user`

- API Path: `/dev-get-bu/getReservationByUser`

```JSON
{
  body: {
    userId: "user001",
    timezone: "America/Halifax"
  }
}

```

> `get_reservation_by_restaurant`

- API Path: `/dev-get-br/getReservationByRestaurant`

```JSON
{
  body: {
    restaurantId: "res003",
    date: "Oct 20, 2023",
    timezone: "America/Halifax",
  },
}

```
