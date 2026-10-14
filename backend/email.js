
require("dotenv").config();

const nodemailer = require("nodemailer");
const path = require("path");

const logoHospital = path.join(
  __dirname,
  "..",
  "frontend",
  "public",
  "Novologo.jpg"
);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const enviarEmailConfirmacao = async (email, nome, token) => {
  const linkConfirmacao =
    `http://192.168.1.61/confirmar-email?token=${encodeURIComponent(token)}`;

  const info = await transporter.sendMail({
    from: `"Sistema de Chamados HMAA" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Confirme seu e-mail - Sistema de Chamados HMAA",

    text: `Olá, ${nome}!

Seu cadastro no Sistema de Chamados foi realizado.

Para confirmar seu e-mail, acesse:

${linkConfirmacao}

Este link é válido por 1 hora.

Se você não realizou este cadastro, ignore este e-mail.`,

    attachments: [
      {
        filename: "Novologo.jpg",
        path: logoHospital,
        cid: "logo-hmaa",
      },
    ],

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">

        <div style="text-align: center; margin-bottom: 25px;">
          <img
            src="cid:logo-hmaa"
            alt="Hospital e Maternidade Agenor Araújo"
            style="max-width: 220px; width: 100%; height: auto;"
          />
        </div>

        <h2 style="color: #188e5a; text-align: center;">
          Sistema de Chamados HMAA
        </h2>

        <p>Olá, <strong>${nome}</strong>!</p>

        <p>
          Seu cadastro no Sistema de Chamados HMAA foi realizado com sucesso.
        </p>

        <p>
          Para ativar sua conta, confirme seu endereço de e-mail clicando no botão abaixo:
        </p>

        <p style="text-align: center; margin: 30px 0;">
          <a
            href="${linkConfirmacao}"
            style="
              background-color: #188e5a;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              display: inline-block;
              font-weight: bold;
            "
          >
            Confirmar meu e-mail
          </a>
        </p>

        <p>
          Se o botão não funcionar, copie e cole o endereço abaixo no navegador:
        </p>

        <p style="word-break: break-all; font-size: 13px; color: #666;">
          ${linkConfirmacao}
        </p>

        <p>
          <strong>Este link é válido por 1 hora.</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="font-size: 12px; color: #777; text-align: center;">
          Se você não realizou este cadastro, ignore este e-mail.
        </p>

      </div>
    `,
  });

  console.log("E-mail de confirmação enviado:", info.messageId);

  return info;
};

const enviarEmailRecuperacaoSenha = async (email, nome, token) => {
  const linkRecuperacao =
    `http://192.168.1.61/redefinir-senha?token=${encodeURIComponent(token)}`;

  const info = await transporter.sendMail({
    from: `"Sistema de Chamados HMAA" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Recuperação de senha - Sistema de Chamados HMAA",

    text: `Olá, ${nome}!

Recebemos uma solicitação para redefinir a senha da sua conta.

Para criar uma nova senha, acesse:

${linkRecuperacao}

Este link é válido por 1 hora.

Se você não solicitou a recuperação da senha, ignore este e-mail.`,

    attachments: [
      {
        filename: "Novologo.jpg",
        path: logoHospital,
        cid: "logo-hmaa",
      },
    ],

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">

        <div style="text-align: center; margin-bottom: 25px;">
          <img
            src="cid:logo-hmaa"
            alt="Hospital e Maternidade Agenor Araújo"
            style="max-width: 220px; width: 100%; height: auto;"
          />
        </div>

        <h2 style="color: #188e5a; text-align: center;">
          Sistema de Chamados HMAA
        </h2>

        <p>Olá, <strong>${nome}</strong>!</p>

        <p>
          Recebemos uma solicitação para redefinir a senha da sua conta.
        </p>

        <p>
          Para criar uma nova senha, clique no botão abaixo:
        </p>

        <p style="text-align: center; margin: 30px 0;">
          <a
            href="${linkRecuperacao}"
            style="
              background-color: #188e5a;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              display: inline-block;
              font-weight: bold;
            "
          >
            Redefinir minha senha
          </a>
        </p>

        <p>
          Se o botão não funcionar, copie e cole o endereço abaixo no navegador:
        </p>

        <p style="word-break: break-all; font-size: 13px; color: #666;">
          ${linkRecuperacao}
        </p>

        <p>
          <strong>Este link é válido por 1 hora.</strong>
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="font-size: 12px; color: #777; text-align: center;">
          Se você não solicitou a recuperação da senha, ignore este e-mail.
        </p>

      </div>
    `,
  });

  console.log("E-mail de recuperação enviado:", info.messageId);

  return info;
};

const enviarEmailChamadoResolvido = async (
  email,
  nome,
  chamadoId,
  descricao,
  setor,
  prioridade,
  dataFechamento,
  fechadoPor
) => {
  const info = await transporter.sendMail({
    from: `"Sistema de Chamados HMAA" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Chamado #${chamadoId} resolvido - Sistema de Chamados HMAA`,

    text: `Olá, ${nome}!

Informamos que o seu chamado foi finalizado pela equipe de TI.

Chamado: #${chamadoId}
Setor: ${setor}
Prioridade: ${prioridade}
Descrição: ${descricao}
Finalizado por: ${fechadoPor}
Data de fechamento: ${dataFechamento}

O chamado foi marcado como resolvido.

Caso o problema persista, entre em contato com a equipe de TI.`,

    attachments: [
      {
        filename: "Novologo.jpg",
        path: logoHospital,
        cid: "logo-hmaa",
      },
    ],

    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">

        <div style="text-align: center; margin-bottom: 25px;">
          <img
            src="cid:logo-hmaa"
            alt="Hospital e Maternidade Agenor Araújo"
            style="max-width: 220px; width: 100%; height: auto;"
          />
        </div>

        <h2 style="color: #188e5a; text-align: center;">
          Sistema de Chamados HMAA
        </h2>

        <h3 style="color: #188e5a;">
          Chamado #${chamadoId} resolvido
        </h3>

        <p>
          Olá, <strong>${nome}</strong>!
        </p>

        <p>
          Informamos que o seu chamado foi finalizado pela equipe de TI.
        </p>

        <div
          style="
            background-color: #f4f7f6;
            border-left: 4px solid #188e5a;
            padding: 15px;
            margin: 20px 0;
          "
        >
          <p style="margin: 5px 0;">
            <strong>Chamado:</strong> #${chamadoId}
          </p>

          <p style="margin: 5px 0;">
            <strong>Setor:</strong> ${setor}
          </p>

          <p style="margin: 5px 0;">
            <strong>Prioridade:</strong> ${prioridade}
          </p>

          <p style="margin: 5px 0;">
            <strong>Descrição:</strong> ${descricao}
          </p>

          <p style="margin: 5px 0;">
            <strong>Finalizado por:</strong> ${fechadoPor}
          </p>

          <p style="margin: 5px 0;">
            <strong>Data de fechamento:</strong> ${dataFechamento}
          </p>
        </div>

        <p>
          O chamado foi marcado como resolvido.
        </p>

        <p>
          Caso o problema persista, entre em contato com a equipe de TI.
        </p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

        <p style="font-size: 12px; color: #777; text-align: center;">
          Hospital e Maternidade Agenor Araújo
        </p>

      </div>
    `,
  });

  console.log("E-mail de chamado resolvido enviado:", info.messageId);

  return info;
};

// Escapa caracteres especiais para inserir valores com segurança no HTML.
const escaparHtml = (valor) =>
  String(valor ?? "").replace(/[&<>"']/g, (caractere) => {
    const entidades = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entidades[caractere];
  });

// Notifica o suporte e o solicitante de que houve um novo comentário.
// O texto do comentário não é incluído no e-mail.
const enviarEmailNovoComentario = async ({
  chamadoId,
  autorComentario,
  emailSolicitante,
  emailSuporte,
}) => {
  const destinatarios = new Map();

  [emailSuporte, emailSolicitante].forEach((email) => {
    if (typeof email !== "string" || !email.trim()) {
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();

    // Evita notificar duas vezes o mesmo endereço.
    if (!destinatarios.has(emailNormalizado)) {
      destinatarios.set(emailNormalizado, email.trim());
    }
  });

  if (destinatarios.size === 0) {
    console.warn(
      `Nenhum destinatário válido para o comentário do chamado #${chamadoId}.`
    );

    return [];
  }

  const autorSeguro = escaparHtml(autorComentario);

  const assunto =
    `Novo comentário no chamado #${chamadoId} - Sistema de Chamados HMAA`;

  const emails = [...destinatarios.values()];

  const mensagens = emails.map((email) =>
    transporter.sendMail({
      from: `"Sistema de Chamados HMAA" <${process.env.SMTP_USER}>`,
      to: email,
      subject: assunto,

      text: `Olá!

${autorComentario || "Um usuário"} adicionou um comentário ao chamado #${chamadoId}.

Para consultar o histórico e os detalhes, acesse o Sistema de Chamados HMAA.

Por segurança, o conteúdo do comentário não está incluído nesta notificação.

Hospital e Maternidade Agenor Araújo`,

      attachments: [
        {
          filename: "Novologo.jpg",
          path: logoHospital,
          cid: "logo-hmaa",
        },
      ],

      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">

          <div style="text-align: center; margin-bottom: 25px;">
            <img
              src="cid:logo-hmaa"
              alt="Hospital e Maternidade Agenor Araújo"
              style="max-width: 220px; width: 100%; height: auto;"
            />
          </div>

          <h2 style="color: #188e5a; text-align: center;">
            Sistema de Chamados HMAA
          </h2>

          <h3 style="color: #188e5a;">
            Novo comentário no chamado #${chamadoId}
          </h3>

          <p>
            Um novo comentário foi registrado no sistema.
          </p>

          <div style="background-color: #f4f7f6; border-left: 4px solid #188e5a; padding: 15px; margin: 20px 0;">
            <p style="margin: 5px 0;">
              <strong>Chamado:</strong> #${chamadoId}
            </p>

            <p style="margin: 5px 0;">
              <strong>Comentário adicionado por:</strong>
              ${autorSeguro || "Usuário não identificado"}
            </p>
          </div>

          <p>
            Acesse o Sistema de Chamados HMAA para consultar
            o histórico e os detalhes dessa interação.
          </p>

          <p style="font-size: 13px; color: #666;">
            Por segurança, o conteúdo do comentário não está
            incluído nesta notificação.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />

          <p style="font-size: 12px; color: #777; text-align: center;">
            Hospital e Maternidade Agenor Araújo
          </p>

        </div>
      `,
    })
  );

  const resultados = await Promise.allSettled(mensagens);

  resultados.forEach((resultado, indice) => {
    if (resultado.status === "fulfilled") {
      console.log(
        "Notificação de comentário enviada:",
        resultado.value.messageId
      );
    } else {
      console.error(
        `Falha ao notificar ${emails[indice]} sobre o chamado #${chamadoId}:`,
        resultado.reason
      );
    }
  });

  return resultados;
};

module.exports = {
  enviarEmailConfirmacao,
  enviarEmailRecuperacaoSenha,
  enviarEmailChamadoResolvido,
  enviarEmailNovoComentario,
};
