// @flow
import * as React from "react";
import ReactDOM from "react-dom";

import App from "./app.jsx";

const app = document.getElementById("app");

app && ReactDOM.render(<App />, app);
