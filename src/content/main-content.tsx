import React from "react";
import ReactDOM from "react-dom/client";
import { createContentRoot } from "./root";
import '../index.css'




chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const root = createContentRoot()

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <div className="text-3xl font-bold text-red-600">wordwise</div>
    </React.StrictMode>
  );
})


