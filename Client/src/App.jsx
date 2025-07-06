import React from "react";
import { BrowserRouter } from "react-router-dom";
import AllRoutes from "./components/ṛoutes/AllRoutes";
import { UserProvider } from "./components/context/UseContext";
import { NotificationProvider } from "./components/NotificationSystem";

function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AllRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </UserProvider>
  );
}

export default App;
