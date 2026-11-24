/* =========================================================
   COMPLEXLAB - NAVEGACIÓN PRINCIPAL
   Archivo: ./JS/scriptprincipal.js
   ========================================================= */

(() => {
    'use strict';

    // API REST desplegada en Render. Puede sobrescribirse antes de cargar este archivo.
    const API = (window.COMPLEXLAB_API_URL || 'https://complexlab-servidor.onrender.com')
        .replace(/\/+$/, '');

    let plantillaOriginalHeroContent = '';
    let plantillaHeroCompleta = '';
    let clasesOriginalesHero = 'hero';
    let navegacionInicializada = false;

    /* =====================================================
       OBTENER ELEMENTOS ACTUALES
       Se consultan cada vez para evitar referencias obsoletas.
       ===================================================== */

    function obtenerHero() {
        return document.querySelector('.hero');
    }

    function obtenerHeroContent() {
        return document.querySelector('.hero-content');
    }

    /* =====================================================
       CARGAR HOJAS DE ESTILO DINÁMICAS
       ===================================================== */

    function normalizarUrl(url) {
        if (!url) return '';

        try {
            // Las rutas relativas devueltas por Render deben resolverse contra la API,
            // no contra el dominio de GitHub Pages.
            return new URL(url, `${API}/`).href;
        } catch (error) {
            console.error('URL de recurso no válida:', url, error);
            return '';
        }
    }

    function cargarCSS(id, url) {
        if (!url) return;

        let enlace = document.getElementById(id);

        if (!enlace) {
            enlace = document.createElement('link');
            enlace.id = id;
            enlace.rel = 'stylesheet';
            document.head.appendChild(enlace);
        }

        enlace.href = normalizarUrl(url);
    }

    function limpiarCSSDinamico() {
        [
            'css-dinamico',
            'css-simulaciones',
            'css-sobrenosotros',
            'css-autenticacion',
            'css-mi-progreso'
        ].forEach(id => {
            document.getElementById(id)?.remove();
        });
    }

    /* =====================================================
       PREPARAR CONTENEDOR PARA LAS VISTAS
       ===================================================== */

    /* auth.js reemplaza todo <main> al abrir login/registro/mi progreso,
       y con eso desaparecen .hero y .hero-content. Si faltan, se
       reconstruyen desde la plantilla guardada al iniciar. */
    function asegurarHero() {
        if (obtenerHero() && obtenerHeroContent()) return true;

        const main = document.getElementById('main-content');
        if (!main || !plantillaHeroCompleta) return false;

        main.innerHTML = plantillaHeroCompleta;
        cargarConfiguracion();
        return true;
    }

    function prepararContenedor(claseModo = '') {
        asegurarHero();

        const hero = obtenerHero();
        const contenido = obtenerHeroContent();

        if (!hero || !contenido) {
            console.error('No se encontró .hero o .hero-content.');
            return null;
        }

        hero.className = clasesOriginalesHero || 'hero';

        if (claseModo) {
            hero.classList.add(claseModo);
        }

        contenido.style.width = '100%';
        contenido.style.background = 'transparent';
        contenido.style.border = 'none';
        contenido.style.backdropFilter = 'none';

        return { hero, contenido };
    }

    /* =====================================================
       EJECUTAR SCRIPTS INCLUIDOS EN HTML DINÁMICO
       ===================================================== */

    async function ejecutarScriptsVista(contenedor) {
        const scripts = Array.from(contenedor.querySelectorAll('script'));

        for (const scriptAnterior of scripts) {
            const scriptNuevo = document.createElement('script');

            Array.from(scriptAnterior.attributes).forEach(atributo => {
                scriptNuevo.setAttribute(atributo.name, atributo.value);
            });

            if (scriptAnterior.getAttribute('src')) {
                scriptNuevo.src = normalizarUrl(scriptAnterior.getAttribute('src'));
                if (!scriptNuevo.src) continue;

                await new Promise((resolve, reject) => {
                    scriptNuevo.onload = resolve;
                    scriptNuevo.onerror = () => reject(
                        new Error(`No se pudo cargar el script: ${scriptNuevo.src}`)
                    );

                    document.body.appendChild(scriptNuevo);
                }).catch(error => console.error(error));
            } else {
                scriptNuevo.textContent = scriptAnterior.textContent;
                document.body.appendChild(scriptNuevo);
                scriptNuevo.remove();
            }
        }
    }

    /* =====================================================
       SOLICITAR UNA VISTA A LA API
       ===================================================== */

    async function solicitarVista(endpoint) {
        const url = normalizarUrl(endpoint);

        if (!url) {
            throw new Error('No se pudo construir la URL de la API.');
        }

        const respuesta = await fetch(url, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!respuesta.ok) {
            throw new Error(
                `Error HTTP ${respuesta.status} al consultar ${url}`
            );
        }

        const tipoContenido = respuesta.headers.get('content-type') || '';
        if (!tipoContenido.includes('application/json')) {
            const contenido = await respuesta.text();
            throw new Error(
                `La API no devolvió JSON en ${url}. Respuesta: ${contenido.slice(0, 180)}`
            );
        }

        return respuesta.json();
    }

    /* =====================================================
       MOSTRAR SOBRE NOSOTROS
       ===================================================== */

    async function mostrarSobreNosotros() {
        try {
            const datos = await solicitarVista('/api/sobre-nosotros');

            if (!datos.html) {
                throw new Error('La API no devolvió el HTML de Sobre Nosotros.');
            }

            limpiarCSSDinamico();

            const contenedores = prepararContenedor('modo-sobrenosotros');

            if (!contenedores) return;

            cargarCSS('css-sobrenosotros', datos.cssUrl);

            contenedores.contenido.innerHTML = datos.html;

            await ejecutarScriptsVista(contenedores.contenido);
        } catch (error) {
            console.error('Error al cargar Sobre Nosotros:', error);
            mostrarError('No se pudo cargar la sección Sobre Nosotros.');
        }
    }
    /* =====================================================
       MOSTRAR SIMULACIONES
       ===================================================== */

    async function mostrarSimulaciones() {
        try {
            const datos = await solicitarVista('/api/simulaciones');

            if (!datos.html) {
                throw new Error('La API no devolvió el HTML de Simulaciones.');
            }

            limpiarCSSDinamico();

            const contenedores = prepararContenedor('modo-simulaciones');

            if (!contenedores) return;

            cargarCSS('css-simulaciones', datos.cssUrl);

            contenedores.contenido.innerHTML = datos.html;

            await ejecutarScriptsVista(contenedores.contenido);
        } catch (error) {
            console.error('Error al cargar Simulaciones:', error);
            mostrarError('No se pudieron cargar las simulaciones.');
        }
    }

    /* =====================================================
       MOSTRAR VARIABLE COMPLEJA
       ===================================================== */

    async function mostrarVariableCompleja() {
        try {
            const datos = await solicitarVista('/api/variable-compleja');

            if (!datos.html) {
                throw new Error('La API no devolvió el HTML de Variable Compleja.');
            }

            limpiarCSSDinamico();

            const contenedores = prepararContenedor('modo-variablecompleja');

            if (!contenedores) return;

            cargarCSS('css-dinamico', datos.cssUrl);

            contenedores.contenido.innerHTML = datos.html;

            await ejecutarScriptsVista(contenedores.contenido);
        } catch (error) {
            console.error('Error al cargar Variable Compleja:', error);
            mostrarError('No se pudo cargar la sección de Variable Compleja.');
        }
    }

    /* =====================================================
       MOSTRAR MI PROGRESO
       ===================================================== */

    async function mostrarMiProgreso() {
        const usuario = sessionStorage.getItem('complexlab_usuario');

        if (!usuario) {
            alert('Debes iniciar sesión para ver tu progreso.');
            if (typeof abrirInicioSesion === 'function') {
                abrirInicioSesion();
            }
            return;
        }

        try {
            const datos = await solicitarVista('/api/mi-progreso');

            if (!datos.html) {
                throw new Error('La API no devolvió el HTML de Mi progreso.');
            }

            limpiarCSSDinamico();

            const contenedores = prepararContenedor('modo-miprogreso');

            if (!contenedores) return;

            cargarCSS('css-mi-progreso', datos.cssUrl);

            contenedores.contenido.innerHTML = datos.html;

            await ejecutarScriptsVista(contenedores.contenido);
        } catch (error) {
            console.error('Error al cargar Mi progreso:', error);
            mostrarError('No se pudo cargar la sección de Mi progreso.');
        }
    }

    /* =====================================================
       RESTAURAR LA PÁGINA DE INICIO
       ===================================================== */

    function volverAlInicio() {
        limpiarCSSDinamico();

        const contenedores = prepararContenedor();

        if (!contenedores) return;

        contenedores.contenido.innerHTML = plantillaOriginalHeroContent;

        contenedores.contenido.style.width = '';
        contenedores.contenido.style.background = '';
        contenedores.contenido.style.border = '';
        contenedores.contenido.style.backdropFilter = '';

        cargarConfiguracion();
        window.scrollTo({ top: 0, behavior: 'auto' });
    }

    /* =====================================================
       CARGAR FONDO ANIMADO
       ===================================================== */

    async function cargarConfiguracion() {
        try {
            const datos = await solicitarVista('/api/configuracion');
            const frame = document.getElementById('frame-fondo');

            if (frame && datos.fondoAnimado) {
                frame.src = normalizarUrl(datos.fondoAnimado);
            }
        } catch (error) {
            console.error('Error al cargar el fondo:', error);
        }
    }

    /* =====================================================
       MENSAJES DE ERROR
       ===================================================== */

    function mostrarError(mensaje) {
        asegurarHero();
        const contenido = obtenerHeroContent();

        if (!contenido) return;

        contenido.innerHTML = `
            <div class="error-vista" role="alert">
                <h2>${mensaje}</h2>
                <button type="button" id="btn-reintentar-inicio">
                    Volver al inicio
                </button>
            </div>
        `;
    }

    /* =====================================================
       CARGAR UNA SIMULACIÓN DESDE LAS TARJETAS
       La API proporciona la ruta del endpoint del juego.
       ===================================================== */

    window.irASimulacion = async function (event, urlEndpoint) {
        if (event) event.preventDefault();

        if (!urlEndpoint) {
            console.error('No se proporcionó el endpoint de la simulación.');
            return;
        }

        try {
            const datos = await solicitarVista(urlEndpoint);

            if (!datos.html) {
                throw new Error('La API no devolvió el HTML del juego.');
            }

            const contenedores = prepararContenedor('modo-simulaciones');

            if (!contenedores) return;

            contenedores.contenido.innerHTML = datos.html;

            await ejecutarScriptsVista(contenedores.contenido);
        } catch (error) {
            console.error('Error al abrir la simulación:', error);
            mostrarError('No se pudo abrir esta simulación.');
        }
    };

    /* =====================================================
       NAVEGACIÓN POR DELEGACIÓN DE EVENTOS
       Funciona aunque auth.js reemplace los enlaces del menú.
       ===================================================== */

    function configurarNavegacion() {
        if (navegacionInicializada) return;

        navegacionInicializada = true;

        document.addEventListener('click', async event => {
            const objetivo = event.target;

            if (!(objetivo instanceof Element)) return;

            /* Logo */
            const logo = objetivo.closest('#btn-inicio, .logo');

            if (logo) {
                event.preventDefault();
                volverAlInicio();
                return;
            }

            /* Botón de regresar al inicio tras un error */
            if (objetivo.closest('#btn-reintentar-inicio')) {
                event.preventDefault();
                volverAlInicio();
                return;
            }

            /* Solo atender enlaces de la barra principal */
            const enlace = objetivo.closest('header .nav-links a');

            if (!enlace) return;

            const texto = enlace.textContent.trim()
                .toLocaleLowerCase('es');

            /* Sobre Nosotros */
            if (texto === 'sobre nosotros') {
                event.preventDefault();
                await mostrarSobreNosotros();
                return;
            }

            /* Simulaciones */
            if (
                enlace.id === 'btn-simulaciones' ||
                texto === 'simulaciones'
            ) {
                event.preventDefault();
                await mostrarSimulaciones();
                return;
            }

            /* Variable Compleja dentro de Teoría */
            if (
                enlace.id === 'btn-variable-compleja' ||
                texto === 'variable compleja'
            ) {
                event.preventDefault();
                await mostrarVariableCompleja();
                return;
            }

            /* Mi progreso */
            if (
                enlace.id === 'btn-mi-progreso' ||
                texto === 'mi progreso'
            ) {
                event.preventDefault();
                await mostrarMiProgreso();
            }
        });

        /* Reducir el encabezado al desplazarse */
        window.addEventListener('scroll', () => {
            const header = document.querySelector('header');

            if (!header) return;

            header.style.padding = window.scrollY > 50 ? '5px 0' : '0';
        });
    }

    /* =====================================================
       INICIALIZACIÓN
       ===================================================== */

    function inicializar() {
        const contenido = obtenerHeroContent();
        const hero = obtenerHero();

        if (contenido) {
            plantillaOriginalHeroContent = contenido.innerHTML;
        }

        if (hero) {
            clasesOriginalesHero = hero.className || 'hero';
            plantillaHeroCompleta = hero.outerHTML;
        }

        configurarNavegacion();
        cargarConfiguracion();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar, {
            once: true
        });
    } else {
        inicializar();
    }

})();

