import React from "react";
import ReactDOM from "react-dom/client";
import { createContentRoot } from "./root";
// import 'virtual:uno.css'
// const url = chrome.runtime.getURL('virtual:uno.css')

const root = createContentRoot()

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <div className="text-10">fffff</div>
  </React.StrictMode>
);