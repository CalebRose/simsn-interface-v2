import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { SnackbarProvider } from "notistack";
import { HelmetProvider } from "react-helmet-async";

// if (/iphone|ipad|ipod/i.test(navigator.userAgent)) {
//   import("eruda").then(({ default: eruda }) => eruda.init());
// }

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <SnackbarProvider
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        maxSnack={3}
      >
        <App />
      </SnackbarProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
