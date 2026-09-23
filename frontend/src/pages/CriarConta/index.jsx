import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CriarConta.module.css";

const CriarConta = () => {
  const navigate = useNavigate();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

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

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);

    try {
      const response = await fetch(
        "http://192.168.1.61:3001/api/usuarios",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nome: nome.trim(),
            email: email.trim(),
            senha,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErro(
          data.error ||
            data.mensagem ||
            "Não foi possível criar a conta."
        );
        return;
      }

      setMensagem(
        data.mensagem ||
          "Conta criada com sucesso. Verifique seu e-mail para confirmar o cadastro."
      );

      setNome("");
      setEmail("");
      setSenha("");
      setConfirmarSenha("");
    } catch (error) {
      console.error("Erro ao criar conta:", error);

      setErro(
        "Não foi possível conectar ao servidor. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.criarConta}>
      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <h1>Criar conta</h1>

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

        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className={styles.campoSenha}>
          <input
            type={mostrarSenha ? "text" : "password"}
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            autoComplete="new-password"
          />

          <button
            type="button"
            className={styles.botaoVisualizarSenha}
            onClick={() => setMostrarSenha(!mostrarSenha)}
            aria-label={
              mostrarSenha ? "Ocultar senha" : "Mostrar senha"
            }
            title={
              mostrarSenha ? "Ocultar senha" : "Mostrar senha"
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
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChange={(e) =>
              setConfirmarSenha(e.target.value)
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
            ? "Criando conta..."
            : "Criar conta"}
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

export default CriarConta;