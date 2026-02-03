// En este componente se mostrará la imagen capturada
// y, cuando llegue el momento, la feed de video

import {getFaceLandmarker, createFaceLandmarker, drawFaceLandmarks} from "../services/vision.js";
import { DrawingUtils } from "@mediapipe/tasks-vision";


// Este estilo de hacer los componentes lo he sacado de un tutorial de YouTube
// Es una manera mas corta de definir una funcion. "display" es el nombre, () son los argumentos que recibe,
// y la flecha "=>" indica que es una funcion. Luego, lo que va entre {} es lo que devuelve la funcion

// Se usan comillas `` para poder escribir HTML dentro de JavaScript sin que se rompa el codigo

const display = () => {
    return /* HTML */ `<div class="container mx-auto text-center">
        
        <h1 >Pulsa el botón para tomar una foto</h1>
        
        <video id="video" class="mx-auto my-4 rounded-xl border-4 border-zinc-900">Captura de video no disponible</video>

        <div>
        <button class="material-icons rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white p-4" title="Tomar foto" id="btnFoto">camera_alt</button>
        <button class="material-icons rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white p-4" title="Permitir acceso a la cámara" id="permissions-button">video_camera_front</button>
        </div>

        <canvas id="canvas" class="hidden mx-auto my-4 rounded-xl border-4 border-zinc-900"></canvas>
        <div class="output">
        <img id="foto" class ="mx-auto my-4 rounded-xl border-4 border-zinc-900" src="" alt="La imagen capturada aparecerá aquí" />
        </div>
        <button id="btnDetectar" class="material-icons rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white p-4" title="Detectar rostro">face</button>

        <div>
        <h2>Resultados de la detección:</h2>
        <h1 id="numPuntos">Numero de puntos detectados: </h1>
        <h1 id="resultado" class="my-4"></h1>
        </div>
    </div>`;
};

export default display;



export const initDisplayLogic = async () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext("2d");

    const foto = document.getElementById('foto');
    const btnFoto = document.getElementById('btnFoto');
    const btnPermitir = document.getElementById("permissions-button");
    const btnDetectar = document.getElementById("btnDetectar");
    let imageURL;
    let caraDetectada = false;
    const resultado = document.getElementById("resultado");
    const numPuntos = document.getElementById("numPuntos");

    await createFaceLandmarker();
    const drawingUtils = new DrawingUtils(context);
    let faceLandmarkerResult = undefined;

    const faceLandmarker = getFaceLandmarker();

    const tomarFoto = () => {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageURL = canvas.toDataURL('image/png');
        foto.setAttribute('src', imageURL);
    
        canvas.classList.add("hidden");
        foto.classList.remove("hidden");

        return imageURL;
    }

    // Mostrar el canvas vacio cuando no se haya tomado ninguna foto
    function clearFoto() {
        context.fillStyle = "#aaaaaa";
        context.fillRect(0, 0, canvas.width, canvas.height);
      
        const data = canvas.toDataURL("image/png");
        foto.setAttribute("src", data);
    }
    
    const detectarRostro = async (imagenFuente, faceLandmarker) => {
        if (!faceLandmarker) {
            console.error("Espera a que el Face Landmarker esté inicializado antes de clicar!");
            return;
        }
    
        faceLandmarkerResult = await faceLandmarker.detect(imagenFuente);
        resultado.innerText = JSON.stringify(faceLandmarkerResult, null, 2);
        numPuntos.innerText = `Número de puntos detectados: ${faceLandmarkerResult.faceLandmarks[0].length}`;
            
            
        canvas.classList.remove("hidden");
        foto.classList.add("hidden");
        caraDetectada = true;

        if (caraDetectada) {
            drawFaceLandmarks(context, faceLandmarkerResult);
        }
    }

    clearFoto();

    // Intentamos acceder a la camara y mostramos una feed de video
    btnPermitir.addEventListener('click', () => {
        navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
            video.srcObject = stream;
            video.play();
        })
        .catch((error)  => {
            console.error("Error al acceder a la cámara: ", error);
        });
    });

    // Tomar foto al pulsar el boton
    btnFoto.addEventListener('click', (ev) => {
        if (video.srcObject == null) {
            clearFoto();
            alert("Primero debes permitir el acceso a la cámara");
            return;
        }
        imageURL = tomarFoto();
        
        ev.preventDefault();
    });

    // Llamar al facelandmarker al pulsar el boton
    btnDetectar.addEventListener('click', (ev) => {
        if (!foto.src || foto.src.length === 0) {
            alert("Primero debes tomar una foto");
            return;
        }
        detectarRostro(foto, faceLandmarker);
        ev.preventDefault();
    });
};


    
