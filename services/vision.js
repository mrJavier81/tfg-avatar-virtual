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
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode,
        numFaces: 1
    });

}

export function getFaceLandmarker() {
    return faceLandmarker;
}

export function drawFaceLandmarks(canvasContext, faceLandmarkerResult) {

    const drawingUtils = new DrawingUtils(canvasContext);
    for (const landmarks of faceLandmarkerResult.faceLandmarks) {
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION,
            { color: "#C0C0C070", lineWidth: 1 });
        
        drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE,
        { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW,
        { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYE,
        { color: "#30FF30" }
        );
        drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW,
        { color: "#30FF30" }
        );
        drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
        { color: "#E0E0E0" }
        );
        drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
        color: "#E0E0E0"
        });
        drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS,
        { color: "#FF3030" }
        );
        drawingUtils.drawConnectors(
        landmarks,
        FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS,
        { color: "#30FF30" }
        );
    }
}   