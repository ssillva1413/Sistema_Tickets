const API_URL = import.meta.env.VITE_API_URL;

export const login = async (email, senha) => {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        senha,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        sucesso: false,
        erro: data.error || "E-mail ou senha inválidos",
      };
    }

    localStorage.setItem(
      "auth",
      JSON.stringify({
        autenticado: true,
        token: data.token,
        id: data.usuario.id,
        nome: data.usuario.nome,
        email: data.usuario.email,
        perfil: data.usuario.perfil,
      })
    );

    return {
      sucesso: true,
      usuario: data.usuario,
    };
  } catch (error) {
    console.error("Erro ao realizar login:", error);

    return {
      sucesso: false,
      erro: "Não foi possível conectar ao servidor",
    };
  }
};

export const logout = () => {
  localStorage.removeItem("auth");
};

export const isAuthenticated = () => {
  const data = localStorage.getItem("auth");

  if (!data) return false;

  try {
    const auth = JSON.parse(data);

    return auth.autenticado === true && !!auth.token;
  } catch {
    logout();
    return false;
  }
};

export const getUsuario = () => {
  const data = localStorage.getItem("auth");

  if (!data) return null;

  try {
    return JSON.parse(data);
  } catch {
    logout();
    return null;
  }
};

export const getToken = () => {
  const usuario = getUsuario();
  return usuario?.token || null;
};