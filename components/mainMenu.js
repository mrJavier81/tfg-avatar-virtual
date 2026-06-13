import display, { initDisplayLogic } from "./display.js"

const mainMenu = () => {
    return /*HTML*/`
                <div class="flex flex-col items-center justify-center">
                    <h1>Menú Principal</h1>
                </div>
                <div id="main-menu-buttons" class="flex flex-col items-center justify-center ">
                    <button id="display-button" class="bg-blue-500 text-white p-2 m-2 rounded">Replicación de emociones</button>
                    <button id="recon-button" class="bg-blue-500 text-white p-2 m-2 rounded">Reconocimiento de emociones</button>
                </div>
                    `;
};

export default mainMenu;

export const initMainMenuLogic = () => {
    const displayButton = document.getElementById("display-button");
    const reconButton = document.getElementById("recon-button");

    displayButton.addEventListener("click", () => {
        const root = document.getElementById("root");
        root.innerHTML = display();
        initDisplayLogic();
    });
}
