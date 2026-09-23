const jwt = require("jsonwebtoken");

const { JWT_SECRET } = require("./auth");

const autenticarToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: "Token não informado",
    });
  }

  const partes = authHeader.split(" ");

  if (partes.length !== 2 || partes[0] !== "Bearer") {
    return res.status(401).json({
      error: "Formato de token inválido",
    });
  }

  const token = partes[1];

  try {
    const usuario = jwt.verify(token, JWT_SECRET);

    req.usuario = usuario;

    next();
  } catch (error) {
    return res.status(401).json({
      error: "Token inválido ou expirado",
    });
  }
};

const exigirTI = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      error: "Usuário não autenticado",
    });
  }

  if (req.usuario.perfil !== "ti") {
    return res.status(403).json({
      error: "Acesso permitido somente para a equipe de TI",
    });
  }

  next();
};

const exigirAdmin = (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({
      error: "Usuário não autenticado",
    });
  }

  const email = String(req.usuario.email || "").trim().toLowerCase();

  if (email !== "suportehmaa@gmail.com") {
    return res.status(403).json({
      error: "Acesso permitido somente ao administrador",
    });
  }

  next();
};

module.exports = {
  autenticarToken,
  exigirTI,
  exigirAdmin,
};