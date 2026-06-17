
const state = {
    neutralBaseline: null // Aquí guardaremos el vector con la media de los 52 Blendshapes
};


export const setNeutralBaseline = (baseline) => {
    state.neutralBaseline = baseline;
    console.log("Valor neutral guardado correctamente:", state.neutralBaseline);
};

export const getNeutralBaseline = () => {
    return state.neutralBaseline;
};

export const isCalibrated = () => {
    return state.neutralBaseline !== null;
};