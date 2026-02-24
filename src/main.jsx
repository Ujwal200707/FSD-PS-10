import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { clearClientStorageForFreshBoot, initializeSampleData } from "./utils/bootstrap";

// Initialize sample data on app start
clearClientStorageForFreshBoot();
initializeSampleData();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
