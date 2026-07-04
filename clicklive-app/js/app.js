// ==========================
// PROTECCIÓN DE SESIÓN (ORIGINAL)
// ==========================
(function () {

    const usuario = localStorage.getItem("usuario");

    const paginasPublicas = ["login.html", "index.html", "registro.html"];
    const paginaActual = window.location.pathname.split("/").pop();

    if (!usuario && !paginasPublicas.includes(paginaActual)) {
        window.location.href = "login.html";
    }

})();


// =======================
//  INICIO GLOBAL (todas las pantallas)
// =======================

window.onload = function () {

    const usuario = localStorage.getItem("usuario");
    const foto = localStorage.getItem("foto");
    const redesGuardadas = JSON.parse(localStorage.getItem("redes") || "[]");

    if (usuario && document.getElementById("nombreUsuarioTexto")) {
        document.getElementById("nombreUsuarioTexto").innerText = usuario;
    }

    if (foto && document.getElementById("preview")) {
        document.getElementById("preview").src = foto;
    }

    if (usuario && document.getElementById("usuarioTexto")) {
        document.getElementById("usuarioTexto").innerText = usuario;
    }

    if (foto && document.getElementById("fotoDashboard")) {
        document.getElementById("fotoDashboard").src = foto;
    }

    if (redesGuardadas.length > 0) {
        redesSeleccionadas = redesGuardadas;

        const iconos = document.querySelectorAll(".redes-grid img");

        iconos.forEach(icono => {
            const red = icono.getAttribute("data-red");
            if (redesSeleccionadas.includes(red)) {
                icono.classList.add("activa");
            }
        });
    }
};
//=======================
// FIN GLOBAL
// =======================


// =======================
// INICIO LOGIN
// =======================
function login() {

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    if (!emailInput || !passwordInput) {
        return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        mostrarToast("Completa todos los campos", "error");
        return;
    }

    console.log(" CLICK LOGIN");

    fetch(API_URL + "/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {

        console.log(" LOGIN RESPUESTA:", data);

        if (data.success) {

            // SOLO GUARDAR EMAIL
            localStorage.setItem("email", data.user.email);

           
            mostrarToast("✨ Bienvenido", "ok");

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1200);

        } else {
            mostrarToast("Usuario o contraseña incorrectos", "error");
        }
    })
    .catch(err => {
        console.log("❌ ERROR FETCH:", err);
        mostrarToast("Error de conexión", "error");
    });
}
// =======================
// FIN LOGIN
// =======================


// =======================
// INICIO REGISTRO
// =======================
function registro() {

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmarInput = document.getElementById("confirmar");
    const terminos = document.getElementById("terminos");

    //  VALIDAR QUE EXISTEN
    if (!emailInput || !passwordInput || !confirmarInput || !terminos) {
        console.log("Inputs no encontrados");
        return;
    }

    //  LEER VALORES 
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmar = confirmarInput.value;

    //  DEBUG 
    console.log("EMAIL:", email);
    console.log("PASSWORD:", password);
    console.log("CONFIRMAR:", confirmar);

    //  VALIDACIONES
    if (email === "" || password === "" || confirmar === "") {
        mostrarToast("Campos vacíos");
        return;
    }

    if (password !== confirmar) {
        mostrarToast("Las contraseñas no coinciden");
        return;
    }

    if (!terminos.checked) {
        mostrarToast("Debes aceptar los términos");
        return;
    }

    console.log(" CLICK REGISTRO");

    //  FETCH BACKEND
    fetch(API_URL + "/registro", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {

        console.log(" RESPUESTA BACKEND:", data);

        if (data.success) {
            mostrarToast("Cuenta creada correctamente");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);

        } else {
            mostrarToast(data.msg || "Error al registrar");
        }
    })
    .catch(err => {
        console.log(" ERROR FETCH:", err);
        mostrarToast("Error de conexión");
    });
}
// =======================
// FIN REGISTRO
// =======================


//========================
// INICIO MENÚ
//========================
 function abrirMenu() {
     const menu = document.getElementById("menuOverlay");
     if (menu) {
         menu.style.transform = "translateX(0)";
     }
 }

 function cerrarMenu() {
     const menu = document.getElementById("menuOverlay");
     if (menu) {
         menu.style.transform = "translateX(100%)";
     }
 }

 // LOGOUT

 function logout() {
     try {
         // Eliminar solo la sesión activa
         localStorage.removeItem("sesionActiva");

         // Cerrar menú si está abierto
         cerrarMenu();

         // Redirigir al login
         window.location.href = "login.html";

     } catch (error) {
         console.error("Error al cerrar sesión:", error);
     }
 }

 // Alias (por si lo llamas desde HTML)
 function cerrarSesion() {
     logout();
 }

 // FUNCIONES TEMPORALES (FASE ACTUAL)
 function fase2() {
     alert("Funcionalidad disponible próximamente");
 }
 //========================
 // FIN MENU
 //========================

// =======================
// INICIO DASHBOARD
// =======================
window.addEventListener("DOMContentLoaded", () => {

    const nombreLocal = localStorage.getItem("usuario");
    const fotoLocal = localStorage.getItem("foto");
    const email = localStorage.getItem("email");

    const nombreElemento = document.querySelector(".usuario-dashboard");
    const fotoElemento = document.querySelector(".foto-container img");

    
    // 1. CARGA LOCAL (rápida)
        if (nombreLocal && nombreElemento) {
        nombreElemento.textContent = nombreLocal;
    }

    if (fotoLocal && fotoElemento) {
        fotoElemento.src = fotoLocal;
    }

    
    // 2. CARGA REAL DESDE DB
    if (!email) return;

    fetch(API_URL + "/obtenerPerfil", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
    })
    .then(res => res.json())
    .then(data => {

        console.log(" PERFIL DESDE DB:", data);

        if (!data.success) return;

        const user = data.user;

        
        // NOMBRE REAL (FIX CLAVE)
                if (
            user.nombre &&
            typeof user.nombre === "string" &&
            user.nombre.trim() !== "" &&
            nombreElemento
        ) {
            nombreElemento.textContent = user.nombre.trim();
            localStorage.setItem("usuario", user.nombre.trim());
        }

        
        //  FOTO REAL
                if (user.foto && fotoElemento) {
            fotoElemento.src = user.foto;
            localStorage.setItem("foto", user.foto);
        }

        
        //  REDES
                if (user.redes) {
            localStorage.setItem("redes", JSON.stringify(user.redes));
        }

    })
    .catch(err => {
        console.log(" ERROR PERFIL:", err);
    });
});
// =======================
// FIN DASHBOARD
// =======================


// =======================
//  INICIO ARCHIVOS
// =======================

function abrirSelectorArchivo() {
    const input = document.getElementById("inputArchivo");
    if (input) input.click();
}

document.addEventListener("DOMContentLoaded", () => {

    console.log("APP INICIADA");

    const inputArchivo = document.getElementById("inputArchivo");
    const contenedor = document.getElementById("contenedorArchivos");
    const empty = document.getElementById("emptyState");

    if (!inputArchivo || !contenedor || !empty) {
        console.log("ERROR: elementos no encontrados");
        return;
    }

    function actualizarEmpty() {
        empty.style.display =
            contenedor.children.length === 0 ? "block" : "none";
    }


    // CARGAR DESDE MYSQL
    
    fetch(API_URL + "/archivos")
        .then(res => res.json())
        .then(data => {

            console.log("Archivos backend:", data);

            contenedor.innerHTML = "";

            data.forEach(archivo => {

                renderArchivo({
                    id: archivo.id,
                    nombre: archivo.nombre,
                    tipo: archivo.tipo,
                    url: API_URL + archivo.ruta
                });

            });

            actualizarEmpty();

        })
        .catch(() => {
            console.log("Backend no disponible");
            actualizarEmpty();
        });


        // SUBIR ARCHIVO
    
    inputArchivo.addEventListener("change", function () {

        const files = inputArchivo.files;

        if (!files || files.length === 0) return;

        for (let archivo of files) {

            if (
                !archivo.type.startsWith("image/") &&
                !archivo.type.startsWith("video/")
            ) continue;

            // Vista previa inmediata
            const preview = {
                id: null,
                nombre: archivo.name,
                tipo: archivo.type,
                url: URL.createObjectURL(archivo)
            };

            renderArchivo(preview);

            actualizarEmpty();

            const formData = new FormData();
            formData.append("archivo", archivo);

            fetch(API_URL + "/upload", {
                method: "POST",
                body: formData
            })
            .then(res => res.json())
            .then(data => {

                // Actualizar el mismo objeto con el id real
                preview.id = data.id;
                preview.nombre = data.nombre;
                preview.url = API_URL + data.ruta;

                console.log("Guardado en backend");

            })
            .catch(() => {
                console.log("Error subiendo archivo");
            });

        }

        inputArchivo.value = "";

    });

});

// RENDER ARCHIVO

function renderArchivo(archivo) {

    const contenedor = document.getElementById("contenedorArchivos");
    const empty = document.getElementById("emptyState");

    const div = document.createElement("div");
    div.classList.add("archivo-item");
    div.style.position = "relative";

    let media;

    if (archivo.tipo.startsWith("image")) {
        media = document.createElement("img");
    } else {
        media = document.createElement("video");
        media.controls = true;
    }

    media.src = archivo.url;
    media.style.width = "100%";
    media.style.borderRadius = "10px";

    const eliminar = document.createElement("div");
    eliminar.innerHTML = "🗑";
    eliminar.style.cssText = `
        position:absolute;
        top:5px;
        right:5px;
        background:rgba(0,0,0,.6);
        color:#fff;
        padding:6px;
        border-radius:50%;
        cursor:pointer;
    `;

    eliminar.onclick = () => {

        if (archivo.id) {

            fetch(API_URL + "/archivos/" + archivo.id, {
                method: "DELETE"
            })
            .then(() => {

                div.remove();

                empty.style.display =
                    contenedor.children.length === 0
                        ? "block"
                        : "none";

            })
            .catch(() => {
                console.log("Error eliminando");
            });

        } else {

            div.remove();

            empty.style.display =
                contenedor.children.length === 0
                    ? "block"
                    : "none";

        }

    };

    const descargar = document.createElement("div");
    descargar.innerHTML = "👁️";
    descargar.style.cssText = `
        position:absolute;
        bottom:5px;
        right:5px;
        background:rgba(0,0,0,.6);
        color:#fff;
        padding:6px;
        border-radius:50%;
        cursor:pointer;
    `;

    descargar.onclick = () => {

    const visor = document.getElementById("visorImagen");
    const imagen = document.getElementById("imagenGrande");
    const video = document.getElementById("videoGrande");
    const cerrar = document.getElementById("cerrarVisor");
    const botonVolver = document.querySelector("body > .btn-back");

    visor.style.display = "flex";
    botonVolver.style.display = "none";

if (archivo.tipo.startsWith("image")) {

    imagen.style.display = "block";
    video.style.display = "none";

    imagen.src = archivo.url;

} else if (archivo.tipo.startsWith("video")) {

    imagen.style.display = "none";
    video.style.display = "block";

    video.src = archivo.url;
    video.load();

}

cerrar.onclick = () => {

    visor.style.display = "none";

    imagen.src = "";
    imagen.style.display = "block";

    video.pause();
    video.src = "";
    video.style.display = "none";

    botonVolver.style.display = "flex";

};

};
const nombre = document.createElement("p");
nombre.textContent = archivo.nombre;
nombre.style.fontSize = "12px";
nombre.style.marginTop = "5px";

div.appendChild(media);
div.appendChild(eliminar);

if (archivo.tipo.startsWith("image")) {
    div.appendChild(descargar);
}

div.appendChild(nombre);

contenedor.appendChild(div);

actualizarEstado();

function actualizarEstado() {
    empty.style.display =
        contenedor.children.length === 0 ? "block" : "none";
}

}
 
// FUNCIONES FASE 2

function mostrarFase2(nombre) {

    let toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = "🚧 " + nombre + " disponible en Fase 2";

    toast.classList.add("show");

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);

}
// =======================
// FIN ARCHIVO
// =======================



// =======================
// INICIO METRICAS
// =======================
//VOLVER
function volver() {
    window.location.href = "dashboard.html";
}

// MENSAJES POR RED
function mensajeRed(red) {

    switch (red) {

        case "Instagram":
            mostrarToast("📊 Estás actualmente en Instagram");
            break;

        case "Facebook":
            mostrarToast("🚧 Facebook disponible en Fase 2");
            break;

        case "TikTok":
            mostrarToast("🚧 TikTok disponible en Fase 2");
            break;

        case "YouTube":
            mostrarToast("🚧 YouTube disponible en Fase 2");
            break;

        case "X":
            mostrarToast("🚧 X disponible en Fase 2");
            break;

        default:
            mostrarToast("🚧 Threads disponible en Fase 2");
    }
}

// TOAST MENSAJE 
function mostrarToast(msg) {

    const toast = document.getElementById("toast");

    //  seguridad por si no existe
    if (!toast) return;

    toast.innerText = msg;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2000);
}
// =======================
//  FIN METRICAS
// =======================

// =======================
// INICIO BLOCK DE NOTAS
// =======================

document.addEventListener("DOMContentLoaded", function () {

    const contenedor = document.getElementById("contenedorNotas");
    if (!contenedor) return;

    const btnAgregar = document.getElementById("btnAgregar");
    const modal = document.getElementById("modal");
    const estadoVacio = document.getElementById("estadoVacio");

    function verificarEstadoVacio() {
        estadoVacio.style.display =
            contenedor.querySelectorAll(".nota").length > 0 ? "none" : "block";
    }

    function crearNota(id, texto) {

        const nota = document.createElement("div");
        nota.className = "nota";
        nota.dataset.id = id;

        nota.innerHTML = `
            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                background:#1f1f1f;
                padding:12px;
                border-radius:12px;
                margin-bottom:10px;
                color:white;
            ">
                <span>${texto}</span>

                <button onclick="eliminarNota(this)" style="
                    background:none;
                    border:none;
                    color:#5fd14f;
                    font-size:18px;
                    cursor:pointer;
                ">×</button>
            </div>
        `;

        contenedor.prepend(nota);
    }

    // CARGAR NOTAS

   fetch(API_URL + "/notas")
        .then(res => res.json())
        .then(data => {

            contenedor.innerHTML = "";

            data.forEach(nota => {
                crearNota(nota.id, nota.texto);
            });

            verificarEstadoVacio();

        })
        .catch(() => {
            verificarEstadoVacio();
        });


    // ABRIR MODAL

    btnAgregar.onclick = () => {
        modal.classList.add("activo");
    };

    
    // CERRAR MODAL
    
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove("activo");
        }
    };

    // GUARDAR NOTA
    
    document.addEventListener("click", function (e) {

        if (e.target && e.target.id === "btnGuardar") {

            const textoNota = document.getElementById("textoNota");
            const texto = textoNota.value.trim();

            if (!texto) return;

            fetch(API_URL + "/notas", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    texto: texto
                })

            })
            .then(res => res.json())
            .then(data => {

                crearNota(data.id, data.texto);

                textoNota.value = "";
                modal.classList.remove("activo");

                verificarEstadoVacio();

            })
            .catch(() => {
                console.log("Backend no disponible");
            });

        }

    });

    verificarEstadoVacio();

});


    // ELIMINAR NOTA

function eliminarNota(btn) {

    const nota = btn.closest(".nota");
    const id = nota.dataset.id;
    const texto = nota.querySelector("span").innerText.trim();

    let papelera = JSON.parse(localStorage.getItem("papeleraNotas")) || [];

    papelera.push({
        id,
        texto
    });

    localStorage.setItem(
        "papeleraNotas",
        JSON.stringify(papelera)
    );

    fetch(API_URL + "/notas/" + id, {

        method: "DELETE"

    })
    .then(res => res.json())
    .then(() => {

        nota.remove();

        const contenedor = document.getElementById("contenedorNotas");
        const estadoVacio = document.getElementById("estadoVacio");

        estadoVacio.style.display =
            contenedor.querySelectorAll(".nota").length > 0
                ? "none"
                : "block";

    })
    .catch(() => {
        console.log("No se eliminó en backend");
    });

}

window.eliminarNota = eliminarNota;
