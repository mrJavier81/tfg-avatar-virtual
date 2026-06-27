// Funciones para reconocer emociones a partir de los datos recopilados
// Basado en el modelo de las 6 emociones básicas de Paul Ekman y expresiones FACS usando Blendshapes

export const obtenerEmocionAproximada = (results) => {
    
    if(!results || !results.faceBlendshapes || results.faceBlendshapes.length === 0){
        return { emocion: "Desconocida", puntuaciones: null };
    } 

    const blendshapesArray = results.faceBlendshapes[0].categories;

    
    const blendshapes = {};
    blendshapesArray.forEach(b => {
        blendshapes[b.categoryName] = b.score;
    });

    const getVal = (name) => blendshapes[name] || 0;

    
    const getBoost = (name, multiplier) => Math.min(1.0, getVal(name) * multiplier);

    const emociones = {
        "Alegría": (
            (getVal("mouthSmileLeft") + getVal("mouthSmileRight")) / 2 +
            (getVal("cheekSquintLeft") + getVal("cheekSquintRight")) / 2
        ) / 2,

        "Tristeza": (
            (getBoost("eyeSquintLeft", 1.8) + getBoost("eyeSquintRight", 1.8)) / 2 * 0.35 +  
            getBoost("mouthFrownLeft", 2.5) * 0.25 +
            getBoost("mouthFrownRight", 2.5) * 0.25 +
            getBoost("browInnerUp", 2.0) * 0.15 +   
            getBoost("mouthShrugLower", 2.0) * 0.15 - 
           
            (getVal("mouthSmileLeft") + getVal("mouthSmileRight")) / 2 * 0.3
        ),

        "Sorpresa": (
            getVal("jawOpen") * 0.4 +
            (getVal("browOuterUpLeft") + getVal("browOuterUpRight")) / 2 * 0.3 +
            (getVal("eyeWideLeft") + getVal("eyeWideRight")) / 2 * 0.3
            
        ),

        "Enfado": (
            (getVal("browDownLeft") + getVal("browDownRight")) / 2 * 0.4 +
            (getVal("mouthPressLeft") + getVal("mouthPressRight")) / 2 * 0.35 +
            (getVal("eyeSquintLeft") + getVal("eyeSquintRight")) / 2 * 0.25
        ),

        "Asco": (
            (getVal("noseSneerLeft") + getVal("noseSneerRight")) / 2 * 0.6 +
            (getVal("mouthUpperUpLeft") + getVal("mouthUpperUpRight")) / 2 * 0.4
        ),

        "Miedo": (
            getBoost("browInnerUp", 3.0) * 0.25 +          
            (getVal("eyeWideLeft") + getVal("eyeWideRight")) / 2 * 0.25 +
            (getBoost("mouthStretchLeft", 2.5) + getBoost("mouthStretchRight", 2.5)) / 2 * 0.3 +
            (getVal("cheekSquintLeft") + getVal("cheekSquintRight")) / 2 * 0.2 
        ),
    };

    const tensionBoca = (getVal("mouthStretchLeft") + getVal("mouthStretchRight")) / 2;
    emociones["Sorpresa"] = Math.max(0, emociones["Sorpresa"] - tensionBoca);
    
    // Determinar la emoción dominante superando un umbral mínimo
    let dominante = "Neutral";
    const scores = Object.values(emociones);
    const media = scores.reduce((a, b) => a + b, 0) / scores.length;
    let maxScore = Math.max(0.10, media * 0.8);

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
