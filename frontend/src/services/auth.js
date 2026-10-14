const API_URL = import.meta.env.VITE_API_URL;
const TEMPO_INATIVIDADE = 30 * 60 * 1000;
const INTERVALO_REGISTRO_ATIVIDADE = 5000; 
const CHAVE_ULTIMA_ATIVIDADE = "ultimaAtividade";
const EMAIL_ADMIN = "suportehmaa@gmail.com";

const perfilIsento = (usuario) => {
  if (!usuario) return false;

  return (
    usuario.email?.trim().toLowerCase() === EMAIL_ADMIN ||
    usuario.perfil === "ti"
  );
};

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

    // A sessão fica isolada nesta aba do navegador.
    sessionStorage.setItem(
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

    // Registra a atividade somente nesta aba.
    sessionStorage.setItem(
      CHAVE_ULTIMA_ATIVIDADE,
      Date.now().toString()
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
  sessionStorage.removeItem("auth");
  sessionStorage.removeItem(CHAVE_ULTIMA_ATIVIDADE);
};

export const getUsuario = () => {
  const data = sessionStorage.getItem("auth");

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

export const isAuthenticated = () => {
  const usuario = getUsuario();

  if (
    !usuario ||
    usuario.autenticado !== true ||
    !usuario.token
  ) {
    return false;
  }

  // Administrador e TI não expiram por inatividade.
  if (perfilIsento(usuario)) {
    return true;
  }

  const ultimaAtividade = Number(
    sessionStorage.getItem(CHAVE_ULTIMA_ATIVIDADE)
  );

  // Encerra a sessão se não houver horário válido.
  if (!ultimaAtividade || Number.isNaN(ultimaAtividade)) {
    logout();
    return false;
  }

  const tempoDecorrido = Date.now() - ultimaAtividade;

  if (tempoDecorrido >= TEMPO_INATIVIDADE) {
    logout();
    return false;
  }

  return true;
};

export const registrarAtividade = () => {
  const usuario = getUsuario();

  if (
    !usuario ||
    usuario.autenticado !== true ||
    !usuario.token
  ) {
    return;
  }

  // Não registra atividade para administrador ou TI.
  if (perfilIsento(usuario)) {
    return;
  }

  // Não renova uma sessão que já expirou.
  if (!isAuthenticated()) {
    return;
  }

  const agora = Date.now();

  const ultimaGravacao = Number(
    sessionStorage.getItem(CHAVE_ULTIMA_ATIVIDADE)
  );

  // Evita gravar a cada movimento do mouse.
  if (
    ultimaGravacao &&
    !Number.isNaN(ultimaGravacao) &&
    agora - ultimaGravacao < INTERVALO_REGISTRO_ATIVIDADE
  ) {
    return;
  }

  sessionStorage.setItem(
    CHAVE_ULTIMA_ATIVIDADE,
    agora.toString()
  );
};

export const verificarInatividade = () => {
  return isAuthenticated();
};
