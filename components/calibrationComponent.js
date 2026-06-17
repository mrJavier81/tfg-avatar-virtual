import { setNeutralBaseline } from "../services/store.js";
import {getFaceLandmarker, createFaceLandmarker, drawFaceLandmarks} from "../services/vision.js"; 

const calibrationComponent = () => {

    
    return /*HTML*/`
    <div class="flex flex-col items-center font-bold">
        <h1>Pantalla de calibración</h1>
    </div>
    <div class="flex flex-col items-center justify-center">
        <p>Mantén una expresión neutral durante 3 segundos</p>
        <video videoCalibration id="calibration-video" width="640" height="480" class="border border-gray-300"></video>
        <p id="tiempo">Tiempo restante: </p>
        <button id="start-calibration-button" class="bg-blue-500 text-white p-2 m-2 rounded">Iniciar calibración</button>
    </div>
    <div class="flex flex-col items-center justify-center">
        <p>Resultados:</p>
        <p id=resultados></p>
    </div>
    `;
}

export default calibrationComponent;

export const initCalibrationLogic = async () => {
    const startCalibButton = document.getElementById("start-calibration-button");
    const tiempoRestante = document.getElementById("tiempo")
    const resultadosText = document.getElementById("resultados");
    const video = document.getElementById("calibration-video");
    await createFaceLandmarker("VIDEO");
    

    let faceLandmarkerResults = [];
    let faceLandmarkerResult = null;
    let faceLandmarker = getFaceLandmarker();
    let timer = 0;
    let timerLimit = 3000;
    let enProceso = false;
    let averageLandmarkerResult;
    let valorNeutral;

    navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        })
        .catch((error)  => {
            console.error("Error al acceder a la cámara: ", error);
        });

    startCalibButton.addEventListener("click", () => {
        startCalibButton.disabled = true;
        timer = 0;
        enProceso = true;

        faceLandmarkerResults = []; 

        procesarFrame();

        
        
        
    });

    function obtenerValorNeutral() {
        

        if(!faceLandmarkerResults){
            console.error("El resultado esta vacio!!!!")
            return;
        }

        const totalFrames = faceLandmarkerResults.length;
        const resultadoNeutral = {};
        const valorNeutral = {};

        faceLandmarkerResults.forEach(faceBlendshapes =>{
            faceBlendshapes.categories.forEach(({ categoryName, score }) => {
                if(!resultadoNeutral[categoryName]){
                    resultadoNeutral[categoryName] = 0;
                }
                resultadoNeutral[categoryName] += score;
            });

        });

        Object.keys(resultadoNeutral).forEach(categoryName => {
        valorNeutral[categoryName] = resultadoNeutral[categoryName] / totalFrames;
        });
        
        return valorNeutral;

    }

    async function procesarFrame() {
        if(!enProceso){
            return;
        }

        if (timer > timerLimit){
            
            tiempoRestante.innerText = "Calibración completada!"

            valorNeutral = obtenerValorNeutral();
            setNeutralBaseline(valorNeutral);

            startCalibButton.disabled = false;
            enProceso = false;
            console.log("Calibracion completada");
            resultadosText.innerText = JSON.stringify(valorNeutral, null, 2);
            return;
        }
        const segundos = Math.ceil((timerLimit - timer) / 1000);
        tiempoRestante.innerText = "Tiempo restante: " + segundos;
        
        try {
            const timestampActual = performance.now();
            faceLandmarkerResult = await faceLandmarker.detectForVideo(video, timestampActual);
            
            if(faceLandmarkerResult && faceLandmarkerResult.faceBlendshapes.length > 0){
                faceLandmarkerResults.push(faceLandmarkerResult.faceBlendshapes[0]);
            }else{
                console.error("Error detectando cara!!!")
            }

            
        }catch(err) {
            console.error("Se ha producido un error:" + err)
        }
        timer+=100; 

        setTimeout(procesarFrame, 100);
    }

}