import Homepage from "../views/Homepage";
import Navbar from "../utils/Navbar";
import ViewMenu from "../views/Menu/viewMenu";
import AddMenu from "../views/Menu/updateMenu";
import Reservation from "../views/Reservation";
import RestaurantDetails from "../views/RestaurantDetails";
import { Route, Routes, useLocation } from "react-router-dom";
import Login from "../views/Authentication/login.js";
import SignUp from "../views/Authentication/signup.js";
import HolisticView from "../views/HolisticView";

const Router = () => {
  const location = useLocation();

  return (
    <>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Navbar />}>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/menu" element={<ViewMenu />} />
          <Route path="/updateMenu" element={<AddMenu />} />
          <Route path="/reservation" element={<Reservation />} />
          <Route path="/holisticview" element={<HolisticView />} />
          <Route path="/resdetails" element={<RestaurantDetails />} />
        </Route>
      </Routes>
    </>
  );
};

export default Router;
