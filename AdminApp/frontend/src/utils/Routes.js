import Homepage from "../views/Homepage";
import Navbar from "../utils/Navbar";
import RestaurantsbyOrder from "../views/RestaurantsbyOrder";
import FoodOrderTimePeriods from "../views/FoodOrderTimePeriods";
import TopFoodItems from "../views/FoodItemsByRestaurants";
import { Route, Routes, useLocation } from "react-router-dom";
import CustomersByOrder from "../views/CustomersByOrder";
import LoginPage from "../views/Login";
import AllLogins from "../views/AllLogins";
import ReviewbyRestaurantName from "../views/ReviewbyRestaurantName";

const Router = () => {
  const location = useLocation();

  return (
    <>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AllLogins />} />
        <Route path="/" element={<Navbar />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/resbyorder" element={<RestaurantsbyOrder />} />
          <Route path="/custbyorder" element={<CustomersByOrder />} />
          <Route path="/foodorderperiods" element={<FoodOrderTimePeriods />} />
          <Route path="/topfooditems" element={<TopFoodItems />} />
          <Route path="/reviewbyrestaurantname" element={<ReviewbyRestaurantName />} />
        </Route>
      </Routes>
    </>
  );
};

export default Router;
