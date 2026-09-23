require("dotenv").config();

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET não configurado. Verifique o arquivo .env do backend."
  );
}

const gerarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      perfil: usuario.perfil,
    },
    JWT_SECRET,
    {
      expiresIn: "4h",
    }
  );
};

module.exports = {
  gerarToken,
  JWT_SECRET,
};