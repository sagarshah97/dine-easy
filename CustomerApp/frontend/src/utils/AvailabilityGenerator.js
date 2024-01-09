// Author: Sagar Paresh Shah (B00930009)

const moment = require("moment");

const generateAvailableSlots = (bookings, restaurantData, day, date) => {
  const tableAvailability = [];
  const availabilityObj = restaurantData.availability.find((obj) =>
    obj.day.includes(day)
  );

  if (
    availabilityObj &&
    "opening_hour" in availabilityObj &&
    "closing_hour" in availabilityObj
  ) {
    const { opening_hour, closing_hour } = availabilityObj;

    const openingTime = moment(opening_hour ? opening_hour : null, "HH:mm:ss");
    const closingTime = moment(closing_hour ? closing_hour : null, "HH:mm:ss");

    for (let table = 1; table < restaurantData.tables.length; table++) {
      tableAvailability[table] = [];
    }

    if (openingTime && closingTime) {
      let currentTime = openingTime.clone();
      const currentDateTime = moment();

      while (currentTime.isBefore(closingTime)) {
        // Calculate the next hour with an additional minute
        const nextHour = currentTime.clone().add(59, "minutes");

        // Format the time slots as per your requirement
        const slot =
          currentTime.format("HH:mm") + " - " + nextHour.format("HH:mm");

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
    }
  } else {
    console.log(`Availability not found for ${day}`);
  }

  return tableAvailability;
};

export default generateAvailableSlots;
