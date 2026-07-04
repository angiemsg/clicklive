// ======================================================
// CLICKLIVE PERFIL
// ======================================================

console.log("âœ… perfil.js cargado");

// ======================================================
// VARIABLES GLOBALES
// ======================================================

    
let fotoPerfil = "";
const REDES_PERFIL = [
    "instagram",
    "facebook",
    "tiktok",
    "youtube",
    "threads",
    "x"
];

function obtenerUrlFoto(ruta){

    if(!ruta) return "";

    if(
        ruta.startsWith("http://") ||
        ruta.startsWith("https://") ||
        ruta.startsWith("data:") ||
        ruta.startsWith("blob:")
    ){
        return ruta;
    }

    if(ruta.startsWith("/")){
        return API_URL + ruta;
    }

    return ruta;

}

function obtenerItemRed(red){

    return document.querySelector(`.red-item[data-red="${red}"]`);

}

function marcarRed(red, activa){

    const item = obtenerItemRed(red);

    if(!item) return;

    const icono = item.querySelector("img");
    const input = document.getElementById(red);

    if(icono){
        icono.classList.toggle("activa", activa);
    }

    if(input){
        input.value = activa ? "1" : "";
    }

}

function redSeleccionada(red){

    const item = obtenerItemRed(red);
    const icono = item ? item.querySelector("img") : null;

    return icono && icono.classList.contains("activa") ? "1" : "";

}

function iniciarSelectorRedes(){

    document.querySelectorAll(".red-item[data-red]").forEach(item => {

        item.addEventListener("click", () => {

            const red = item.dataset.red;
            const icono = item.querySelector("img");

            marcarRed(red, !icono.classList.contains("activa"));

        });

    });

}

// ======================================================
// INICIO
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    cargarPerfil();
    iniciarSelectorRedes();

    const inputFoto = document.getElementById("inputFoto");

    if(inputFoto){

        inputFoto.addEventListener("change", cargarFoto);

        console.log("âœ… Evento change registrado");

    }else{

        console.log("âŒ No se encontrÃ³ inputFoto");

    }

});

// ======================================================
// CARGAR PERFIL
// ======================================================

async function cargarPerfil(){

    console.log("ðŸš€ cargarPerfil ejecutada");
    const email = localStorage.getItem("email");

    if(!email){

        console.log("No existe email");

        return;

    }

    try{

        const respuesta = await fetch(API_URL + "/obtenerPerfil",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                email
            })

        });

        const data = await respuesta.json();

        console.log("PERFIL:",data);

        if(!data.success){

            return;

        }

        const usuario = data.user;

        // ===========================
        // NOMBRE
        // ===========================

        if(usuario.nombre){

            document.getElementById("nombreUsuarioTexto").textContent =
                usuario.nombre;

        }

        // ===========================
        // FOTO
        // ===========================

        if(usuario.foto){

            fotoPerfil = usuario.foto;

            document.getElementById("preview").src =
                obtenerUrlFoto(usuario.foto);

        }

        // ===========================
        // INSTAGRAM
        // ===========================

        if(document.getElementById("instagram")){

            document.getElementById("instagram").value =
                usuario.instagram || "";

        }

        // ===========================
        // FACEBOOK
        // ===========================

        if(document.getElementById("facebook")){

            document.getElementById("facebook").value =
                usuario.facebook || "";

        }

        // ===========================
        // TIKTOK
        // ===========================

        if(document.getElementById("tiktok")){

            document.getElementById("tiktok").value =
                usuario.tiktok || "";

        }

        // ===========================
        // YOUTUBE
        // ===========================

        if(document.getElementById("youtube")){

            document.getElementById("youtube").value =
                usuario.youtube || "";

        }

        // ===========================
        // THREADS
        // ===========================

        if(document.getElementById("threads")){

            document.getElementById("threads").value =
                usuario.threads || "";

        }

        // ===========================
        // X
        // ===========================

        if(document.getElementById("x")){

            document.getElementById("x").value =
                usuario.x || "";

        }

        REDES_PERFIL.forEach(red => {

            marcarRed(red, Boolean(usuario[red]));

        });

    }

    catch(error){

        console.log(error);

    }

}

// ======================================================
// EDITAR NOMBRE
// ======================================================

function editarNombre(){

    const texto =
        document.getElementById("nombreUsuarioTexto");

    const input =
        document.getElementById("nombreUsuarioInput");

    if(input.style.display==="block"){

        texto.textContent =
            input.value.trim();

        input.style.display="none";

        texto.style.display="block";

    }

    else{

        input.value =
            texto.textContent;

        texto.style.display="none";

        input.style.display="block";

        input.focus();

    }

}
// ======================================================
// CARGAR FOTO
// ======================================================

async function cargarFoto(event){

    console.log("ðŸ“· cargarFoto ejecutada");

    const archivo = event.target.files[0];

    console.log("ARCHIVO:", archivo);

    if(!archivo) return;

    // Vista previa
    const reader = new FileReader();

    reader.onload = function(e){

        fotoPerfil = e.target.result;

        document.getElementById("preview").src = fotoPerfil;

    };

    reader.readAsDataURL(archivo);

}

// ======================================================
// GUARDAR PERFIL
// ======================================================

async function guardarPerfil(){

    const email = localStorage.getItem("email");

    if(!email){

        alert("No existe un usuario activo.");

        return;

    }

    let nombre =
        document.getElementById("nombreUsuarioInput").value.trim();

    if(nombre===""){

        nombre =
            document.getElementById("nombreUsuarioTexto").textContent.trim();

    }

    const instagram = redSeleccionada("instagram");

    const facebook = redSeleccionada("facebook");

    const tiktok = redSeleccionada("tiktok");

    const youtube = redSeleccionada("youtube");

    const threads = redSeleccionada("threads");

    const x = redSeleccionada("x");

    try{

        console.log("================================");
        console.log("EMAIL:", email);
        console.log("NOMBRE:", nombre);
        console.log("FOTO PERFIL:", fotoPerfil);
        console.log("================================");

        const respuesta = await fetch(
            API_URL + "/perfil",
            {

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    email,

                    nombre,

                    foto:fotoPerfil,

                    instagram,

                    facebook,

                    tiktok,

                    youtube,

                    threads,

                    x

                })

            }
        );

        const data = await respuesta.json();

        console.log(data);

        if(data.success){

            localStorage.setItem("usuario",nombre);

            if(fotoPerfil){

                localStorage.setItem("foto",fotoPerfil);

            }

            mostrarToast("✅ Perfil actualizado correctamente.");


            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1800);

        }

        else{

             mostrarToast("❌ No fue posible guardar el perfil.");

        }

    }

    catch(error){

        console.log(error);

        mostrarToast("⚠️ Error de conexión con el servidor.");
    }

}
function mostrarToast(mensaje){

    const toast = document.getElementById("toast");

    if(!toast) return;

    toast.textContent = mensaje;

    toast.classList.add("show");

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
        toast.classList.remove("show");
    },1800);

}function mostrarToast(mensaje){

    const toast = document.getElementById("toast");

    if(!toast) return;

    toast.textContent = mensaje;

    toast.classList.add("show");

    clearTimeout(toast._timer);

    toast._timer = setTimeout(() => {
        toast.classList.remove("show");
    },1800);

}