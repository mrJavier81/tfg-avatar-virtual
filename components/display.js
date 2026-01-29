// En este componente se mostrará la imagen capturada
// y, cuando llegue el momento, la feed de video


// Este estilo de hacer los componentes lo he sacado de un tutorial de YouTube
// Es una manera mas corta de definir una funcion. "display" es el nombre, () son los argumentos que recibe,
// y la flecha "=>" indica que es una funcion. Luego, lo que va entre {} es lo que devuelve la funcion

// Se usan comillas `` para poder escribir HTML dentro de JavaScript sin que se rompa el codigo

const display = () => {
    return /* HTML */ `<div class="container mx-auto text-center">
        <h1 >Pulsa el botón para tomar una foto</h1>

        <button class="rounded-xl bg-zinc-900 hover:bg-zinc-700 text-white " id="btnFoto">Tomar foto</button>
    </div>`;
};

export default display;