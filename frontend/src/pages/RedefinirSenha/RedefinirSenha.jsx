import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./RedefinirSenha.module.css";

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] =
    useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] =
    useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErro("");
    setMensagem("");

    if (!token) {
      setErro(
        "Link de recuperação inválido ou expirado."
      );
      return;
    }

    if (senha.length < 6) {
      setErro(
        "A senha deve ter pelo menos 6 caracteres."
      );
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch(
        "http://192.168.1.61:3001/api/redefinir-senha",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            novaSenha: senha,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErro(
          data.error ||
            data.mensagem ||
            "Não foi possível redefinir sua senha."
        );
        return;
      }

      setMensagem(
        data.mensagem ||
          "Senha redefinida com sucesso."
      );

      setSenha("");
      setConfirmarSenha("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(
        "Erro ao redefinir senha:",
        error
      );

      setErro(
        "Não foi possível conectar ao servidor. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.redefinirSenha}>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <h1>Redefinir senha</h1>

        {erro && (
          <p className={styles.error}>
            {erro}
          </p>
        )}

        {mensagem && (
          <p className={styles.success}>
            {mensagem}
          </p>
        )}

        <div className={styles.campoSenha}>
          <input
            type={
              mostrarSenha
                ? "text"
                : "password"
            }
            placeholder="Nova senha"
            value={senha}
            onChange={(e) =>
              setSenha(e.target.value)
            }
            required
            autoComplete="new-password"
          />

          <button
            type="button"
            className={styles.botaoVisualizarSenha}
            onClick={() =>
              setMostrarSenha(!mostrarSenha)
            }
            aria-label={
              mostrarSenha
                ? "Ocultar senha"
                : "Mostrar senha"
            }
            title={
              mostrarSenha
                ? "Ocultar senha"
                : "Mostrar senha"
            }
          >
            {mostrarSenha ? (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M3 3l18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <path
                  d="M10.6 6.2A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 6a17.8 17.8 0 0 1-3.1 3.7M6.1 6.1C3.4 8.1 2 12 2 12s3.5 6 10 6c1.4 0 2.7-.3 3.8-.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        <div className={styles.campoSenha}>
          <input
            type={
              mostrarConfirmarSenha
                ? "text"
                : "password"
            }
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChange={(e) =>
              setConfirmarSenha(
                e.target.value
              )
            }
            required
            autoComplete="new-password"
          />

          <button
            type="button"
            className={styles.botaoVisualizarSenha}
            onClick={() =>
              setMostrarConfirmarSenha(
                !mostrarConfirmarSenha
              )
            }
            aria-label={
              mostrarConfirmarSenha
                ? "Ocultar confirmação de senha"
                : "Mostrar confirmação de senha"
            }
            title={
              mostrarConfirmarSenha
                ? "Ocultar senha"
                : "Mostrar senha"
            }
          >
            {mostrarConfirmarSenha ? (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="M3 3l18 18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                <path
                  d="M10.6 6.2A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 6a17.8 17.8 0 0 1-3.1 3.7M6.1 6.1C3.4 8.1 2 12 2 12s3.5 6 10 6c1.4 0 2.7-.3 3.8-.8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={carregando}
        >
          {carregando
            ? "Redefinindo..."
            : "Redefinir senha"}
        </button>

        <div className={styles.links}>
          <button
            type="button"
            onClick={() => navigate("/login")}
          > 
            Voltar para o login
          </button>
        </div>
      </form>
    </div>
  );
};

export default RedefinirSenha;