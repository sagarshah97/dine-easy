import "./styles/App.css";
import Router from "./utils/Routes";
import { BrowserRouter } from "react-router-dom";
import  KommunicateChat from "./utils/chat";

function App() {
  return (
    <>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
      <div>
        <KommunicateChat/>
      </div>
    </>
  );
}

export default App;
