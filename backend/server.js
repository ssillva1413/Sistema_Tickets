const express = require("express");
const cors = require("cors");
const pool = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
app.use("/uploads", express.static(uploadDir));

app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

app.post("/api/tickets", upload.single("imagem"), async (req, res) => {
  try {
    const { profissional, setor, descricao, prioridade } = req.body;

    if (!profissional || !setor || !descricao) {
      return res.status(400).json({ error: "Campos obrigatórios" });
    }

    const imagemNome = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO tickets
       (profissional, setor, descricao, prioridade, status, imagem)
       VALUES ($1,$2,$3,$4,'Aberto',$5)
       RETURNING *`,
      [profissional, setor, descricao, prioridade || "Normal", imagemNome]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar ticket" });
  }
});

app.get("/api/tickets", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tickets ORDER BY id DESC"
    );
    res.json(result.rows);
  } catch {
    res.status(500).json({ error: "Erro ao buscar tickets" });
  }
});

app.put("/api/tickets/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, usuario } = req.body;

    if (status === "Em andamento") {
      await pool.query(
        `UPDATE tickets
         SET status=$1,
             iniciado_por=$2,
             iniciado_em=NOW()
         WHERE id=$3`,
        [status, usuario, id]
      );
    } else if (status === "Fechado") {
      await pool.query(
        `UPDATE tickets
         SET status=$1,
             fechado_por=$2,
             fechado_em=NOW()
         WHERE id=$3`,
        [status, usuario, id]
      );
    } else {
      await pool.query(
        `UPDATE tickets SET status=$1 WHERE id=$2`,
        [status, id]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
});

app.get("/api/tickets/:id/comentarios", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM comentarios
       WHERE ticket_id = $1
       ORDER BY criado_em ASC`,
      [id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar comentários" });
  }
});

app.post("/api/tickets/:id/comentarios", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario, mensagem } = req.body;

    await pool.query(
      `INSERT INTO comentarios (ticket_id, usuario, mensagem)
       VALUES ($1, $2, $3)`,
      [id, usuario, mensagem]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao comentar" });
  }
});

app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);