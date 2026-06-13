import display, { initDisplayLogic } from "./components/display.js"
import mainMenu, { initMainMenuLogic } from "./components/mainMenu.js"
import header from "./components/header.js"
import footer from "./components/footer.js"


const root = document.getElementById("root");

root.insertAdjacentHTML("beforebegin", header());
root.insertAdjacentHTML("afterend", footer());

root.innerHTML = mainMenu();
initMainMenuLogic();