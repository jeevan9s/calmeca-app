import ReactDOM from "react-dom/client";
import App from "./app.tsx";
import { HashRouter } from 'react-router-dom';
import '@/renderer/styles/tb.css'
import "./index.css";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <HashRouter>
      <App />
    </HashRouter>
);

window.ipcRenderer.on("main-process-message", (_event, message) => {
	console.log(message);
});
