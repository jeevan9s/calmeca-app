import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.tsx";
import { HashRouter } from 'react-router-dom';
import '@/renderer/styles/tb.css'
import "./index.css";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);

window.ipcRenderer.on("main-process-message", (_event, message) => {
	console.log(message);
});
