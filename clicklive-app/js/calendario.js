// ======================================================
// CLICKLIVE - CALENDARIO FASE 1
// ======================================================

const estadoCalendario = {
    fechaVista: new Date(),
    fechaSeleccionada: "",
    eventos: [],
    notas: [],
    archivos: []
};

const mesesCalendario = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
];

function $(id) {
    return document.getElementById(id);
}

function emailActivo() {
    return localStorage.getItem("email");
}

function fechaLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function normalizarFecha(fecha) {
    if (!fecha) return "";
    return String(fecha).slice(0, 10);
}

function normalizarHora(hora) {
    if (!hora) return "";
    return String(hora).slice(0, 5);
}

function mostrarToastCalendario(mensaje) {
    const toast = $("toastCalendario");
    if (!toast) return;

    toast.textContent = mensaje;
    toast.classList.add("activo");

    setTimeout(() => {
        toast.classList.remove("activo");
    }, 2200);
}

async function apiCalendario(ruta, opciones = {}) {
    const respuesta = await fetch(API_URL + ruta, opciones);
    return respuesta.json();
}

function eventosPorFecha(fecha) {
    return estadoCalendario.eventos.filter(evento => {
        return normalizarFecha(evento.fecha) === fecha;
    });
}

function contarEventosFecha(fecha) {
    return eventosPorFecha(fecha).length;
}

function seleccionarFecha(fecha) {
    estadoCalendario.fechaSeleccionada = fecha;
    renderCalendario();
    renderAgenda();
}

function cambiarMes(delta) {
    estadoCalendario.fechaVista = new Date(
        estadoCalendario.fechaVista.getFullYear(),
        estadoCalendario.fechaVista.getMonth() + delta,
        1
    );

    renderCalendario();
}

function renderCalendario() {
    const grid = $("calGrid");
    const titulo = $("tituloMes");

    if (!grid || !titulo) return;

    const year = estadoCalendario.fechaVista.getFullYear();
    const month = estadoCalendario.fechaVista.getMonth();
    const hoy = fechaLocal(new Date());

    titulo.textContent = `${mesesCalendario[month]} ${year}`;
    grid.innerHTML = "";

    const primerDia = new Date(year, month, 1).getDay();
    const diasMes = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < primerDia; i++) {
        const vacio = document.createElement("div");
        vacio.className = "cal-day cal-day-empty";
        grid.appendChild(vacio);
    }

    for (let dia = 1; dia <= diasMes; dia++) {
        const fecha = fechaLocal(new Date(year, month, dia));
        const total = contarEventosFecha(fecha);

        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "cal-day";
        boton.dataset.fecha = fecha;
        boton.innerHTML = `
            <span>${dia}</span>
            ${total > 0 ? `<strong>${total}</strong>` : ""}
        `;

        if (fecha === hoy) {
            boton.classList.add("hoy");
        }

        if (fecha === estadoCalendario.fechaSeleccionada) {
            boton.classList.add("seleccionado");
        }

        if (total > 0) {
            boton.classList.add("con-eventos");
        }

        boton.addEventListener("click", () => {
            seleccionarFecha(fecha);
        });

        grid.appendChild(boton);
    }
}

function renderAgenda() {
    const titulo = $("tituloAgenda");
    const contador = $("contadorEventos");
    const lista = $("listaEventosDia");

    if (!titulo || !contador || !lista) return;

    const fecha = estadoCalendario.fechaSeleccionada || fechaLocal(new Date());
    const eventos = eventosPorFecha(fecha);

    titulo.textContent = fecha;
    contador.textContent = String(eventos.length);
    lista.innerHTML = "";

    if (eventos.length === 0) {
        lista.innerHTML = `
            <div class="cal-empty">
                No hay actividades para este dia
            </div>
        `;
        return;
    }

    eventos.forEach(evento => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "cal-event-card";
        item.innerHTML = `
            <div>
                <span class="cal-chip">${evento.tipo || "Otro"}</span>
                <h3>${evento.titulo}</h3>
                <p>${normalizarHora(evento.hora) || "Sin hora"} · ${evento.estado || "Pendiente"}</p>
            </div>
            <div class="cal-event-meta">
                <span>${evento.prioridad || "Media"}</span>
                <small>${evento.total_notas || 0}N · ${evento.total_archivos || 0}A</small>
            </div>
        `;

        item.addEventListener("click", () => {
            abrirEventoExistente(evento.id);
        });

        lista.appendChild(item);
    });
}

function renderCatalogos() {
    renderListaNotas([]);
    renderListaArchivos([]);
}

function crearCheckboxItem({ id, titulo, subtitulo, ruta, checked, name }) {

    const label = document.createElement("label");
    label.className = "cal-check-item";

const esImagen =
    ruta &&
    subtitulo &&
    subtitulo.startsWith("image");

const esVideo =
    ruta &&
    subtitulo &&
    subtitulo.startsWith("video");

    label.innerHTML = `
        <input type="checkbox"
               name="${name}"
               value="${id}"
               ${checked ? "checked" : ""}>

        <span>

            ${
    esImagen
        ? `<img
                src="${API_URL}${ruta}"
                class="cal-preview-img">`

        : esVideo

        ? `<video
                class="cal-preview-img"
                src="${API_URL}${ruta}"
                muted
                playsinline
                controls
                preload="metadata">
           </video>`

        : ""
}

            <strong>${titulo}</strong>

            ${
                subtitulo
                    ? `<small>${subtitulo}</small>`
                    : ""
            }

        </span>
    `;

    return label;
}

function renderListaNotas(seleccionadas) {
    const lista = $("listaNotas");
    const total = $("totalNotas");

    if (!lista || !total) return;

    lista.innerHTML = "";
    total.textContent = String(estadoCalendario.notas.length);

    if (estadoCalendario.notas.length === 0) {
        lista.innerHTML = `<p class="cal-list-empty">No hay notas disponibles</p>`;
        return;
    }

    estadoCalendario.notas.forEach(nota => {
        lista.appendChild(
            crearCheckboxItem({
                id: nota.id,
                titulo: nota.texto || "Nota sin texto",
                subtitulo: "",
                checked: seleccionadas.includes(Number(nota.id)),
                name: "notasEvento"
            })
        );
    });
}

function renderListaArchivos(seleccionados) {
    const lista = $("listaArchivos");
    const total = $("totalArchivos");

    if (!lista || !total) return;

    lista.innerHTML = "";
    total.textContent = String(estadoCalendario.archivos.length);

    if (estadoCalendario.archivos.length === 0) {
        lista.innerHTML = `<p class="cal-list-empty">No hay archivos disponibles</p>`;
        return;
    }
    
    
    estadoCalendario.archivos.forEach(archivo => {
        lista.appendChild(
            crearCheckboxItem({
                id: archivo.id,
                titulo: archivo.nombre || "Archivo",
                subtitulo: archivo.tipo || "",
                ruta: archivo.ruta,
                checked: seleccionados.includes(Number(archivo.id)),
                name: "archivosEvento"
            })
        );
    });
}

function idsSeleccionados(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
        .map(input => Number(input.value));
}

function limpiarFormulario() {
    $("eventoId").value = "";
    $("eventoTitulo").value = "";
    $("eventoDescripcion").value = "";
    $("eventoFecha").value = estadoCalendario.fechaSeleccionada || fechaLocal(new Date());
    $("eventoHora").value = "";
    $("eventoTipo").value = "Publicacion";
    $("eventoEstado").value = "Pendiente";
    $("eventoPrioridad").value = "Media";
    $("eventoRecordatorio").value = "Sin recordatorio";
    $("btnEliminarEvento").style.display = "none";

    renderListaNotas([]);
    renderListaArchivos([]);
}

function abrirModalNuevo() {
    limpiarFormulario();
    $("tituloModal").textContent = "Nueva actividad";
    $("modalEvento").classList.add("activo");
    $("modalEvento").setAttribute("aria-hidden", "false");
}

function cerrarModalEvento() {
    $("modalEvento").classList.remove("activo");
    $("modalEvento").setAttribute("aria-hidden", "true");
}

async function abrirEventoExistente(id) {
    try {
        const email = encodeURIComponent(emailActivo());
        const data = await apiCalendario(`/calendario/eventos/${id}?email=${email}`);

        if (!data.success) {
            mostrarToastCalendario(data.mensaje || "No fue posible abrir");
            return;
        }

        const evento = data.evento;
        const notas = (evento.notas || []).map(nota => Number(nota.id));
        const archivos = (evento.archivos || []).map(archivo => Number(archivo.id));

        $("eventoId").value = evento.id;
        $("eventoTitulo").value = evento.titulo || "";
        $("eventoDescripcion").value = evento.descripcion || "";
        $("eventoFecha").value = normalizarFecha(evento.fecha);
        $("eventoHora").value = normalizarHora(evento.hora);
        $("eventoTipo").value = evento.tipo || "Otro";
        $("eventoEstado").value = evento.estado || "Pendiente";
        $("eventoPrioridad").value = evento.prioridad || "Media";
        $("eventoRecordatorio").value = evento.recordatorio || "Sin recordatorio";
        $("btnEliminarEvento").style.display = "block";

        renderListaNotas(notas);
        renderListaArchivos(archivos);

        $("tituloModal").textContent = "Editar actividad";
        $("modalEvento").classList.add("activo");
        $("modalEvento").setAttribute("aria-hidden", "false");

    } catch (error) {
        console.log(error);
        mostrarToastCalendario("Error de conexion");
    }
}

function payloadFormulario() {
    return {
        email: emailActivo(),
        titulo: $("eventoTitulo").value.trim(),
        descripcion: $("eventoDescripcion").value.trim(),
        fecha: $("eventoFecha").value,
        hora: $("eventoHora").value,
        tipo: $("eventoTipo").value,
        estado: $("eventoEstado").value,
        prioridad: $("eventoPrioridad").value,
        recordatorio: $("eventoRecordatorio").value,
        notas: idsSeleccionados("notasEvento"),
        archivos: idsSeleccionados("archivosEvento")
    };
}

async function guardarEvento(event) {
    event.preventDefault();

    const id = $("eventoId").value;
    const payload = payloadFormulario();

    if (!payload.titulo || !payload.fecha) {
        mostrarToastCalendario("Titulo y fecha son obligatorios");
        return;
    }

    const ruta = id ? `/calendario/eventos/${id}` : "/calendario/eventos";
    const metodo = id ? "PUT" : "POST";

    try {
        const data = await apiCalendario(ruta, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!data.success) {
            mostrarToastCalendario(data.mensaje || "No fue posible guardar");
            return;
        }

        estadoCalendario.fechaSeleccionada = payload.fecha;
        estadoCalendario.fechaVista = new Date(
            Number(payload.fecha.slice(0, 4)),
            Number(payload.fecha.slice(5, 7)) - 1,
            1
        );

        cerrarModalEvento();
        await cargarEventos();
        mostrarToastCalendario("Actividad guardada");

    } catch (error) {
        console.log(error);
        mostrarToastCalendario("Error de conexion");
    }
}

async function eliminarEventoActual() {
    const id = $("eventoId").value;

    if (!id) return;

    const confirmar = confirm("Eliminar esta actividad?");

    if (!confirmar) return;

    try {
        const email = encodeURIComponent(emailActivo());
        const data = await apiCalendario(`/calendario/eventos/${id}?email=${email}`, {
            method: "DELETE"
        });

        if (!data.success) {
            mostrarToastCalendario("No fue posible eliminar");
            return;
        }

        cerrarModalEvento();
        await cargarEventos();
        mostrarToastCalendario("Actividad eliminada");

    } catch (error) {
        console.log(error);
        mostrarToastCalendario("Error de conexion");
    }
}

async function cargarEventos() {
    const email = emailActivo();

    if (!email) {
        window.location.href = "login.html";
        return;
    }

    try {
        const data = await apiCalendario(`/calendario/eventos?email=${encodeURIComponent(email)}`);

        if (!data.success) {
            estadoCalendario.eventos = [];
            mostrarToastCalendario(data.mensaje || "No fue posible cargar eventos");
        } else {
            estadoCalendario.eventos = data.eventos || [];
        }

        renderCalendario();
        renderAgenda();

    } catch (error) {
        console.log(error);
        mostrarToastCalendario("Error al cargar calendario");
    }
}

async function cargarCatalogos() {
    try {
        const [notasData, archivosData] = await Promise.all([
            apiCalendario("/calendario/notas"),
            apiCalendario("/calendario/archivos")
        ]);

        estadoCalendario.notas = notasData.success ? notasData.notas : [];
        estadoCalendario.archivos = archivosData.success ? archivosData.archivos : [];

        renderCatalogos();

    } catch (error) {
        console.log(error);
        estadoCalendario.notas = [];
        estadoCalendario.archivos = [];
        renderCatalogos();
    }
}

function iniciarCalendario() {
    estadoCalendario.fechaSeleccionada = fechaLocal(new Date());

    $("btnNuevaActividad").addEventListener("click", abrirModalNuevo);
    $("btnMesAnterior").addEventListener("click", () => cambiarMes(-1));
    $("btnMesSiguiente").addEventListener("click", () => cambiarMes(1));
    $("btnCerrarModal").addEventListener("click", cerrarModalEvento);
    $("btnEliminarEvento").addEventListener("click", eliminarEventoActual);
    $("formEvento").addEventListener("submit", guardarEvento);

    $("modalEvento").addEventListener("click", event => {
        if (event.target.id === "modalEvento") {
            cerrarModalEvento();
        }
    });

    cargarCatalogos();
    cargarEventos();
}

document.addEventListener("DOMContentLoaded", iniciarCalendario);
