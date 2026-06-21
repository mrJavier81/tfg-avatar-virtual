// Componente de ejercicio de emociones
// Se monta junto al componente display existente

import {
    iniciarSesion,
    siguienteEjercicio,
    actualizarDeteccion,
    getEjercicioActual,
    getProgreso,
    getTiempoAcumulado,
    estaCompleto,
    estaActivo,
    getIndiceActual,
    getTotalEjercicios,
    getTiempoRequerido,
} from "../services/exercise_manager.js";


export const exercisePanel = () => 
    /* HTML */ `
    <div id="exercisePanel" class="hidden container mx-auto mt-8 max-w-lg">

        
        <div class="flex items-center justify-between mb-4 px-1">
            <span class="text-sm text-zinc-500 font-mono" id="exCounter"></span>
        </div>


        <div id="exCard"
            class="relative border-2 border-zinc-900 rounded-2xl p-8 text-center bg-white shadow-sm overflow-hidden"
        >
        
            <div id="exEnCurso">
                <p class="text-xs uppercase   mb-2 ">
                    Intenta replicar la emoción
                </p>
                <div class="text-7xl my-4 select-none" id="exEmoji"></div>
                <h2 class="text-3xl font-bold tracking-tight mb-1" id="exEmocion"></h2>
                <p class="text-sm text-zinc-500 mb-6" id="exDescripcion"></p>

                <!-- Emoción detectada ahora mismo -->
                <div class="flex items-center justify-center gap-2 mb-6 text-sm">
                    <span class="text-zinc-400">Emoción detectada:</span>
                    <span id="exDetectada"
                        class="font-semibold text-zinc-700 transition-all duration-200"
                    >—</span>
                    <span id="exMatchIcon" class="text-lg">　</span>
                </div>

                <!-- Barra de progreso -->
                <div class="relative">
                    <div class="w-full bg-zinc-100 rounded-full h-4 overflow-hidden border border-zinc-200">
                        <div
                            id="exBarra"
                            class="h-full rounded-full transition-all duration-200 ease-linear"
                            style="width: 0%; background: #18181b;"
                        ></div>
                    </div>
                    <div class="flex justify-between mt-1 text-xs text-zinc-400 font-mono">
                        <span id="exTiempoActual">0.0s</span>
                        <span id="exTiempoTotal"></span>
                    </div>
                    <div id="saltarEx" class="flex justify-between">
                        <button
                            id="btnSaltar"
                            class="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white font-semibold transition-colors">
                            Saltar ejercicio
                        </button>
                    </div>
                </div>
            </div>

         
            <div id="exCompletado" class="hidden">

                <h2 class="text-2xl font-bold mb-2">¡Bien hecho!</h2>
                <p class="text-zinc-500 text-sm mb-6">
                    Has mantenido <strong id="exEmocionLogro"></strong> durante
                    <strong id="exTiempoRequerido"></strong> segundos.
                </p>
                <button
                    id="btnSiguiente"
                    class="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white font-semibold transition-colors">
                    Siguiente emoción
                
                </button>
                <button
                    id="btnMenu"
                    class="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white font-semibold transition-colors hidden">
                    Volver al menú
                
                </button>
                
            </div>

        
            
        </div>
    </div>`;

    // Boton para comenzar los ejercicios. Se inyecta en la vista de display.js
    export const exerciseButton = () => /* HTML */ `
    <button
        class="material-icons rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white p-4"
        title="Ejercicio de emociones"
        id="btnEjercicio"
    >sentiment_very_satisfied</button>`;



// emocion detectada en tiempo real por display.js
let emocionEnTiempoReal = "Neutral";

// display.js llamará a esto en cada frame para mantener sincronia
export const setEmocionDetectada = (emocion) => {
    emocionEnTiempoReal = emocion;
};


const refrescarUI = () => {
    const ejercicio = getEjercicioActual();
    if (!ejercicio) return;

    const progreso = getProgreso();
    const tiempoActual = getTiempoAcumulado();
    const hayMatch = emocionEnTiempoReal === ejercicio.emocion;

    document.getElementById("exBarra").style.width = `${progreso}%`;
  

    const exDetectada = document.getElementById("exDetectada");
    const exMatchIcon = document.getElementById("exMatchIcon");
    exDetectada.textContent = emocionEnTiempoReal;

    if (hayMatch) {
        exDetectada.classList.remove("text-zinc-700");
        exDetectada.classList.add("text-emerald-600");
        exMatchIcon.textContent = "✓";
    } else {
        exDetectada.classList.remove("text-emerald-600");
        exDetectada.classList.add("text-zinc-700");
        exMatchIcon.textContent = "　";
    }

    // Temporizador
    document.getElementById("exTiempoActual").textContent =
        `${tiempoActual.toFixed(1)}s`;
};

const mostrarCompletado = () => {
    const ejercicio = getEjercicioActual();

    document.getElementById("exEnCurso").classList.add("hidden");
    document.getElementById("exCompletado").classList.remove("hidden");

    document.getElementById("exEmocionLogro").textContent = ejercicio.emocion;
    document.getElementById("exTiempoRequerido").textContent = getTiempoRequerido();

  
    document.getElementById("exBarra").style.width = "100%";

    document.getElementById("exBarra").style.background = "#059669"; // emerald-600
  
};


const cargarEjercicio = () => {

    if(getIndiceActual() < getTotalEjercicios() - 1){
        const ejercicio = getEjercicioActual();
        if (!ejercicio) return;


        document.getElementById("exEnCurso").classList.remove("hidden");
        document.getElementById("exCompletado").classList.add("hidden");
        document.getElementById("exBarra").style.width = "0%";
        document.getElementById("exBarra").style.background = "#18181b";
    
        document.getElementById("exTiempoActual").textContent = "0.0s";
        document.getElementById("exMatchIcon").textContent = "　";

        document.getElementById("exEmoji").textContent = ejercicio.emoji;
        document.getElementById("exEmocion").textContent = ejercicio.emocion;
        document.getElementById("exDescripcion").textContent = ejercicio.descripcion;
        document.getElementById("exTiempoTotal").textContent = `${getTiempoRequerido()}s`;

        // contador de ejrcicios 
        document.getElementById("exCounter").textContent =
            `${getIndiceActual() + 1} / ${getTotalEjercicios()}`;
    }else{
        mostrarCompletado();
        btnSiguiente.classList.add("hidden");
        btnMenu.classList.remove("hidden");

    }
};

// Bucle de actualización; se engancha con requestAnimationFrame de display.js
// display.js llama a esta funcion dentro de procesarFrameTiempoReal
export const tickEjercicio = (timestampMs) => {
    if (!estaActivo() && !estaCompleto()) return;
    if (estaActivo()) {
        const recienCompletado = actualizarDeteccion(emocionEnTiempoReal, timestampMs);
        if (recienCompletado) {
            mostrarCompletado();
            return;
        }
        refrescarUI();
    }
};



export const initExerciseLogic = () => {
    const panel = document.getElementById("exercisePanel");
    const btnEjercicio = document.getElementById("btnEjercicio");
    const btnCerrar = document.getElementById("btnCerrarEjercicio");
    const btnSiguiente = document.getElementById("btnSiguiente");
    const btnSaltar = document.getElementById("btnSaltar");
    const btnMenu = document.getElementById("btnMenu");

    if (!panel || !btnEjercicio) return;

    btnEjercicio.addEventListener("click", () => {
        iniciarSesion();
        cargarEjercicio();
        panel.classList.remove("hidden");
    });

    btnSiguiente.addEventListener("click", () => {
        if(getIndiceActual() < getTotalEjercicios() - 1){
            siguienteEjercicio();
            cargarEjercicio();
            document.getElementById("exCounter").textContent =
                `${getIndiceActual() + 1} / ${getTotalEjercicios()}`;
        }else{
            btnSiguiente.innerText = "Volver al menú principal"
        }

    });

    btnSaltar.addEventListener("click", () => {
        siguienteEjercicio();
        cargarEjercicio();
        document.getElementById("exCounter").textContent =
                `${getIndiceActual() + 1} / ${getTotalEjercicios()}`;
    })
};
