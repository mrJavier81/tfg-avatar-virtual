import { setNeutralBaseline } from "../services/store.js";
import {getFaceLandmarker, createFaceLandmarker, drawFaceLandmarks} from "../services/vision.js"; 

const calibrationComponent = () => {

    
    return /*HTML*/`
    <div class="flex flex-col items-center font-bold text-xl">
        <h1>Pantalla de calibración</h1>
    </div>
    <div class="flex flex-col items-center justify-center m-4">
        <p>Mantén una expresión neutral durante 3 segundos</p>
        <video videoCalibration id="calibration-video" width="640" height="480" class="block rounded-xl border-4 border-zinc-900 m-4"></video>
        <p id="tiempo" class="hidden text-xl">Tiempo restante: </p>
        <button id="start-calibration-button" class="bg-[#5881aa] hover:bg-[#73a1ca] text-white p-4 m-2 rounded">Iniciar calibración</button>
    </div>
    <div id=divResultados class="flex flex-col items-center justify-center hidden">
        
        <button id=btnProceder class= "bg-[#5881aa] hover:bg-[#73a1ca] text-white p-4 m-2 rounded">Continuar</button>
        <p id=resultados>¡Ya puedes proceder a la siguiente pantalla!</p>
        <p>O volver a realizar la calibración</p>
    </div>
    `;
}

export default calibrationComponent;

export const initCalibrationLogic = async () => {
    const startCalibButton = document.getElementById("start-calibration-button");
    const btnProceder = document.getElementById("btnProceder");
    const tiempoRestante = document.getElementById("tiempo")
    const resultadosText = document.getElementById("resultados");
    const video = document.getElementById("calibration-video");
    const divResultados = document.getElementById("divResultados");
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
            alert("No se pudo acceder a la cámara. Permitela o reinicia la página.");
        });

    startCalibButton.addEventListener("click", () => {
        startCalibButton.disabled = true;
        timer = 0;
        enProceso = true;
        tiempoRestante.classList.remove("hidden");
        
        if(!divResultados.classList.contains("hidden"))
            divResultados.classList.add("hidden");


        faceLandmarkerResults = []; 

        procesarFrame();
    });

    btnProceder.addEventListener("click", () => {
        window.location.hash = "#/display";
    })

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
            
            tiempoRestante.innerText = "¡Calibración completada!"

            valorNeutral = obtenerValorNeutral();
            setNeutralBaseline(valorNeutral);

            startCalibButton.disabled = false;
            startCalibButton.innerText = "Reintentar calibración"
            enProceso = false;
            console.log("Calibracion completada");
            divResultados.classList.remove("hidden");
            console.log("Valor calibracion: " + JSON.stringify(valorNeutral, null, 2))
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