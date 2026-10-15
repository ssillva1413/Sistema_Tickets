const express = require("express");

const cors = require("cors");

const pool = require("./db");

const multer = require("multer");

const path = require("path");

const fs = require("fs");

const bcrypt = require("bcrypt");

const crypto = require("crypto");

const { gerarToken } = require("./auth");

const { autenticarToken, exigirTI, exigirAdmin } = require("./middleware");

const {
  enviarEmailConfirmacao,
  enviarEmailRecuperacaoSenha,
  enviarEmailChamadoResolvido,
  enviarEmailNovoComentario,
} = require("./email");

const app = express();

const PORT = 3001;

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const gerarTokenConfirmacao = () => {
  return crypto.randomBytes(32).toString("hex");
};

const gerarHashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

app.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        error: "E-mail e senha são obrigatórios",
      });
    }

    const result = await pool.query(
      `SELECT
        id,
        nome,
        email,
        senha_hash,
        perfil,
        ativo,
        email_confirmado
      FROM usuarios
      WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "E-mail ou senha inválidos",
      });
    }

    const usuario = result.rows[0];

    if (!usuario.ativo) {
      return res.status(403).json({
        error: "Usuário inativo",
      });
    }

    const senhaValida = await bcrypt.compare(
      senha,
      usuario.senha_hash
    );

    if (!senhaValida) {
      return res.status(401).json({
        error: "E-mail ou senha inválidos",
      });
    }

    if (!usuario.email_confirmado) {
      return res.status(403).json({
        error:
          "E-mail ainda não confirmado. Verifique sua caixa de entrada.",
      });
    }

    const token = gerarToken(usuario);

    res.json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);

    res.status(500).json({
      error: "Erro interno ao realizar login",
    });
  }
});

app.post("/api/usuarios", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({
        error: "Nome, e-mail e senha são obrigatórios",
      });
    }

    if (senha.length < 6) {
      return res.status(400).json({
        error: "A senha deve ter pelo menos 6 caracteres",
      });
    }

    const nomeNormalizado = nome.trim();

    const emailNormalizado = email.trim().toLowerCase();

    if (!nomeNormalizado || !emailNormalizado) {
      return res.status(400).json({
        error: "Nome e e-mail são obrigatórios",
      });
    }

    const usuarioExistente = await pool.query(
      `SELECT id
      FROM usuarios
      WHERE email = $1`,
      [emailNormalizado]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(409).json({
        error: "Este e-mail já está cadastrado",
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const tokenConfirmacao = gerarTokenConfirmacao();

    const tokenConfirmacaoHash =
      gerarHashToken(tokenConfirmacao);

    const tokenConfirmacaoExpiraEm = new Date(
      Date.now() + 60 * 60 * 1000
    );

    const result = await pool.query(
      `INSERT INTO usuarios
      (
        nome,
        email,
        senha_hash,
        perfil,
        ativo,
        email_confirmado,
        email_confirmacao_token_hash,
        email_confirmacao_expira_em
      )
      VALUES
      (
        $1,
        $2,
        $3,
        'usuario',
        true,
        false,
        $4,
        $5
      )
      RETURNING
        id,
        nome,
        email,
        perfil,
        ativo,
        email_confirmado,
        criado_em`,
      [
        nomeNormalizado,
        emailNormalizado,
        senhaHash,
        tokenConfirmacaoHash,
        tokenConfirmacaoExpiraEm,
      ]
    );

    await enviarEmailConfirmacao(
      result.rows[0].email,
      result.rows[0].nome,
      tokenConfirmacao
    );

    console.log("Novo usuário criado:", {
      id: result.rows[0].id,
      email: result.rows[0].email,
      email_confirmado: result.rows[0].email_confirmado,
      token_expira_em: tokenConfirmacaoExpiraEm,
    });

    res.status(201).json({
      success: true,
      mensagem:
        "Cadastro realizado com sucesso. Verifique seu e-mail para confirmar sua conta.",
      usuario: result.rows[0],
    });
  } catch (err) {
    console.error("Erro ao criar usuário:", err);

    res.status(500).json({
      error: "Erro interno ao criar usuário",
    });
  }
});

app.post("/api/reenviar-confirmacao", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "E-mail é obrigatório",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT
        id,
        nome,
        email,
        email_confirmado
      FROM usuarios
      WHERE email = $1`,
      [emailNormalizado]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        mensagem:
          "Se o e-mail estiver cadastrado e ainda não confirmado, um novo link será enviado.",
      });
    }

    const usuario = result.rows[0];

    if (usuario.email_confirmado) {
      return res.status(200).json({
        success: false,
        mensagem:
          "Este e-mail já foi confirmado. Você já pode fazer login.",
      });
    }

    const tokenConfirmacao = gerarTokenConfirmacao();

    const tokenConfirmacaoHash =
      gerarHashToken(tokenConfirmacao);

    const tokenConfirmacaoExpiraEm = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await pool.query(
      `UPDATE usuarios
      SET
        email_confirmacao_token_hash = $1,
        email_confirmacao_expira_em = $2
      WHERE id = $3`,
      [
        tokenConfirmacaoHash,
        tokenConfirmacaoExpiraEm,
        usuario.id,
      ]
    );

    await enviarEmailConfirmacao(
      usuario.email,
      usuario.nome,
      tokenConfirmacao
    );

    console.log("Novo e-mail de confirmação enviado:", {
      usuarioId: usuario.id,
      email: usuario.email,
      token_expira_em: tokenConfirmacaoExpiraEm,
    });

    return res.status(200).json({
      success: true,
      mensagem:
        "Um novo e-mail de confirmação foi enviado. Verifique sua caixa de entrada.",
    });
  } catch (error) {
    console.error(
      "Erro ao reenviar confirmação de e-mail:",
      error
    );

    return res.status(500).json({
      error:
        "Não foi possível reenviar o e-mail de confirmação.",
    });
  }
});

app.post("/api/esqueci-senha", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "E-mail é obrigatório",
      });
    }

    const emailNormalizado = email.trim().toLowerCase();

    const result = await pool.query(
      `SELECT
        id,
        nome,
        email,
        email_confirmado,
        ativo
      FROM usuarios
      WHERE email = $1`,
      [emailNormalizado]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({
        success: true,
        mensagem:
          "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
      });
    }

    const usuario = result.rows[0];

    if (!usuario.ativo) {
      return res.status(200).json({
        success: true,
        mensagem:
          "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
      });
    }

    const tokenRecuperacao = gerarTokenConfirmacao();

    const tokenRecuperacaoHash =
      gerarHashToken(tokenRecuperacao);

    const tokenRecuperacaoExpiraEm = new Date(
      Date.now() + 60 * 60 * 1000
    );

    await pool.query(
      `UPDATE usuarios
      SET
        reset_senha_token_hash = $1,
        reset_senha_expira_em = $2
      WHERE id = $3`,
      [
        tokenRecuperacaoHash,
        tokenRecuperacaoExpiraEm,
        usuario.id,
      ]
    );

    await enviarEmailRecuperacaoSenha(
      usuario.email,
      usuario.nome,
      tokenRecuperacao
    );

    console.log("E-mail de recuperação de senha enviado:", {
      usuarioId: usuario.id,
      email: usuario.email,
      token_expira_em: tokenRecuperacaoExpiraEm,
    });

    return res.status(200).json({
      success: true,
      mensagem:
        "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
    });
  } catch (error) {
    console.error(
      "Erro ao solicitar recuperação de senha:",
      error
    );

    return res.status(500).json({
      error:
        "Não foi possível processar a solicitação de recuperação de senha.",
    });
  }
});

app.post("/api/redefinir-senha", async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) {
      return res.status(400).json({
        error: "Token e nova senha são obrigatórios.",
      });
    }

    if (novaSenha.length < 6) {
      return res.status(400).json({
        error: "A senha deve ter pelo menos 6 caracteres.",
      });
    }

    const tokenHash = gerarHashToken(token);

    const result = await pool.query(
      `SELECT
        id,
        nome,
        email,
        reset_senha_token_hash,
        reset_senha_expira_em
      FROM usuarios
      WHERE reset_senha_token_hash = $1`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "Link de recuperação inválido ou expirado.",
      });
    }

    const usuario = result.rows[0];

    if (
      !usuario.reset_senha_expira_em ||
      new Date(usuario.reset_senha_expira_em) < new Date()
    ) {
      return res.status(400).json({
        error: "Link de recuperação inválido ou expirado.",
      });
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await pool.query(
      `UPDATE usuarios
      SET
        senha_hash = $1,
        reset_senha_token_hash = NULL,
        reset_senha_expira_em = NULL
      WHERE id = $2`,
      [senhaHash, usuario.id]
    );

    console.log("Senha redefinida com sucesso:", {
      usuarioId: usuario.id,
      email: usuario.email,
    });

    return res.status(200).json({
      success: true,
      mensagem: "Senha redefinida com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);

    return res.status(500).json({
      error: "Não foi possível redefinir a senha.",
    });
  }
});

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "_");

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.use("/uploads", express.static(uploadDir));

app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

app.get(
  "/api/admin/usuarios",
  autenticarToken,
  exigirAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT
          id,
          nome,
          email,
          perfil,
          ativo,
          email_confirmado,
          criado_em
        FROM usuarios
        ORDER BY id ASC`
      );

      return res.json(result.rows);
    } catch (err) {
      console.error("Erro ao listar usuários:", err);

      return res.status(500).json({
        error: "Erro interno ao listar usuários",
      });
    }
  }
);

app.patch(
  "/api/admin/usuarios/:id/perfil",
  autenticarToken,
  exigirAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { perfil } = req.body;

      if (!["usuario", "ti"].includes(perfil)) {
        return res.status(400).json({
          error: "Perfil inválido. Utilize usuario ou ti.",
        });
      }

      const usuarioResult = await pool.query(
        `SELECT id, nome, email, perfil
        FROM usuarios
        WHERE id = $1`,
        [id]
      );

      if (usuarioResult.rows.length === 0) {
        return res.status(404).json({
          error: "Usuário não encontrado",
        });
      }

      const usuarioAlvo = usuarioResult.rows[0];

      if (
        String(usuarioAlvo.email).trim().toLowerCase() ===
        "suportehmaa@gmail.com"
      ) {
        return res.status(403).json({
          error: "Não é permitido alterar o perfil da conta administradora.",
        });
      }

      const result = await pool.query(
        `UPDATE usuarios
        SET perfil = $1
        WHERE id = $2
        RETURNING
          id,
          nome,
          email,
          perfil`,
        [perfil, id]
      );

      console.log("Perfil de usuário alterado:", {
        administrador: req.usuario.email,
        usuarioId: result.rows[0].id,
        novoPerfil: result.rows[0].perfil,
      });

      return res.json({
        success: true,
        mensagem: "Perfil atualizado com sucesso.",
        usuario: result.rows[0],
      });
    } catch (err) {
      console.error("Erro ao alterar perfil:", err);

      return res.status(500).json({
        error: "Erro interno ao alterar perfil",
      });
    }
  }
);

app.get("/api/confirmar-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        mensagem: "Token de confirmação não informado.",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const result = await pool.query(
      `
      SELECT
        id,
        nome,
        email,
        email_confirmado,
        email_confirmacao_expira_em
      FROM usuarios
      WHERE email_confirmacao_token_hash = $1
      `,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        mensagem:
          "Token de confirmação inválido ou já utilizado.",
      });
    }

    const usuario = result.rows[0];

    if (
      !usuario.email_confirmacao_expira_em ||
      new Date(usuario.email_confirmacao_expira_em) <
        new Date()
    ) {
      return res.status(400).json({
        success: false,
        mensagem:
          "O link de confirmação expirou. Solicite um novo link.",
      });
    }

    await pool.query(
      `
      UPDATE usuarios
      SET
        email_confirmado = TRUE,
        email_confirmacao_token_hash = NULL,
        email_confirmacao_expira_em = NULL
      WHERE id = $1
      `,
      [usuario.id]
    );

    console.log("E-mail confirmado:", {
      usuarioId: usuario.id,
      email: usuario.email,
    });

    return res.json({
      success: true,
      mensagem: "E-mail confirmado com sucesso.",
    });
  } catch (error) {
    console.error("Erro ao confirmar e-mail:", error);

    return res.status(500).json({
      success: false,
      mensagem: "Erro interno ao confirmar o e-mail.",
    });
  }
});

app.post(
  "/api/tickets",
  autenticarToken,
  upload.single("imagem"),
  async (req, res) => {
    try {
      const {
        setor,
        descricao,
        prioridade,
      } = req.body;

      const usuarioId = req.usuario.id;

      const profissional = req.usuario.nome;

      if (!profissional || !setor || !descricao) {
        return res.status(400).json({
          error: "Campos obrigatórios",
        });
      }

      const imagemNome = req.file
        ? req.file.filename
        : null;

      const result = await pool.query(
        `INSERT INTO tickets
        (
          profissional,
          setor,
          descricao,
          prioridade,
          status,
          imagem,
          usuario_id
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          'Aberto',
          $5,
          $6
        )
        RETURNING *`,
        [
          profissional,
          setor,
          descricao,
          prioridade || "Normal",
          imagemNome,
          usuarioId,
        ]
      );

      console.log("Novo ticket criado:", {
        ticketId: result.rows[0].id,
        usuarioId,
        profissional,
        setor,
      });

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Erro ao criar ticket:", err);

      res.status(500).json({
        error: "Erro ao criar ticket",
      });
    }
  }
);

app.get(
  "/api/tickets",
  autenticarToken,
  async (req, res) => {
    try {
      const usuarioId = req.usuario.id;

      const perfil = req.usuario.perfil;

      if (perfil === "ti") {
        const result = await pool.query(
          `SELECT *
          FROM tickets
          ORDER BY id DESC`
        );

        return res.json(result.rows);
      }

      const result = await pool.query(
        `SELECT *
        FROM tickets
        WHERE usuario_id = $1
        ORDER BY id DESC`,
        [usuarioId]
      );

      return res.json(result.rows);
    } catch (err) {
      console.error("Erro ao buscar tickets:", err);

      res.status(500).json({
        error: "Erro ao buscar tickets",
      });
    }
  }
);

app.put(
  "/api/tickets/:id/status",
  autenticarToken,
  exigirTI,
  async (req, res) => {
    try {
      const { id } = req.params;

      const { status } = req.body;

      const usuario = req.usuario.nome;

      if (status === "Em andamento") {
        await pool.query(
          `UPDATE tickets
          SET
            status = $1,
            iniciado_por = $2,
            iniciado_em = NOW()
          WHERE id = $3`,
          [
            status,
            usuario,
            id,
          ]
        );
      } else if (status === "Fechado") {
        const ticketResult = await pool.query(
          `SELECT
            t.id,
            t.profissional,
            t.setor,
            t.descricao,
            t.prioridade,
            t.usuario_id,
            u.nome AS usuario_nome,
            u.email AS usuario_email
          FROM tickets t
          LEFT JOIN usuarios u
            ON u.id = t.usuario_id
          WHERE t.id = $1`,
          [id]
        );

        if (ticketResult.rows.length === 0) {
          return res.status(404).json({
            error: "Chamado não encontrado",
          });
        }

        const ticket = ticketResult.rows[0];

        const fechamentoResult = await pool.query(
          `UPDATE tickets
          SET
            status = $1,
            fechado_por = $2,
            fechado_em = NOW()
          WHERE id = $3
          RETURNING fechado_em`,
          [
            status,
            usuario,
            id,
          ]
        );

        const fechadoEm =
          fechamentoResult.rows[0]?.fechado_em;

        if (ticket.usuario_email) {
          try {
            const dataFechamento = fechadoEm
              ? new Date(fechadoEm).toLocaleString("pt-BR")
              : new Date().toLocaleString("pt-BR");

            await enviarEmailChamadoResolvido(
              ticket.usuario_email,
              ticket.usuario_nome || ticket.profissional,
              ticket.id,
              ticket.descricao,
              ticket.setor,
              ticket.prioridade || "Normal",
              dataFechamento,
              usuario
            );

            console.log(
              "Notificação de chamado resolvido enviada:",
              {
                ticketId: ticket.id,
                email: ticket.usuario_email,
              }
            );
          } catch (emailError) {
            console.error(
              "Chamado fechado, mas não foi possível enviar o e-mail:",
              emailError
            );
          }
        } else {
          console.warn(
            "Chamado fechado sem e-mail do solicitante:",
            {
              ticketId: ticket.id,
              usuarioId: ticket.usuario_id,
            }
          );
        }
      } else {
        await pool.query(
          `UPDATE tickets
          SET status = $1
          WHERE id = $2`,
          [
            status,
            id,
          ]
        );
      }

      res.json({
        success: true,
      });
    } catch (err) {
      console.error(err);

      res.status(500).json({
        error: "Erro ao atualizar status",
      });
    }
  }
);

/*
 * ALTERAÇÃO 1:
 * Consultar comentários exige que o usuário seja o proprietário
 * do chamado ou tenha perfil autorizado de TI/administrador.
 */
app.get(
  "/api/tickets/:id/comentarios",
  autenticarToken,
  async (req, res) => {
    try {
      const ticketId = Number(req.params.id);

      if (!Number.isSafeInteger(ticketId) || ticketId <= 0) {
        return res.status(400).json({
          error: "Identificador do chamado inválido.",
        });
      }

      const usuarioResult = await pool.query(
        `SELECT id, email, perfil, ativo
         FROM usuarios
         WHERE id = $1`,
        [req.usuario.id]
      );

      if (
        usuarioResult.rows.length === 0 ||
        !usuarioResult.rows[0].ativo
      ) {
        return res.status(403).json({
          error: "Usuário não encontrado ou inativo.",
        });
      }

      const usuario = usuarioResult.rows[0];

      const emailUsuario = String(usuario.email || "")
        .trim()
        .toLowerCase();

      const usuarioEhEquipeTI =
        usuario.perfil === "ti" ||
        emailUsuario === "suportehmaa@gmail.com";

      const ticketResult = await pool.query(
        `SELECT id, usuario_id
         FROM tickets
         WHERE id = $1`,
        [ticketId]
      );

      if (ticketResult.rows.length === 0) {
        return res.status(404).json({
          error: "Chamado não encontrado.",
        });
      }

      const ticket = ticketResult.rows[0];

      if (
        !usuarioEhEquipeTI &&
        String(ticket.usuario_id) !== String(usuario.id)
      ) {
        return res.status(403).json({
          error:
            "Você não tem permissão para acessar os comentários deste chamado.",
        });
      }

      const result = await pool.query(
        `SELECT *
         FROM comentarios
         WHERE ticket_id = $1
         ORDER BY criado_em ASC`,
        [ticketId]
      );

      return res.json(result.rows);
    } catch (err) {
      console.error("Erro ao buscar comentários:", err);

      return res.status(500).json({
        error: "Erro ao buscar comentários",
      });
    }
  }
);

/*
 * ALTERAÇÃO 2:
 * Adicionar comentário exige que o usuário seja o proprietário
 * do chamado ou tenha perfil autorizado de TI/administrador.
 * A validação acontece antes do INSERT.
 */
app.post(
  "/api/tickets/:id/comentarios",
  autenticarToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const mensagem = req.body.mensagem?.trim();

      if (!mensagem) {
        return res.status(400).json({
          error: "Mensagem vazia",
        });
      }

      const ticketResult = await pool.query(
        `SELECT
          t.id,
          t.usuario_id,
          u.email AS usuario_email
        FROM tickets t
        LEFT JOIN usuarios u
          ON u.id = t.usuario_id
        WHERE t.id = $1`,
        [id]
      );

      if (ticketResult.rows.length === 0) {
        return res.status(404).json({
          error: "Chamado não encontrado",
        });
      }

      const ticket = ticketResult.rows[0];

      // Confirma o estado e o perfil atual do usuário no banco.
      const autorResult = await pool.query(
        `SELECT
          id,
          nome,
          email,
          perfil,
          ativo
        FROM usuarios
        WHERE id = $1`,
        [req.usuario.id]
      );

      if (
        autorResult.rows.length === 0 ||
        !autorResult.rows[0].ativo
      ) {
        return res.status(403).json({
          error: "Usuário não encontrado ou inativo.",
        });
      }

      const autor = autorResult.rows[0];

      const emailAutor = String(autor.email || "")
        .trim()
        .toLowerCase();

      const autorEhEquipeTI =
        autor.perfil === "ti" ||
        emailAutor === "suportehmaa@gmail.com";

      // Usuários comuns só podem comentar nos próprios chamados.
      if (
        !autorEhEquipeTI &&
        String(ticket.usuario_id) !== String(autor.id)
      ) {
        return res.status(403).json({
          error: "Você não tem permissão para comentar neste chamado.",
        });
      }

      // O comentário é registrado antes das notificações.
      await pool.query(
        `INSERT INTO comentarios
        (ticket_id, usuario, mensagem)
        VALUES
        ($1, $2, $3)`,
        [
          id,
          autor.nome,
          mensagem,
        ]
      );

      try {
        let destinatarios = [];

        if (autorEhEquipeTI) {
          // Comentário da TI/administrador:
          // notifica somente quem abriu o chamado.
          if (ticket.usuario_email) {
            destinatarios = [ticket.usuario_email];
          }
        } else {
          // Comentário do usuário comum:
          // notifica todos os membros ativos da equipe de TI
          // e inclui a conta administradora especial, se ativa.
          const equipeResult = await pool.query(
            `SELECT email
            FROM usuarios
            WHERE ativo = TRUE
              AND email IS NOT NULL
              AND TRIM(email) <> ''
              AND (
                perfil = 'ti'
                OR LOWER(TRIM(email)) = $1
              )`,
            ["suportehmaa@gmail.com"]
          );

          destinatarios = equipeResult.rows.map(
            (membro) => membro.email
          );
        }

        // Remove destinatários duplicados.
        destinatarios = [
          ...new Map(
            destinatarios
              .filter(
                (email) =>
                  typeof email === "string" &&
                  email.trim() !== ""
              )
              .map((email) => [
                email.trim().toLowerCase(),
                email.trim(),
              ])
          ).values(),
        ];

        if (destinatarios.length === 0) {
          console.warn(
            `Comentário do chamado #${id} registrado, mas nenhum destinatário foi encontrado.`
          );
        } else {
          // Cada destinatário recebe apenas uma notificação.
          // O e-mail não contém o texto do comentário.
          const resultados = await Promise.allSettled(
            destinatarios.map((email) =>
              enviarEmailNovoComentario({
                chamadoId: ticket.id,
                autorComentario: autor.nome,
                emailSolicitante: email,
                emailSuporte: null,
              })
            )
          );

          resultados.forEach((resultado, indice) => {
            if (resultado.status === "rejected") {
              console.error(
                `Falha ao notificar ${destinatarios[indice]} sobre o chamado #${id}:`,
                resultado.reason
              );
            }
          });
        }
      } catch (emailError) {
        
        console.error(
          `Comentário do chamado #${id} registrado, mas houve uma falha nas notificações:`,
          emailError
        );
      }

      return res.json({
        success: true,
        mensagem: "Comentário registrado com sucesso.",
      });
    } catch (err) {
      console.error("Erro ao registrar comentário:", err);

      return res.status(500).json({
        error: "Erro ao registrar comentário",
      });
    }
  }
);

app.listen(PORT, "0.0.0.0", () =>
  console.log(
    `Servidor rodando na rede em http://0.0.0.0:${PORT}`
  )
);