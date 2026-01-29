import display, { initDisplayLogic } from "./components/display.js"
import header from "./components/header.js"
//import footer from "./components/footer.js"


const root = document.getElementById("root");

root.insertAdjacentHTML("beforebegin", header());
//root.insertAdjacentElement("afterend", footer());

root.innerHTML = display();
initDisplayLogic();