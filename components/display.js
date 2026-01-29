// En este componente se mostrará la imagen capturada
// y, cuando llegue el momento, la feed de video


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

        <canvas id="canvas" class="hidden "></canvas>
        <div class="output">
        <img id="foto" class ="mx-auto my-4 rounded-xl border-4 border-zinc-900" src="" alt="La imagen capturada aparecerá aquí" />
        </div>
    </div>`;
};

export default display;



export const initDisplayLogic = () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const foto = document.getElementById('foto');
    const btnFoto = document.getElementById('btnFoto');
    const btnPermitir = document.getElementById("permissions-button");

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

    btnFoto.addEventListener('click', (ev) => {
        tomarFoto();
        ev.preventDefault();
    });
};

function clearFoto() {
  const context = canvas.getContext("2d");
  context.fillStyle = "#aaaaaa";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const data = canvas.toDataURL("image/png");
  photo.setAttribute("src", data);
}

const tomarFoto = () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageURL = canvas.toDataURL('image/png');
    foto.setAttribute('src', imageURL);
    }

    
