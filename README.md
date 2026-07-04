# ClickLive

## Descripción

ClickLive es una aplicación desarrollada como proyecto formativo del programa **Análisis y Desarrollo de Software** del SENA.

Su objetivo es facilitar la organización y planificación del trabajo de los creadores de contenido mediante una plataforma que permite administrar eventos, notas, archivos multimedia y la información del perfil del usuario desde un solo lugar.

La aplicación fue diseñada bajo una arquitectura cliente-servidor, utilizando tecnologías web, una base de datos relacional y una versión para dispositivos Android mediante WebView.

---

# Objetivo del proyecto

Desarrollar una aplicación que permita centralizar la planificación de contenido digital, ofreciendo herramientas para organizar publicaciones, almacenar archivos multimedia y administrar información relacionada con el trabajo diario de un creador de contenido.

---

# Estado actual del proyecto

Actualmente se encuentran implementadas las siguientes funcionalidades:

- Registro de usuarios.
- Inicio de sesión.
- Dashboard principal.
- Administración del perfil del usuario.
- Gestión de notas.
- Creación y eliminación de notas.
- Gestión de archivos.
- Carga de imágenes y videos.
- Vista previa de imágenes.
- Vista previa de videos.
- Eliminación de archivos.
- Administración de eventos.
- Asociación de notas a un evento.
- Asociación de archivos a un evento.
- Visualización del calendario de eventos.

Las siguientes funcionalidades se encuentran proyectadas para una segunda fase del desarrollo:

- Inteligencia Artificial para asistencia al creador de contenido.
- Métricas de redes sociales.
- Integración con Instagram.
- Integración con Facebook.
- Integración con TikTok.
- Integración con YouTube.
- Integración con Threads.
- Integración con X.
- Sincronización en la nube.
- Integración con herramientas de edición multimedia.

---

# Tecnologías utilizadas

## Desarrollo

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- MySQL 8
- Android Studio
- Visual Studio Code
- Git

## Diseño y maquetación

La identidad visual y la maquetación inicial de las interfaces fueron desarrolladas en **CorelDRAW**, donde se definió la estructura visual, distribución de componentes y experiencia de usuario antes del desarrollo.

Posteriormente, las interfaces fueron adaptadas e implementadas mediante HTML, CSS y JavaScript.

## Base de datos

- MySQL Workbench

---

# Arquitectura del proyecto

El proyecto se encuentra dividido en tres componentes principales:

```
CLICKLIVE

├── clicklive-app
│   Frontend desarrollado en HTML, CSS y JavaScript.
│
├── clicklive-backend
│   Backend desarrollado en Node.js y Express.
│
└── clickliveApp
    Proyecto Android Studio para la ejecución de la aplicación mediante WebView.
```

---

# Estructura del proyecto

```
CLICKLIVE
│
├── clicklive-app
│   ├── css
│   ├── img
│   ├── js
│   ├── archivos.html
│   ├── blocknotas.html
│   ├── calendario.html
│   ├── dashboard.html
│   ├── IAcreativa.html
│   ├── index.html
│   ├── login.html
│   ├── menu.html
│   ├── metricas.html
│   ├── perfil.html
│   └── demás archivos del frontend
│
├── clicklive-backend
│   ├── database
│   │   └── clicklive_bd_fase1.sql
│   ├── uploads
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── clickliveApp
│   └── Proyecto Android Studio
│
└── README.md
```

---

# Arquitectura de la base de datos

La base de datos se encuentra organizada alrededor de la entidad **eventos**, la cual constituye el núcleo de la planificación del sistema y permite relacionar información proveniente de notas y archivos.

Las tablas principales son:

- usuario
- notas
- archivos
- eventos
- evento_notas
- evento_archivos

Esta estructura permite ampliar el sistema en futuras versiones sin modificar la arquitectura principal.

---

# Base de datos

Dentro de la carpeta:

```
clicklive-backend/database
```

se encuentra el archivo:

```
clicklive_bd_fase1.sql
```

Este archivo contiene la estructura completa y actualizada de la base de datos utilizada por el proyecto.

---

# Ejecución del backend

Ubicarse en la carpeta:

```
clicklive-backend
```

Ejecutar:

```bash
node server.js
```

Una vez iniciado el servidor estará disponible en:

```
http://localhost:3000
```

> **Nota:** Si el proyecto se ejecuta por primera vez y la carpeta **node_modules** no existe, será necesario instalar las dependencias ejecutando previamente:

```bash
npm install
```

---

# Ejecución del frontend

Abrir la carpeta **clicklive-app** desde Visual Studio Code o ejecutar la aplicación mediante Android Studio utilizando WebView.

---

# Organización del proyecto

El sistema fue desarrollado bajo una arquitectura cliente-servidor.

El frontend es responsable de la interfaz gráfica y la interacción con el usuario.

El backend administra la autenticación, el almacenamiento de archivos, la comunicación con la base de datos y la lógica del sistema.

La base de datos almacena la información de usuarios, notas, archivos y eventos, permitiendo mantener la integridad de la información.

---

# Estado del proyecto

El proyecto corresponde a la **Fase 1** del desarrollo.

Actualmente se encuentra implementada la comunicación entre el frontend, el backend y la base de datos MySQL, permitiendo la administración funcional de usuarios, notas, archivos y eventos.

Las funcionalidades de Inteligencia Artificial, métricas, sincronización en la nube e integración con redes sociales forman parte de la segunda fase del desarrollo.

---

# Autor

Proyecto desarrollado por:

**Angie Salazar**

Programa de Formación:

**Análisis y Desarrollo de Software**

**2026**