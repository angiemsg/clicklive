// =====================================
// CONFIGURACIÓN GENERAL CLICKLIVE
// =====================================

// Cambia SOLO esta línea cuando quieras
// probar otro entorno.

const MODO = "VISUAL";

// Opciones disponibles:
// "VISUAL"
// "EMULADOR"
// "TELEFONO"

const CONFIG = {

    VISUAL: "http://localhost:3000",

    EMULADOR: "http://10.0.2.2:3000",

    TELEFONO: "http://192.168.10.14:3000"

};

// NO MODIFICAR
const API_URL = CONFIG[MODO];