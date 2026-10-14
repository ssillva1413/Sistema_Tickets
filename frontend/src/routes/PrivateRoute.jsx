import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import {
  isAuthenticated,
  registrarAtividade,
  verificarInatividade,
  logout,
  getUsuario,
} from "../services/auth";

const INTERVALO_VERIFICACAO = 1000;
const EMAIL_ADMIN = "suportehmaa@gmail.com";

const usuarioIsento = (usuario) => {
  if (!usuario) return false;

  return (
    usuario.email?.trim().toLowerCase() === EMAIL_ADMIN ||
    usuario.perfil === "ti"
  );
};

const PrivateRoute = ({ children }) => {
  const [autenticado, setAutenticado] = useState(() =>
    isAuthenticated()
  );

  useEffect(() => {
    if (!autenticado) return;

    const usuario = getUsuario();

    // Administrador e TI não recebem o limite de inatividade.
    if (usuarioIsento(usuario)) {
      return;
    }

    const encerrarSessao = () => {
      logout();
      setAutenticado(false);
    };

    const verificarSessao = () => {
      if (!verificarInatividade()) {
        encerrarSessao();
      }
    };

    const tratarAtividade = () => {
      // Primeiro verifica se a sessão ainda está válida.
      if (!isAuthenticated()) {
        encerrarSessao();
        return;
      }

      // Registra a atividade se a sessão ainda estiver válida.
      registrarAtividade();
    };

    const eventos = [
      "mousedown",
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];

    eventos.forEach((evento) => {
      window.addEventListener(evento, tratarAtividade);
    });

    // Verifica periodicamente se a sessão expirou.
    const intervalo = window.setInterval(
      verificarSessao,
      INTERVALO_VERIFICACAO
    );

    // Ao retornar à aba, verifica se o prazo já passou.
    const tratarVisibilidade = () => {
      if (document.visibilityState === "visible") {
        verificarSessao();
      }
    };

    document.addEventListener(
      "visibilitychange",
      tratarVisibilidade
    );

    // Sincroniza o encerramento da sessão entre abas do navegador.
    const tratarMudancaArmazenamento = (evento) => {
      if (evento.key === "auth" || evento.key === null) {
        if (!isAuthenticated()) {
          setAutenticado(false);
        }
      }

      if (evento.key === "ultimaAtividade") {
        verificarSessao();
      }
    };

    window.addEventListener(
      "storage",
      tratarMudancaArmazenamento
    );

    return () => {
      eventos.forEach((evento) => {
        window.removeEventListener(evento, tratarAtividade);
      });

      window.clearInterval(intervalo);

      document.removeEventListener(
        "visibilitychange",
        tratarVisibilidade
      );

      window.removeEventListener(
        "storage",
        tratarMudancaArmazenamento
      );
    };
  }, [autenticado]);

  if (!autenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;