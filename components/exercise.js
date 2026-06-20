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

        <!-- Cabecera de sesión -->
        <div class="flex items-center justify-between mb-4 px-1">
            <span class="text-sm text-zinc-500 font-mono" id="exCounter"></span>
            <button
                id="btnCerrarEjercicio"
                class="material-icons text-zinc-400 hover:text-zinc-700 transition-colors"
                title="Cerrar ejercicios"
            >close</button>
        </div>

        <!-- Tarjeta principal del ejercicio -->
        <div id="exCard"
            class="relative border-2 border-zinc-900 rounded-2xl p-8 text-center bg-white shadow-sm overflow-hidden"
        >
            <!-- Estado: en curso -->
            <div id="exEnCurso">
                <p class="text-xs uppercase tracking-widest text-zinc-400 mb-2 font-mono">
                    Mantén esta expresión
                </p>
                <div class="text-7xl my-4 select-none" id="exEmoji"></div>
                <h2 class="text-3xl font-bold tracking-tight mb-1" id="exEmocion"></h2>
                <p class="text-sm text-zinc-500 mb-6" id="exDescripcion"></p>

                <!-- Emoción detectada ahora mismo -->
                <div class="flex items-center justify-center gap-2 mb-6 text-sm">
                    <span class="text-zinc-400">Tú ahora:</span>
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
                </div>
            </div>

            <!-- Estado: completado -->
            <div id="exCompletado" class="hidden">
                <div class="text-6xl mb-4 animate-bounce">🎉</div>
                <h2 class="text-2xl font-bold mb-2">¡Bien hecho!</h2>
                <p class="text-zinc-500 text-sm mb-6">
                    Has mantenido <strong id="exEmocionLogro"></strong> durante
                    <strong id="exTiempoRequerido"></strong> segundos.
                </p>
                <button
                    id="btnSiguiente"
                    class="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white font-semibold transition-colors"
                >
                    Siguiente emoción →
                </button>
            </div>

            <!-- Línea decorativa de progreso en el borde superior -->
            <div
                id="exBordeSuperior"
                class="absolute top-0 left-0 h-1 rounded-t-2xl transition-all duration-200"
                style="width: 0%; background: #18181b;"
            ></div>
        </div>
    </div>`;

    // Botón para lanzar la sesión (se añade junto a los otros botones de display.js)
    export const exerciseButton = () => /* HTML */ `
    <button
        class="material-icons rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white p-4"
        title="Ejercicio de emociones"
        id="btnEjercicio"
    >sentiment_very_satisfied</button>`;



// emocion detectada en tiempo real por display.js
let emocionEnTiempoReal = "Neutral";

// display.js llamará a esto en cada frame para mantener sincronía
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
    document.getElementById("exBordeSuperior").style.width = `${progreso}%`;

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
    document.getElementById("exBordeSuperior").style.width = "100%";
    document.getElementById("exBarra").style.background = "#059669"; // emerald-600
    document.getElementById("exBordeSuperior").style.background = "#059669";
};


const cargarEjercicio = () => {
    const ejercicio = getEjercicioActual();
    if (!ejercicio) return;


    document.getElementById("exEnCurso").classList.remove("hidden");
    document.getElementById("exCompletado").classList.add("hidden");
    document.getElementById("exBarra").style.width = "0%";
    document.getElementById("exBarra").style.background = "#18181b";
    document.getElementById("exBordeSuperior").style.width = "0%";
    document.getElementById("exBordeSuperior").style.background = "#18181b";
    document.getElementById("exTiempoActual").textContent = "0.0s";
    document.getElementById("exMatchIcon").textContent = "　";

    document.getElementById("exEmoji").textContent = ejercicio.emoji;
    document.getElementById("exEmocion").textContent = ejercicio.emocion;
    document.getElementById("exDescripcion").textContent = ejercicio.descripcion;
    document.getElementById("exTiempoTotal").textContent =
        `${getTiempoRequerido()}s`;

    // Contador (ej: "3 / 6")
    document.getElementById("exCounter").textContent =
        `${getIndiceActual() + 1} / ${getTotalEjercicios()}`;
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

    if (!panel || !btnEjercicio) return;

    btnEjercicio.addEventListener("click", () => {
        iniciarSesion();
        cargarEjercicio();
        panel.classList.remove("hidden");
    });

    btnCerrar.addEventListener("click", () => {
        panel.classList.add("hidden");
    });

    btnSiguiente.addEventListener("click", () => {
        siguienteEjercicio();
        cargarEjercicio();
        document.getElementById("exCounter").textContent =
            `${getIndiceActual() + 1} / ${getTotalEjercicios()}`;
    });
};
