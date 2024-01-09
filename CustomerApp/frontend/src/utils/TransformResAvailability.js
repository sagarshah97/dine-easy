const transformData = (inputData) => {
  if (
    !inputData.restaurant_operation_details ||
    !inputData.restaurant_operation_details.L
  ) {
    return [];
  }

  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const transformedData = inputData.restaurant_operation_details.L.map(
    (item) => {
      const dayData = item.M;
      const dayName = dayData.day.S;
      const openingTime = dayData.opening_time.N;
      const closingTime = dayData.closing_time.N;

      const openingHour = `${String(Math.floor(openingTime / 100)).padStart(
        2,
        "0"
      )}:${String(openingTime % 100).padStart(2, "0")}:00`;
      const closingHour = `${String(Math.floor(closingTime / 100)).padStart(
        2,
        "0"
      )}:${String(closingTime % 100).padStart(2, "0")}:00`;

      return {
        day: dayName.substring(0, 3), // Shortened day name (e.g., "Sun")
        opening_hour: openingHour,
        closing_hour: closingHour,
      };
    }
  );

  // Sort the data by the order of days in a week
  const sortedData = [];
  daysOfWeek.forEach((day) => {
    const matchingDay = transformedData.find(
      (item) => item.day === day.substring(0, 3)
    );
    if (matchingDay) {
      sortedData.push(matchingDay);
    }
  });

  return sortedData;
};

export default transformData;
