// Funciones para reconocer emociones a partir de los datos recopilados
// Basado en el modelo de las 6 emociones básicas de Paul Ekman y expresiones FACS usando Blendshapes

export const obtenerEmocionAproximada = (results) => {
    
    if(!results || !results.faceBlendshapes || results.faceBlendshapes.length === 0){
        return { emocion: "Desconocida", puntuaciones: null };
    } 

    const blendshapesArray = results.faceBlendshapes[0].categories;

    // Convertir el array a un diccionario para acceso más rápido usando categoryName y score
    const blendshapes = {};
    blendshapesArray.forEach(b => {
        blendshapes[b.categoryName] = b.score;
    });

    const getVal = (name) => blendshapes[name] || 0;

    const emociones = {
        "Alegría": (getVal("mouthSmileLeft") + getVal("mouthSmileRight")) / 2 + (getVal("cheekSquintLeft") + getVal("cheekSquintRight")) / 2,
        
        "Tristeza": (getVal("mouthFrownLeft") + getVal("mouthFrownRight")) / 2 + getVal("browInnerUp"),
        
        "Sorpresa": getVal("jawOpen") + (getVal("browOuterUpLeft") + getVal("browOuterUpRight")) / 2 + getVal("browInnerUp") + (getVal("eyeWideLeft") + getVal("eyeWideRight")) / 2,
        
        "Enfado": (getVal("browDownLeft") + getVal("browDownRight")) / 2 + (getVal("mouthPressLeft") + getVal("mouthPressRight")) / 2 + (getVal("eyeSquintLeft") + getVal("eyeSquintRight")) / 2,
        
        "Asco": (getVal("noseSneerLeft") + getVal("noseSneerRight")) / 2 + (getVal("mouthUpperUpLeft") + getVal("mouthUpperUpRight")) / 2,
        
        "Miedo": getVal("browInnerUp") + (getVal("eyeWideLeft") + getVal("eyeWideRight")) / 2 + (getVal("mouthStretchLeft") + getVal("mouthStretchRight")) / 2
    };

    // Determinar la emoción dominante superando un umbral mínimo
    let dominante = "Neutral";
    let maxScore = 0.65; 

    for (const [emocion, score] of Object.entries(emociones)) {
        if (score > maxScore) {
            maxScore = score;
            dominante = emocion;
        }
    }

    return {
        emocion: dominante,
        puntuaciones: emociones
    };
}
