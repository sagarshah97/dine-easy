import Homepage from "../views/Homepage";
import Login from "../views/Authentication/login.js";
import SignUp from "../views/Authentication/signup.js";
import ChangePass from "../views/Authentication/changepassword.js";
import Navbar from "../utils/Navbar";
import Bookings from "../views/BookReservations";
import MyBookings from "../views/MyReservations";
import { Route, Routes, useLocation } from "react-router-dom";
import MenuComponent from "../views/Menu/MenuComponent";
import ItemsMenu from "../views/Menu/ItemsMenu";
import RestaurantList from "../views/ListRestaurants";
import RestaurantDetails from "../views/ListRestaurants/RestaurantDetails";

const Router = () => {
  const location = useLocation();

  return (
    <>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navbar />}>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/booking" element={<Bookings />} />
          <Route path="/mybookings" element={<MyBookings />} />
          <Route path="/menu/:id" element={<MenuComponent />}></Route>
          <Route path="/itemMenu" element={<ItemsMenu />}></Route>
          <Route path="/listrestaurants" element={<RestaurantList />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/changepassword" element={<ChangePass />} />
          <Route path="/RestaurantDetails/:id" element={<RestaurantDetails />} />
        </Route>
      </Routes>
    </>
  );
};

export default Router;
