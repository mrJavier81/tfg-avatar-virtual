import mainMenu, { initMainMenuLogic } from "./components/mainMenu.js"
import display, { initDisplayLogic } from "./components/display.js"


const routes = {
    '/': {
        render: mainMenu,
        init: initMainMenuLogic
    },
    '/display': {
        render: display,
        init: initDisplayLogic
    },
    // '/recon': { render: reconMenu, init: reconInit }, // TODO: Descomentar cuando esté
    '404': {
        render: () => '<h2 class="text-center mt-10 text-2xl font-bold">404 - Página no encontrada</h2>',
        init: () => {}
    }

}

export default initRouter;

export function router() {
    const path = window.location.hash.slice(1) || '/'; 
    const root = document.getElementById('root');
    
    const routeInfo = routes[path] || routes['404'];
    
    root.innerHTML = routeInfo.render();
    
    routeInfo.init();
}

export function initRouter() {
    window.addEventListener('hashchange', router);
    
    router();
}