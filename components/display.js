// En este componente se mostrará la imagen capturada
// y, cuando llegue el momento, la feed de video

import { obtenerEmocionAproximada } from "../services/gesture_recognition.js";
import {getFaceLandmarker, createFaceLandmarker, drawFaceLandmarks} from "../services/vision.js";
import { DrawingUtils } from "@mediapipe/tasks-vision";
import {getNeutralBaseline} from "../services/store.js";


// Este estilo de hacer los componentes lo he sacado de un tutorial de YouTube
// Es una manera mas corta de definir una funcion. "display" es el nombre, () son los argumentos que recibe,
// y la flecha "=>" indica que es una funcion. Luego, lo que va entre {} es lo que devuelve la funcion

// Se usan comillas `` para poder escribir HTML dentro de JavaScript sin que se rompa el codigo

const display = () => {
    return /* HTML */ `<div class="container mx-auto text-center">
        
        <h1 >Pulsa el botón para tomar una foto</h1>
        
        <div class="relative w-fit mx-auto my-4">
            <video id="video" class="block rounded-xl border-4 border-zinc-900">Captura de video no disponible</video>
            <canvas id="canvasTiempoReal" class="hidden absolute top-0 left-0 w-full h-full pointer-events-none rounded-xl"></canvas>
        </div>

        <div>
        <button class="material-icons rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white p-4" title="Permitir acceso a la cámara" id="permissions-button">video_camera_front</button>
        <button class= "material-icons rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white p-4" title="Tiempo real" id="btnTiempoReal">face_retouching_natural</button>
        </div>

        <canvas id="canvas" class="hidden mx-auto my-4 rounded-xl border-4 border-zinc-900"></canvas>
        

        <div class="container mx-auto mt-4">
            <h2 class="text-xl font-bold mb-2">Resultados de la detección:</h2>

            <div class="gap-4">
                <h3 class="font-bold mb-2">
                    <span id="emocionDetectada" class="text-sm font-normal"></span>
                </h3>

            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                <div class="border-2 border-zinc-900 rounded-xl p-4">
                    <h3 class="font-bold mb-2">Landmarks <span id="numPuntos" class="text-sm font-normal"></span></h3>
                    <div class="h-64 overflow-y-auto bg-gray-100 p-2 rounded border border-gray-300 font-mono text-xs">
                         <ul id="landmarksList" class="list-none"></ul>
                    </div>
                </div>

                <div class="border-2 border-zinc-900 rounded-xl p-4">
                    <h3 class="font-bold mb-2">Blendshapes <span id="numBlendshapes" class="text-sm font-normal"></span></h3>
                    <div class="h-64 overflow-y-auto bg-gray-100 p-2 rounded border border-gray-300 font-mono text-xs">
                        <ul id="blendshapesList" class="list-none"></ul>
                    </div>
                </div>
            </div>

            <details class="text-left mt-4 border-2 border-zinc-900 rounded-xl p-2">
                <summary class="cursor-pointer font-bold">Ver JSON completo</summary>
                <div class="bg-gray-100 p-4 rounded border border-gray-300 overflow-x-auto mt-2">
                    <pre id="resultado" class="text-xs"></pre>
                </div>
            </details>
        </div>
    </div>`;
};

export default display;



export const initDisplayLogic = async () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const videoTiempoReal = document.getElementById('videoTiempoReal');
    const canvasTiempoReal = document.getElementById('canvasTiempoReal');
    const contextTiempoReal = canvasTiempoReal.getContext('2d');

    const context = canvas.getContext("2d");
    //const foto = document.getElementById('foto');

    //const btnFoto = document.getElementById('btnFoto');
    const btnPermitir = document.getElementById("permissions-button");
    const btnDetectar = document.getElementById("btnDetectar");
    const btnTiempoReal = document.getElementById("btnTiempoReal");

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

    /*const tomarFoto = () => {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageURL = canvas.toDataURL('image/png');
        foto.setAttribute('src', imageURL);
    
        canvas.classList.add("hidden");
        foto.classList.remove("hidden");

        return imageURL;
    }*/

    /*const llamarFaceLandmarker = async (ev) => {
        if (!foto.src || foto.src.length === 0) {
            alert("Primero debes tomar una foto");
            return;
        }

        if (foto.classList.contains("hidden")) {
            alert("Primero debes tomar una foto");
            return;
        }
        detectarRostro(foto, faceLandmarker);
        ev.preventDefault();
    }*/

    const llamarCamaraVideo = async () => {
        navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        })
        .catch((error)  => {
            console.error("Error al acceder a la cámara: ", error);
        });
    }

    const activarTiempoReal = async (ev) => {

        console.log("Llamado a activarTiempoReal")

        if(!video.srcObject){
            alert("Primero debes permitir el acceso a la cámara");
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
                console.log("Valor calibrado correcto, Usando base neutral");
                // Si hay calibración, restamos el valor base a cada blendshape actual
                categoriasNormalizadas = results.faceBlendshapes[0].categories.map(shape => {
                    const baseScore = baseNeutral[shape.categoryName] || 0;
                    return {
                        categoryName: shape.categoryName,
                        displayName: shape.displayName,
                        // Math.max evita valores negativos si la expresión es más relajada que en la calibración
                        score: Math.max(0, shape.score - baseScore) 
                    };
                });
            } else {
                // Fallback de seguridad: si no se ha calibrado, usamos los valores puros
                console.log("<AVISO> Valor calibrado no encontrado");
                categoriasNormalizadas = [...results.faceBlendshapes[0].categories];
            }

            // 3. Reconstruimos una estructura clonada con los datos normalizados para el reconocedor
            const resultadoNormalizado = {
                ...results,
                faceBlendshapes: [{
                    categories: categoriasNormalizadas
                }]
            };

            const emocionAproximada = obtenerEmocionAproximada(resultadoNormalizado);
            emocionDetectada.innerText = emocionAproximada.emocion;

        
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


    // Mostrar el canvas vacio cuando no se haya tomado ninguna foto
    /*function clearFoto() {
        context.fillStyle = "#aaaaaa";
        context.fillRect(0, 0, canvas.width, canvas.height);
      
        const data = canvas.toDataURL("image/png");
        foto.setAttribute("src", data);
    }*/
    
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

    //clearFoto();

    // Intentamos acceder a la camara y mostramos una feed de video
    btnPermitir.addEventListener('click', () => llamarCamaraVideo());

    // Tomar foto al pulsar el boton
    /*btnFoto.addEventListener('click', (ev) => {
        if (video.srcObject == null) {
            clearFoto();
            alert("Primero debes permitir el acceso a la cámara");
            return;
        }
        imageURL = tomarFoto();
        
        ev.preventDefault();
    });*/

    // Llamar al facelandmarker al pulsar el boton
    //btnDetectar.addEventListener('click', (ev) => llamarFaceLandmarker(ev));

    btnTiempoReal.addEventListener('click',(ev) => activarTiempoReal(ev))


    
};


    
