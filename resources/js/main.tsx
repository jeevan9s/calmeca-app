import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from '../app/app.tsx';
import '../app/renderer/styles/index.css';

if (typeof Neutralino !== 'undefined') {
    Neutralino.init();

    Neutralino.events.on("windowClose", () => {
        Neutralino.app.exit();
    });

    if (NL_OS != "Darwin") {
        Neutralino.os.setTray({
            icon: "../public/taskbar.png",
            menuItems: [
                { id: "QUIT", text: "Quit" }
            ]
        });
    }

    Neutralino.events.on("trayMenuItemClicked", (event) => {
        if (event.detail.id === "QUIT") {
            Neutralino.app.exit();
        }
    });
}

const container = document.getElementById('neutralinoapp');
const root = createRoot(container);
root.render(
    <HashRouter>
        <App />
    </HashRouter>
);