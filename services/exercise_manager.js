// Gestiona el estado y la lógica de los ejercicios de emociones
// Las emociones disponibles vienen de gesture_recognition.js (modelo de Paul Ekman)

const EJERCICIOS = [
    { emocion: "Alegría",   emoji: "😄", descripcion: "Sonríe ampliamente y eleva las mejillas" },
    { emocion: "Sorpresa",  emoji: "😮", descripcion: "Abre bien los ojos y la boca" },
    { emocion: "Enfado",    emoji: "😠", descripcion: "Frunce el ceño y aprieta los labios" },
    { emocion: "Tristeza",  emoji: "😢", descripcion: "Baja las comisuras de la boca" },
    { emocion: "Miedo",     emoji: "😨", descripcion: "Abre los ojos y estira la boca hacia los lados" },
    { emocion: "Asco",      emoji: "🤢", descripcion: "Arruga la nariz y eleva el labio superior" },
];

const TIEMPO_REQUERIDO = 5; // segundos que hay que mantener la emoción


let estado = {
    activo: false,
    completado: false,
    indiceActual: 0,
    tiempoAcumulado: 0,
    ultimoTimestamp: null,
    ejerciciosOrdenados: [],
};

// Mezcla el array de ejercicios en orden aleatorio (Fisher-Yates)
const mezclarEjercicios = () => {
    const copia = [...EJERCICIOS];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
};

export const iniciarSesion = () => {
    estado.ejerciciosOrdenados = mezclarEjercicios();
    estado.indiceActual = 0;
    iniciarEjercicioActual();
};

const iniciarEjercicioActual = () => {
    estado.activo = true;
    estado.completado = false;
    estado.tiempoAcumulado = 0;
    estado.ultimoTimestamp = null;
};

// Llamar en cada frame desde procesarFrameTiempoReal
// Devuelve true si el ejercicio se acaba de completar en este frame
export const actualizarDeteccion = (emocionDetectada, timestampMs) => {
    if (!estado.activo || estado.completado) return false;

    const ejercicioActual = estado.ejerciciosOrdenados[estado.indiceActual];

    if (estado.ultimoTimestamp === null) {
        estado.ultimoTimestamp = timestampMs;
        return false;
    }

    const deltaSegundos = (timestampMs - estado.ultimoTimestamp) / 1000;
    estado.ultimoTimestamp = timestampMs;

    if (emocionDetectada === ejercicioActual.emocion) {
        estado.tiempoAcumulado = Math.min(
            estado.tiempoAcumulado + deltaSegundos,
            TIEMPO_REQUERIDO
        );
    }
    // Si no coincide, no acumula (el tiempo no retrocede)

    if (estado.tiempoAcumulado >= TIEMPO_REQUERIDO) {
        estado.completado = true;
        estado.activo = false;
        return true; // señal de completado
    }

    return false;
};

export const siguienteEjercicio = () => {
    estado.indiceActual++;
    if (estado.indiceActual >= estado.ejerciciosOrdenados.length) {
        // Se han completado todos: reiniciar con nuevo orden
        estado.ejerciciosOrdenados = mezclarEjercicios();
        estado.indiceActual = 0;
    }
    iniciarEjercicioActual();
};

// Getters
export const getEjercicioActual = () =>
    estado.ejerciciosOrdenados[estado.indiceActual] ?? null;

export const getProgreso = () =>
    Math.min((estado.tiempoAcumulado / TIEMPO_REQUERIDO) * 100, 100);

export const getTiempoAcumulado = () =>
    Math.min(estado.tiempoAcumulado, TIEMPO_REQUERIDO);

export const estaCompleto = () => estado.completado;

export const estaActivo = () => estado.activo;

export const getIndiceActual = () => estado.indiceActual;

export const getTotalEjercicios = () => estado.ejerciciosOrdenados.length;

export const getTiempoRequerido = () => TIEMPO_REQUERIDO;
