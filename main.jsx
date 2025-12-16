import React from "react";
import ReactDOM from "react-dom/client";
// import UserNotRegisteredError from "./Components/UserNotRegisteredError.jsx"; // on ne l'utilise plus pour l'instant
import Home from "./Pages/Home.jsx"; // ou Exhibition.jsx
import Layout from "./Layout.jsx";
import Exhibition from "./Pages/Exhibition.jsx";
import './index.css';

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Layout>
    <Exhibition />  {/* on affiche directement la page principale */}
    </Layout>
  </React.StrictMode>
);