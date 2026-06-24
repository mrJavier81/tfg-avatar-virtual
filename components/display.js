// En este componente se mostrará la imagen capturada
// y, cuando llegue el momento, la feed de video

import { obtenerEmocionAproximada } from "../services/gesture_recognition.js";
import {getFaceLandmarker, createFaceLandmarker, drawFaceLandmarks} from "../services/vision.js";
import { DrawingUtils } from "@mediapipe/tasks-vision";
import {getNeutralBaseline, isCalibrated} from "../services/store.js";
import { exercisePanel, exerciseButton, initExerciseLogic, tickEjercicio, setEmocionDetectada } from "./exercise.js";


// Este estilo de hacer los componentes lo he sacado de un tutorial de YouTube
// Es una manera mas corta de definir una funcion. "display" es el nombre, () son los argumentos que recibe,
// y la flecha "=>" indica que es una funcion. Luego, lo que va entre {} es lo que devuelve la funcion

// Se usan comillas `` para poder escribir HTML dentro de JavaScript sin que se rompa el codigo

const display = () => {
    return /* HTML */ `<div class="container mx-auto text-center">
        
        <div>
            <h1 class="font-bold text-xl">Practica imitar emociones</h1>
            <h2>Si no se detecta ninguna emoción, prueba a reiniciar el detector facial</h2>
        </div>

        <div id="divInstrucciones" class="container mx-auto mt-4 border-4 border-red-500 hidden">
            <h1 id="instrucciones" ></h1>
            <button id="ir-calibracion" class="bg-[#5881aa] hover:bg-[#73a1ca] text-white p-2 m-2 rounded ">Sí</button>
            <button id="no-calibracion" class="bg-[#5881aa] hover:bg-[#73a1ca] text-white p-2 m-2 rounded ">No</button>
        </div>
        <div class="relative w-fit mx-auto my-4 ">
            <video id="video" class="block rounded-xl border-4 border-zinc-900 flex items-center h-full">Captura de video no disponible</video>
            <canvas id="canvasTiempoReal" class="hidden absolute top-0 left-0 w-full h-full pointer-events-none rounded-xl"></canvas>
        </div>

        <div class="container mx-auto mt-4">
            <h2 class="text-xl font-bold mb-2">Resultados de la detección:</h2>

            <div class="gap-4">
                <h3 class="font-bold mb-2">
                    <span id="emocionDetectada" class="text-xl font-normal"></span>
                </h3>

            </div>
            
        </div>

        <div>
        
            <button class= "rounded-xl bg-[#5881aa] hover:bg-[#73a1ca] text-white p-4" title="Tiempo real" id="btnTiempoReal">Reiniciar detector facial</button>
            ${exerciseButton()}
        </div>

        ${exercisePanel()}

        <canvas id="canvas" class="hidden mx-auto my-4 rounded-xl border-4 border-zinc-900"></canvas>
        

        
    </div>`;
};

export default display;



export const initDisplayLogic = async () => {

    
    
    
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const videoTiempoReal = document.getElementById('videoTiempoReal');
    const canvasTiempoReal = document.getElementById('canvasTiempoReal');
    const contextTiempoReal = canvasTiempoReal.getContext('2d');
    const textoInstrucciones = document.getElementById('instrucciones');

    const context = canvas.getContext("2d");

    const btnPermitir = document.getElementById("permissions-button");
    const btnDetectar = document.getElementById("btnDetectar");
    const btnTiempoReal = document.getElementById("btnTiempoReal");
    const btnCalibrar = document.getElementById("ir-calibracion");
    const btnNoCalibrar = document.getElementById("no-calibracion");
    const divInstrucciones = document.getElementById("divInstrucciones");

    

    let imageURL;
    let caraDetectada = false;
    let ultimoFrame = -1; // Para determinar que el video sigue funcionando en activarTiempoReal
    let results = undefined;
    const resultado = document.getElementById("resultado");
    const numPuntos = document.getElementById("numPuntos");
    const emocionDetectada = document.getElementById("emocionDetectada");

    await createFaceLandmarker("VIDEO");
    const drawingUtils = new DrawingUtils(context);
    let faceLandmarkerResult = undefined;

    const faceLandmarker = getFaceLandmarker();
    

    if(!isCalibrated()){
        console.error("<AVISO> NO CALIBRADO!")
        textoInstrucciones.innerText = "Es recomendable realizar la calibración antes de continuar.\n¿Quieres proceder con ella?"
        divInstrucciones.classList.remove("hidden");
        

    }


    const llamarCamaraVideo = async () => {
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
    }

    const activarTiempoReal = async (ev) => {

        console.log("Llamado a activarTiempoReal")

        if(!video.srcObject){
            alert("No se puede iniciar el detector facial. Conecta una cámara de vídeo.");
            return;
        }


        canvasTiempoReal.width = video.videoWidth;
        canvasTiempoReal.height = video.videoHeight;

        canvasTiempoReal.classList.remove("hidden");

        procesarFrameTiempoReal();



        

        ev.preventDefault();
    }

    const procesarFrameTiempoReal = async () =>{

        let tiempoInicio = performance.now();
        if(ultimoFrame !== video.currentTime){
            //console.log("Funcionamiento correcto de dibujarMeshTIempoReal")
            ultimoFrame = video.currentTime;
            results = faceLandmarker.detectForVideo(video, tiempoInicio)

        }

        contextTiempoReal.clearRect(0,0, canvasTiempoReal.width, canvasTiempoReal.height);

        if(results && results.faceBlendshapes.length > 0){
            const baseNeutral = getNeutralBaseline();
            let categoriasNormalizadas = [];

            if (baseNeutral) {
                //console.log("Valor calibrado correcto, Usando base neutral");
                
                categoriasNormalizadas = results.faceBlendshapes[0].categories.map(shape => {
                    const baseScore = baseNeutral[shape.categoryName] || 0;
                    return {
                        categoryName: shape.categoryName,
                        displayName: shape.displayName,
                     
                        score: Math.max(0, shape.score - baseScore) 
                    };
                });
            } else {

                //console.log("<AVISO> Valor calibrado no encontrado");
                categoriasNormalizadas = [...results.faceBlendshapes[0].categories];
            }

            const resultadoNormalizado = {
                ...results,
                faceBlendshapes: [{
                    categories: categoriasNormalizadas
                }]
            };

            const emocionAproximada = obtenerEmocionAproximada(resultadoNormalizado);
            emocionDetectada.innerText = emocionAproximada.emocion;

            setEmocionDetectada(emocionAproximada.emocion);
            tickEjercicio(tiempoInicio);

        
            // Actualizar la lista completa de blendshapes en tiempo real
            const blendshapesList = document.getElementById('blendshapesList');
            const numBlendshapes = document.getElementById('numBlendshapes');
            if (blendshapesList && numBlendshapes) {
                const blendshapes = [...results.faceBlendshapes[0].categories]; 
                numBlendshapes.innerText = `(${blendshapes.length})`;
                blendshapes.sort((a, b) => b.score - a.score); 
                
                blendshapesList.innerHTML = '';
                blendshapes.forEach((shape) => {
                    const li = document.createElement('li');
                    li.innerText = `${shape.categoryName}: ${shape.score.toFixed(4)}`;
                    blendshapesList.appendChild(li);
                });
            }
        }

        if(results && results.faceLandmarks){
            drawFaceLandmarks(contextTiempoReal, results);
        }

        window.requestAnimationFrame(procesarFrameTiempoReal);

    }

    
    const detectarRostro = async (imagenFuente, faceLandmarker) => {
        if (!faceLandmarker) {
            console.error("Espera a que el Face Landmarker esté inicializado antes de clicar!");
            return;
        }
    
        faceLandmarkerResult = await faceLandmarker.detect(imagenFuente);
        resultado.innerText = JSON.stringify(faceLandmarkerResult, null, 2);
        
        const landmarksList = document.getElementById('landmarksList');
        const numPuntos = document.getElementById("numPuntos");
        landmarksList.innerHTML = '';
        
        if (faceLandmarkerResult.faceLandmarks && faceLandmarkerResult.faceLandmarks.length > 0) {
            const landmarks = faceLandmarkerResult.faceLandmarks[0];
            numPuntos.innerText = `(${landmarks.length})`;
            landmarks.forEach((landmark, index) => {
                const li = document.createElement('li');
                li.innerText = `#${index}: x=${landmark.x.toFixed(4)}, y=${landmark.y.toFixed(4)}, z=${landmark.z.toFixed(4)}`;
                landmarksList.appendChild(li);
            });
        } else {
             numPuntos.innerText = "(0)";
        }

        const blendshapesList = document.getElementById('blendshapesList');
        const numBlendshapes = document.getElementById('numBlendshapes');
        blendshapesList.innerHTML = '';
        
        if (faceLandmarkerResult.faceBlendshapes && faceLandmarkerResult.faceBlendshapes.length > 0) {
            const blendshapes = faceLandmarkerResult.faceBlendshapes[0].categories; 
            numBlendshapes.innerText = `(${blendshapes.length})`;
            blendshapes.sort((a, b) => b.score - a.score); 
            
            blendshapes.forEach((shape) => {
                const li = document.createElement('li');
                li.innerText = `${shape.categoryName}: ${shape.score.toFixed(4)}`;
                blendshapesList.appendChild(li);
            });
        } else {
            if (numBlendshapes) numBlendshapes.innerText = "(0)";
        }
            
            
        canvas.classList.remove("hidden");
        foto.classList.add("hidden");
        caraDetectada = true;

        if (caraDetectada) {
            drawFaceLandmarks(context, faceLandmarkerResult);
        }
    }


    // Intentamos acceder a la camara y mostramos una feed de video

    llamarCamaraVideo();

    btnCalibrar.addEventListener('click',(ev) => window.location.hash = "#/calibration")
    btnNoCalibrar.addEventListener('click',(ev)=> {
        divInstrucciones.classList.add("hidden");

        textoInstrucciones.innerText = ""
    })

    btnTiempoReal.addEventListener('click',(ev) => activarTiempoReal(ev))

    initExerciseLogic();


    
};


    
