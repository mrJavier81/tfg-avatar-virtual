// Funciones para reconocer emociones a partir de los datos recopilados

const obtenerEmocionAproximada = (results) => {
    
    if(!results || !results.faceBlendshapes || results.faceBlendshapes.length === 0){
        return "[ERROR] Entrada de face landmarker vacia";
    } 

    const blendshapes = results.faceBlendshapes[0].categories;

    // Convertir el resultado a un diccionario
    const landmarks = {};
    blendshapes.forEach(landmarks => {
        landmarks[landmarks.categoria] = landmarks.intensidad;
    })

    // TODO: Implementar heuristicas con el modelo de paul ekman

    

}