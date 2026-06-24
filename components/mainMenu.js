import display, { initDisplayLogic } from "./display.js"

const mainMenu = () => {
    return /*HTML*/`
            <div class="flex-1 flex items-center justify-center">
                <div class="w-full max-w-sm px-6">

                    <div class="text-center mb-10">
                        <h1 class="text-3xl font-bold tracking-wide">Menú Principal</h1>
                    </div>

                    <div id="main-menu-buttons" class="flex flex-col gap-3">
                        <button id="display-button" class="w-full bg-[#5881aa] hover:bg-[#73a1ca] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-md">Replicación de emociones</button>
                        <button id="recon-button" class="w-full bg-[#5881aa] hover:bg-[#73a1ca] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-md">Reconocimiento de emociones</button>
                        <button id="calib-button" class="w-full bg-[#5881aa] hover:bg-[#73a1ca] text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 shadow-md">Calibrar</button>
                    </div>
                </div>
            </div>
                    `;
};

export default mainMenu;

export const initMainMenuLogic = () => {
    const displayButton = document.getElementById("display-button");
    const reconButton = document.getElementById("recon-button");
    const calibButton = document.getElementById("calib-button")

    displayButton.addEventListener("click", () => {
        window.location.hash = "#/display";
    });

    calibButton.addEventListener("click", ()=> {
        window.location.hash = "#/calibration";
    });

}
