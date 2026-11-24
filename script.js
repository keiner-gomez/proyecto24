// Elementos del HTML
const formulario = document.getElementById("formularioHistoria");
const listaHistorias = document.getElementById("listaHistorias");
const mensaje = document.getElementById("mensaje");
const visor = document.getElementById("visor");
const contenidoHistoria = document.getElementById("contenidoHistoria");
const barrasProgreso = document.getElementById("barrasProgreso");
const datosAutor = document.getElementById("datosAutor");

// Variables
let historias = JSON.parse(localStorage.getItem("historias24h")) || [];
let indiceActual = 0;
let temporizador = null;

const DURACION_HISTORIA = 3000;

let posicionInicialX = 0;


// Eliminar historias después de 24 horas
function eliminarHistoriasVencidas() {

    const ahora = Date.now();

    const duracion = 24 * 60 * 60 * 1000;

    historias = historias.filter(function(historia) {

        return ahora - historia.fecha < duracion;

    });

    guardarHistorias();

}


// Guardar historias en el navegador
function guardarHistorias() {

    localStorage.setItem("historias24h", JSON.stringify(historias));

}


// Calcular tiempo transcurrido
function tiempoTranscurrido(fecha) {

    const minutos = Math.floor((Date.now() - fecha) / 60000);

    if (minutos < 1) {
        return "Ahora";
    }

    if (minutos < 60) {
        return `Hace ${minutos} min`;
    }

    return `Hace ${Math.floor(minutos / 60)} h`;

}


// Mostrar historias en la página
function mostrarHistorias() {

    listaHistorias.innerHTML = "";

    historias.forEach(function(historia, indice) {

        const elemento = document.createElement("button");

        elemento.type = "button";
        elemento.className = "historia-item";

        const foto = historia.imagen
            ? `<img src="${historia.imagen}" alt="">`
            : "○";

        elemento.innerHTML = `
            <span class="foto-historia ${historia.vista ? "vista" : ""}">
                <span class="foto-interior">${foto}</span>
            </span>
            <span class="nombre-historia">${historia.nombre}</span>
        `;

        elemento.addEventListener("click", function() {

            abrirHistoria(indice);

        });

        listaHistorias.appendChild(elemento);

    });

}


// Mostrar formulario al pulsar +
document.getElementById("crearRapido").addEventListener("click", function() {

    document.getElementById("formularioSeccion").classList.toggle("mostrar");

});

// Ocultar formulario
document.getElementById("cancelar").addEventListener("click", function() {

    document.getElementById("formularioSeccion").classList.remove("mostrar");

});


// Publicar una historia
formulario.addEventListener("submit", function(evento) {

    evento.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();

    const texto = document.getElementById("texto").value.trim();

    const archivo = document.getElementById("imagen").files[0];

    if (!nombre || !texto) {

        mensaje.textContent = "Completa todos los campos.";

        return;

    }

    if (archivo) {

        if (!archivo.type.startsWith("image/")) {

            mensaje.textContent = "Selecciona una imagen válida.";

            return;

        }

        if (archivo.size > 2 * 1024 * 1024) {

            mensaje.textContent = "La imagen debe pesar menos de 2 MB.";

            return;

        }

        const lector = new FileReader();

        lector.onload = function() {

            crearHistoria(nombre, texto, lector.result);

        };

        lector.readAsDataURL(archivo);

    } else {

        crearHistoria(nombre, texto, "");

    }

});


// Crear y guardar una nueva historia
function crearHistoria(nombre, texto, imagen) {

    const nuevaHistoria = {

        nombre: nombre,

        texto: texto,

        imagen: imagen,

        fecha: Date.now(),

        vista: false

    };

    historias.unshift(nuevaHistoria);

    guardarHistorias();

    mostrarHistorias();

    formulario.reset();

    mensaje.textContent = "¡Historia publicada correctamente!";

}


// Abrir el visor
function abrirHistoria(indice) {

    indiceActual = indice;

    visor.classList.remove("oculto");

    mostrarHistoriaActual();

}


// Crear barras de progreso
function crearBarrasProgreso() {

    barrasProgreso.innerHTML = "";

    historias.forEach(function(historia, indice) {

        const segmento = document.createElement("div");

        segmento.className = "segmento-progreso";

        if (indice < indiceActual) {

            segmento.classList.add("completado");

        }

        const relleno = document.createElement("span");

        segmento.appendChild(relleno);

        barrasProgreso.appendChild(segmento);

    });

}


// Mostrar historia actual
function mostrarHistoriaActual() {

    clearTimeout(temporizador);

    const historia = historias[indiceActual];

    if (!historia) {

        cerrarVisor();

        return;

    }

    historia.vista = true;

    guardarHistorias();

    mostrarHistorias();

    crearBarrasProgreso();

    datosAutor.innerHTML = `
        ${historia.nombre}
        <small>${tiempoTranscurrido(historia.fecha)}</small>
    `;

    contenidoHistoria.innerHTML = "";

    // Mostrar imagen si existe
    if (historia.imagen) {

        const imagen = document.createElement("img");

        imagen.src = historia.imagen;

        imagen.alt = "Imagen de la historia";

        contenidoHistoria.appendChild(imagen);

    }

    // Mostrar texto
    const texto = document.createElement("p");

    texto.textContent = historia.texto;

    contenidoHistoria.appendChild(texto);


    // Animar barra de progreso
    const barraActual = barrasProgreso.children[indiceActual].querySelector("span");

    barraActual.style.transition = `width ${DURACION_HISTORIA}ms linear`;

    requestAnimationFrame(function() {

        requestAnimationFrame(function() {

            barraActual.style.width = "100%";

        });

    });


    // Pasar a la siguiente historia después de 3 segundos
    temporizador = setTimeout(function() {

        siguienteHistoria();

    }, DURACION_HISTORIA);

}


// Pasar a la siguiente historia
function siguienteHistoria() {

    if (indiceActual < historias.length - 1) {

        indiceActual++;

        mostrarHistoriaActual();

    } else {

        cerrarVisor();

    }

}


// Regresar a la historia anterior
function historiaAnterior() {

    if (indiceActual > 0) {

        indiceActual--;

        mostrarHistoriaActual();

    }

}


// Cerrar visor
function cerrarVisor() {

    clearTimeout(temporizador);

    visor.classList.add("oculto");

}


// Botones de navegación
document.getElementById("cerrarVisor").addEventListener("click", cerrarVisor);

document.getElementById("zonaAnterior").addEventListener("click", historiaAnterior);

document.getElementById("zonaSiguiente").addEventListener("click", siguienteHistoria);


// Detectar movimiento del dedo para cambiar historias
document.getElementById("visorContenido").addEventListener("touchstart", function(evento) {

    posicionInicialX = evento.changedTouches[0].screenX;

}, { passive: true });


document.getElementById("visorContenido").addEventListener("touchend", function(evento) {

    const posicionFinalX = evento.changedTouches[0].screenX;

    const diferencia = posicionFinalX - posicionInicialX;

    if (Math.abs(diferencia) > 50) {

        if (diferencia < 0) {

            siguienteHistoria();

        } else {

            historiaAnterior();

        }

    }

}, { passive: true });


// Cerrar al pulsar fuera del visor
visor.addEventListener("click", function(evento) {

    if (evento.target === visor) {

        cerrarVisor();

    }

});


// Iniciar aplicación
eliminarHistoriasVencidas();

mostrarHistorias();


// Revisar historias vencidas cada minuto
setInterval(function() {

    eliminarHistoriasVencidas();

    mostrarHistorias();

    if (!visor.classList.contains("oculto") && !historias[indiceActual]) {

        cerrarVisor();

    }

}, 60000);