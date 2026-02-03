import { FaceLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";


let faceLandmarker;
let runningMode = "IMAGE";



// Funcion sacada del ejemplo de MediaPipe otorgado por Google
// Carga el modelo de Face Landmarker y espera a que este listo para usarse
export async function createFaceLandmarker() {

    const filesetResolver = await
    FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
     );

    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {baseOptions: {
        modelAssetPath: './app/shared/models/face_landmarker.task',
        delegate: "GPU"},
        //outputFaceBlendshapes: true,
        runningMode,
        numFaces: 1
    });

}

createFaceLandmarker();

export function getFaceLandmarker() {
    return faceLandmarker;
}

export function drawFaceLandmarks(canvas, image, faceLandmarkerResult) {
    
}