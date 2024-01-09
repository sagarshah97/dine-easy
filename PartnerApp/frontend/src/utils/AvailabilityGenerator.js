// Author: Sagar Paresh Shah (B00930009)

const moment = require("moment");

const generateAvailableSlots = (bookings, restaurantData, day, date) => {
  const { opening_hour, closing_hour } = restaurantData.availability.find(
    (obj) => obj.day.includes(day)
  );

  const openingTime = moment(opening_hour, "HH:mm:ss");
  const closingTime = moment(closing_hour, "HH:mm:ss");

  const tableAvailability = {};

  for (let table = 1; table < restaurantData.tables.length; table++) {
    tableAvailability[table] = [];
  }

  let currentTime = openingTime.clone();
  const currentDateTime = moment();

  while (currentTime.isBefore(closingTime)) {
    // Calculate the next hour with an additional minute
    const nextHour = currentTime.clone().add(59, "minutes");

    // Format the time slots as per your requirement
    const slot = currentTime.format("HH:mm") + " - " + nextHour.format("HH:mm");

    // Initialize availability for each table for this time slot
    for (let table = 1; table < restaurantData.tables.length; table++) {
      const slotData = {
        slot: slot,
        available: true,
        capacity: restaurantData.tables[table].capacity,
      };

      // Check if the date is today and the time slot is in the past or within the next 2 hours
      if (
        date === currentDateTime.format("MMM DD, YYYY") &&
        currentTime.isBefore(currentDateTime) &&
        nextHour.isBefore(currentDateTime.clone().add(2, "hours"))
      ) {
        slotData.available = false;
      }

      tableAvailability[table].push(slotData);
    }

    if (bookings.length) {
      // Check if the time slot is unavailable due to a booking
      bookings.forEach((booking) => {
        const startTime = moment(booking.startTime).format("HH:mm");
        const endTime = moment(booking.endTime).format("HH:mm");
        const bookingTable = booking.table;

        if (date === moment(booking.startTime).format("MMM DD, YYYY")) {
          tableAvailability[bookingTable].forEach((slot) => {
            if (slot.slot === startTime + " - " + endTime) {
              slot.available = false;
            }
          });
        }
      });
    }

    currentTime = nextHour.add(1, "minute");
  }

  return tableAvailability;
};

export default generateAvailableSlots;
