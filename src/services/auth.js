const usuarios = [
  {
    email: "suportehmaa@gmail.com",
    senha: "P@ss-0338",
    nome: "Saulo Silva",
  },
  {
    email: "auxsuportehmaa@gmail.com",
    senha: "P@ss-1234",
    nome: "Agimiro Junior",
  },
];

export const login = (email, senha) => {
  const usuario = usuarios.find(
    (u) => u.email === email && u.senha === senha
  );

  if (!usuario) return false;

  const agora = new Date().getTime();
  const expiraEm = agora + 4 * 60 * 60 * 1000; 

  localStorage.setItem(
    "auth",
    JSON.stringify({
      autenticado: true,
      nome: usuario.nome,
      email: usuario.email,
      expiraEm,
    })
  );

  return true;
};

export const logout = () => {
  localStorage.removeItem("auth");
};

export const isAuthenticated = () => {
  const data = localStorage.getItem("auth");
  if (!data) return false;

  const auth = JSON.parse(data);
  const agora = new Date().getTime();

  if (agora > auth.expiraEm) {
    logout();
    return false;
  }

  return auth.autenticado;
};

export const getUsuario = () => {
  const data = localStorage.getItem("auth");
  if (!data) return null;

  return JSON.parse(data);
};
