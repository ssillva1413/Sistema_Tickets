const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ROTA TESTE
app.get("/", (req, res) => {
  res.send("Backend do Sistema de Tickets funcionando!");
});

// CRIAR TICKET
app.post("/api/tickets", async (req, res) => {
  try {
    const { profissional, setor, descricao, prioridade } = req.body;

    if (!profissional || !setor || !descricao) {
      return res
        .status(400)
        .json({ success: false, error: "Campos obrigatórios não preenchidos" });
    }

    const result = await pool.query(
      `INSERT INTO tickets (profissional, setor, descricao, prioridade, status)
       VALUES ($1, $2, $3, $4, 'Aberto')
       RETURNING *`,
      [profissional, setor, descricao, prioridade]
    );

    res.status(201).json({
      success: true,
      ticket: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao criar ticket:", error);
    res.status(500).json({ success: false, error: "Erro ao criar ticket" });
  }
});

// LISTAR TICKETS
app.get("/api/tickets", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM tickets ORDER BY criado_em DESC"
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar tickets" });
  }
});

// ATUALIZAR STATUS
app.put("/api/tickets/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query(
      "UPDATE tickets SET status = $1 WHERE id = $2",
      [status, id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
