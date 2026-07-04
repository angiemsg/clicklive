const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());

app.use(express.json({
    limit: "10mb"
}));

app.use(express.urlencoded({
    extended: true,
    limit: "10mb"
}));


// MULTER

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },

    filename: function (req, file, cb) {

        const nombre =
            Date.now() + path.extname(file.originalname);

        cb(null, nombre);

    }

});

const upload = multer({
    storage: storage
});


// MYSQL 

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Acuario010203*",
    database: "clicklive"
});

db.connect(err => {
    if (err) {
        console.log("❌ Error conexión DB:", err);
    } else {
        console.log("✅ Conectado a MySQL");
    }
});


// PRUEBA

app.get("/", (req, res) => {
    res.send("Servidor funcionando 🚀");
});

// =======================
// REGISTRO
// =======================
app.post("/registro", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, msg: "Faltan datos" });
    }

    const checkSql = "SELECT * FROM usuario WHERE email = ?";

    db.query(checkSql, [email], (err, results) => {

        if (err) {
            console.log("ERROR MYSQL:", err);
            return res.json({ success: false });
        }

        if (results.length > 0) {
            return res.json({
                success: false,
                msg: "Esta cuenta ya fue creada"
            });
        }

        const insertSql = `
            INSERT INTO usuario (nombre, email, password)
            VALUES (?, ?, ?)
        `;

        db.query(insertSql, ["", email, password], (err) => {

            if (err) {
                console.log("ERROR MYSQL:", err);
                return res.json({ success: false });
            }

            console.log("USUARIO REGISTRADO");

            res.json({ success: true });
        });
    });
});

// =======================
// LOGIN
// =======================
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM usuario WHERE email = ? AND password = ?";

    db.query(sql, [email, password], (err, results) => {

        if (err) {
            console.log(err);
            return res.json({ success: false });
        }

        if (results.length > 0) {
            res.json({
                success: true,
                user: results[0]
            });
        } else {
            res.json({ success: false });
        }
    });
});



// =======================
// PERFIL
// =======================
app.post("/perfil", (req, res) => {

    console.log("=================================");
    console.log("📥 BODY RECIBIDO:", req.body);
    console.log("=================================");

    const {
        email,
        nombre,
        foto,
        instagram,
        facebook,
        tiktok,
        youtube,
        threads,
        x
    } = req.body;

    if (!email) {
        return res.json({
            success: false,
            mensaje: "Falta el email"
        });
    }

    const sql = `
        UPDATE usuario
        SET
            nombre = ?,
            foto = ?,
            instagram = ?,
            facebook = ?,
            tiktok = ?,
            youtube = ?,
            threads = ?,
            x = ?
        WHERE email = ?
    `;

    db.query(
        sql,
        [
            nombre || "",
            foto || "",
            instagram || "",
            facebook || "",
            tiktok || "",
            youtube || "",
            threads || "",
            x || "",
            email
        ],
        (err, result) => {

            if (err) {
                console.log("❌ ERROR MYSQL:", err);

                return res.json({
                    success: false,
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.json({
                    success: false,
                    mensaje: "Usuario no encontrado"
                });
            }

            console.log("✅ PERFIL ACTUALIZADO");

            res.json({
                success: true
            });

        }
    );

});



// SUBIR FOTO PERFIL

app.post("/uploadPerfil", upload.single("archivo"), (req, res) => {

    if (!req.file) {

        return res.status(400).json({
            success: false,
            mensaje: "No se recibió ninguna imagen"
        });

    }

    const ruta = "/uploads/" + req.file.filename;

    console.log("📷 FOTO PERFIL:", ruta);

    res.json({
        success: true,
        ruta: ruta
    });

});


// SUBIR ARCHIVO

app.post("/upload", upload.single("archivo"), (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            mensaje: "No se recibió ningún archivo"
        });
    }

    const nombre = req.file.filename;
    const ruta = "/uploads/" + nombre;
    const tipo = req.file.mimetype;

    db.query(
        "INSERT INTO archivos (nombre, tipo, ruta) VALUES (?, ?, ?)",
        [nombre, tipo, ruta],
        (err, result) => {

            if (err) {
                console.log("❌ ERROR MYSQL:", err);
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json({
                success: true,
                id: result.insertId,
                nombre,
                tipo,
                ruta
            });

        }
    );

});


// LISTAR ARCHIVOS

app.get("/archivos", (req, res) => {

    db.query(
        "SELECT * FROM archivos ORDER BY id DESC",
        (err, results) => {

            if (err) {
                console.log("❌ ERROR MYSQL:", err);
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json(results);

        }
    );

});


// ELIMINAR ARCHIVO

app.delete("/archivos/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM archivos WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                console.log("❌ ERROR MYSQL:", err);
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            if (result.length === 0) {
                return res.json({
                    success: false,
                    mensaje: "Archivo no encontrado"
                });
            }

            const archivo = result[0];
            const ruta = "." + archivo.ruta;

            fs.unlink(ruta, (unlinkErr) => {

                if (unlinkErr) {
                    console.log("⚠️ No se pudo eliminar el archivo físico:", unlinkErr.message);
                }

                db.query(
                    "DELETE FROM archivos WHERE id = ?",
                    [id],
                    (err) => {

                        if (err) {
                            console.log("❌ ERROR MYSQL:", err);
                            return res.status(500).json({
                                success: false,
                                error: err.message
                            });
                        }

                        res.json({
                            success: true
                        });

                    }
                );

            });

        }
    );

});

// STATIC

app.use("/uploads", express.static("uploads"));

// =======================
// NOTAS 
// =======================

// CREAR NOTA
app.post("/notas", (req, res) => {

    const { texto } = req.body;

    if (!texto) {
        return res.json({ success: false });
    }

    db.query(
        "INSERT INTO notas (contenido) VALUES (?)",
        [texto],
        (err, result) => {
            if (err) return res.status(500).json(err);

            res.json({
                id: result.insertId,
                texto
            });
        }
    );
});

// LISTAR NOTAS
app.get("/notas", (req, res) => {

    db.query("SELECT * FROM notas ORDER BY id DESC", (err, results) => {
        if (err) return res.status(500).json(err);

        const data = results.map(n => ({
            id: n.id,
            texto: n.contenido
        }));

        res.json(data);
    });

});


// ELIMINAR NOTA

app.delete("/notas/:id", (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM notas WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                console.log("❌ ERROR MYSQL:", err);
                return res.status(500).json({ success: false });
            }

            res.json({
                success: true
            });
        }
    );

});



// OBTENER PERFIL 

app.post("/obtenerPerfil", (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.json({ success: false });
    }

    const sql = "SELECT * FROM usuario WHERE email = ?";

    db.query(sql, [email], (err, results) => {

        if (err) {
            console.log("❌ ERROR MYSQL:", err);
            return res.json({ success: false });
        }

        if (results.length > 0) {
            res.json({
                success: true,
                user: results[0]
            });
        } else {
            res.json({ success: false });
        }
    });
});



// CALENDARIO - FASE 1


const dbAsync = db.promise();

async function obtenerUsuarioIdPorEmail(email) {

    if (!email) return null;

    const [usuarios] = await dbAsync.query(
        "SELECT id FROM usuario WHERE email = ? LIMIT 1",
        [email]
    );

    return usuarios.length > 0 ? usuarios[0].id : null;

}

function normalizarIds(lista) {

    if (!Array.isArray(lista)) return [];

    return [...new Set(
        lista
            .map(id => Number(id))
            .filter(id => Number.isInteger(id) && id > 0)
    )];

}

async function obtenerEventoCompleto(eventoId, usuarioId) {

    const [eventos] = await dbAsync.query(
        `SELECT *
         FROM eventos
         WHERE id = ? AND usuario_id = ?
         LIMIT 1`,
        [eventoId, usuarioId]
    );

    if (eventos.length === 0) return null;

    const evento = eventos[0];

    const [notas] = await dbAsync.query(
        `SELECT n.id, n.contenido AS texto, n.fecha
         FROM evento_notas en
         INNER JOIN notas n ON n.id = en.nota_id
         WHERE en.evento_id = ?
         ORDER BY n.id DESC`,
        [eventoId]
    );

    const [archivos] = await dbAsync.query(
        `SELECT a.id, a.nombre, a.tipo, a.ruta, a.fecha
         FROM evento_archivos ea
         INNER JOIN archivos a ON a.id = ea.archivo_id
         WHERE ea.evento_id = ?
         ORDER BY a.id DESC`,
        [eventoId]
    );

    evento.notas = notas;
    evento.archivos = archivos;

    return evento;

}

app.get("/calendario/notas", (req, res) => {

    db.query(
        "SELECT id, contenido AS texto, fecha FROM notas ORDER BY id DESC",
        (err, results) => {

            if (err) {
                console.log("ERROR MYSQL CALENDARIO NOTAS:", err);
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json({
                success: true,
                notas: results
            });

        }
    );

});

app.get("/calendario/archivos", (req, res) => {

    db.query(
        "SELECT id, nombre, tipo, ruta, fecha FROM archivos ORDER BY id DESC",
        (err, results) => {

            if (err) {
                console.log("ERROR MYSQL CALENDARIO ARCHIVOS:", err);
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json({
                success: true,
                archivos: results
            });

        }
    );

});

app.get("/calendario/eventos", async (req, res) => {

    try {

        const usuarioId = await obtenerUsuarioIdPorEmail(req.query.email);

        if (!usuarioId) {
            return res.json({
                success: false,
                mensaje: "Usuario no encontrado"
            });
        }

        const [eventos] = await dbAsync.query(
            `SELECT e.*,
                    (SELECT COUNT(*) FROM evento_notas en WHERE en.evento_id = e.id) AS total_notas,
                    (SELECT COUNT(*) FROM evento_archivos ea WHERE ea.evento_id = e.id) AS total_archivos
             FROM eventos e
             WHERE e.usuario_id = ?
             ORDER BY e.fecha ASC, e.hora ASC, e.id DESC`,
            [usuarioId]
        );

        res.json({
            success: true,
            eventos
        });

    } catch (error) {

        console.log("ERROR CALENDARIO EVENTOS:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

app.get("/calendario/eventos/:id", async (req, res) => {

    try {

        const usuarioId = await obtenerUsuarioIdPorEmail(req.query.email);

        if (!usuarioId) {
            return res.json({
                success: false,
                mensaje: "Usuario no encontrado"
            });
        }

        const evento = await obtenerEventoCompleto(req.params.id, usuarioId);

        if (!evento) {
            return res.json({
                success: false,
                mensaje: "Evento no encontrado"
            });
        }

        res.json({
            success: true,
            evento
        });

    } catch (error) {

        console.log("ERROR CALENDARIO EVENTO:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

app.post("/calendario/eventos", async (req, res) => {

    try {

        const {
            email,
            titulo,
            descripcion,
            fecha,
            hora,
            tipo,
            estado,
            prioridad,
            recordatorio,
            notas,
            archivos
        } = req.body;

        const usuarioId = await obtenerUsuarioIdPorEmail(email);

        if (!usuarioId) {
            return res.json({
                success: false,
                mensaje: "Usuario no encontrado"
            });
        }

        if (!titulo || !fecha) {
            return res.json({
                success: false,
                mensaje: "Titulo y fecha son obligatorios"
            });
        }

        await dbAsync.beginTransaction();

        const [resultado] = await dbAsync.query(
            `INSERT INTO eventos
                (usuario_id, titulo, descripcion, fecha, hora, tipo, estado, prioridad, recordatorio)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuarioId,
                titulo.trim(),
                descripcion || "",
                fecha,
                hora || null,
                tipo || "Otro",
                estado || "Pendiente",
                prioridad || "Media",
                recordatorio || "Sin recordatorio"
            ]
        );

        const eventoId = resultado.insertId;
        const notasIds = normalizarIds(notas);
        const archivosIds = normalizarIds(archivos);

        for (const notaId of notasIds) {
            await dbAsync.query(
                "INSERT IGNORE INTO evento_notas (evento_id, nota_id) VALUES (?, ?)",
                [eventoId, notaId]
            );
        }

        for (const archivoId of archivosIds) {
            await dbAsync.query(
                "INSERT IGNORE INTO evento_archivos (evento_id, archivo_id) VALUES (?, ?)",
                [eventoId, archivoId]
            );
        }

        await dbAsync.commit();

        const evento = await obtenerEventoCompleto(eventoId, usuarioId);

        res.json({
            success: true,
            evento
        });

    } catch (error) {

        await dbAsync.rollback();

        console.log("ERROR CREAR EVENTO:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

app.put("/calendario/eventos/:id", async (req, res) => {

    try {

        const {
            email,
            titulo,
            descripcion,
            fecha,
            hora,
            tipo,
            estado,
            prioridad,
            recordatorio,
            notas,
            archivos
        } = req.body;

        const usuarioId = await obtenerUsuarioIdPorEmail(email);

        if (!usuarioId) {
            return res.json({
                success: false,
                mensaje: "Usuario no encontrado"
            });
        }

        if (!titulo || !fecha) {
            return res.json({
                success: false,
                mensaje: "Titulo y fecha son obligatorios"
            });
        }

        await dbAsync.beginTransaction();

        const [resultado] = await dbAsync.query(
            `UPDATE eventos
             SET titulo = ?,
                 descripcion = ?,
                 fecha = ?,
                 hora = ?,
                 tipo = ?,
                 estado = ?,
                 prioridad = ?,
                 recordatorio = ?
             WHERE id = ? AND usuario_id = ?`,
            [
                titulo.trim(),
                descripcion || "",
                fecha,
                hora || null,
                tipo || "Otro",
                estado || "Pendiente",
                prioridad || "Media",
                recordatorio || "Sin recordatorio",
                req.params.id,
                usuarioId
            ]
        );

        if (resultado.affectedRows === 0) {
            await dbAsync.rollback();
            return res.json({
                success: false,
                mensaje: "Evento no encontrado"
            });
        }

        await dbAsync.query(
            "DELETE FROM evento_notas WHERE evento_id = ?",
            [req.params.id]
        );

        await dbAsync.query(
            "DELETE FROM evento_archivos WHERE evento_id = ?",
            [req.params.id]
        );

        const notasIds = normalizarIds(notas);
        const archivosIds = normalizarIds(archivos);

        for (const notaId of notasIds) {
            await dbAsync.query(
                "INSERT IGNORE INTO evento_notas (evento_id, nota_id) VALUES (?, ?)",
                [req.params.id, notaId]
            );
        }

        for (const archivoId of archivosIds) {
            await dbAsync.query(
                "INSERT IGNORE INTO evento_archivos (evento_id, archivo_id) VALUES (?, ?)",
                [req.params.id, archivoId]
            );
        }

        await dbAsync.commit();

        const evento = await obtenerEventoCompleto(req.params.id, usuarioId);

        res.json({
            success: true,
            evento
        });

    } catch (error) {

        await dbAsync.rollback();

        console.log("ERROR ACTUALIZAR EVENTO:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

app.delete("/calendario/eventos/:id", async (req, res) => {

    try {

        const usuarioId = await obtenerUsuarioIdPorEmail(req.query.email);

        if (!usuarioId) {
            return res.json({
                success: false,
                mensaje: "Usuario no encontrado"
            });
        }

        const [resultado] = await dbAsync.query(
            "DELETE FROM eventos WHERE id = ? AND usuario_id = ?",
            [req.params.id, usuarioId]
        );

        res.json({
            success: resultado.affectedRows > 0
        });

    } catch (error) {

        console.log("ERROR ELIMINAR EVENTO:", error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});

app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000");
});
