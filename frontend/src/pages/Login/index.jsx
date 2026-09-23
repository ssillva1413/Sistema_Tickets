import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth";
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [erro, setErro] = useState("");

  const [mostrarReenvio, setMostrarReenvio] = useState(false);
  const [emailReenvio, setEmailReenvio] = useState("");
  const [mensagemReenvio, setMensagemReenvio] = useState("");
  const [erroReenvio, setErroReenvio] = useState("");
  const [carregandoReenvio, setCarregandoReenvio] = useState(false);
  const [emailJaConfirmado, setEmailJaConfirmado] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErro("");

    const resultado = await login(email, senha);

    if (resultado.sucesso) {
      navigate("/chamados");
    } else {
      setErro(resultado.erro);
    }
  };

  const handleReenviarConfirmacao = async (e) => {
    e.preventDefault();

    setMensagemReenvio("");
    setErroReenvio("");
    setEmailJaConfirmado(false);
    setCarregandoReenvio(true);

    try {
      const response = await fetch(
        "http://192.168.1.61:3001/api/reenviar-confirmacao",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: emailReenvio.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErroReenvio(
          data.mensagem ||
            data.error ||
            "Não foi possível reenviar o e-mail."
        );

        return;
      }

      if (data.success === false) {
        setEmailJaConfirmado(true);
        setErroReenvio(data.mensagem);

        return;
      }

      setMensagemReenvio(data.mensagem);
      setEmailReenvio("");
    } catch (error) {
      console.error("Erro ao reenviar confirmação:", error);

      setErroReenvio(
        "Não foi possível conectar ao servidor. Tente novamente."
      );
    } finally {
      setCarregandoReenvio(false);
    }
  };

  return (
    <div className={styles.login}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>Entrar</h1>

        {erro && <p className={styles.error}>{erro}</p>}

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

        <button type="submit">Entrar</button>

        <div className={styles.links}>
          <button
            type="button"
            onClick={() => navigate("/criar-conta")}
          >
            Criar conta
          </button>

          <span>|</span>

          <button
            type="button"
            onClick={() => navigate("/esqueci-senha")}
          >
            Esqueceu a senha?
          </button>
        </div>

        {!mostrarReenvio ? (
          <button
            type="button"
            className={styles.linkConfirmacao}
            onClick={() => {
              setMostrarReenvio(true);
              setErroReenvio("");
              setMensagemReenvio("");
            }}
          >
            Não recebeu o e-mail?
          </button>
        ) : (
          <div className={styles.reenvioConfirmacao}>
            <p>
              Informe seu e-mail para receber um novo link de confirmação.
            </p>

            {mensagemReenvio && (
              <p className={styles.success}>
                {mensagemReenvio}
              </p>
            )}

            {erroReenvio && (
              <p className={styles.error}>
                {erroReenvio}
              </p>
            )}

            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={emailReenvio}
              onChange={(e) => setEmailReenvio(e.target.value)}
              required
            />

            {!emailJaConfirmado && (
              <button
                type="button"
                className={styles.botaoReenvio}
                disabled={carregandoReenvio}
                onClick={handleReenviarConfirmacao}
              >
                {carregandoReenvio
                  ? "Enviando..."
                  : "Reenviar confirmação"}
              </button>
            )}

            <button
              type="button"
              className={styles.cancelarReenvio}
              onClick={() => {
                setMostrarReenvio(false);
                setEmailReenvio("");
                setErroReenvio("");
                setMensagemReenvio("");
                setEmailJaConfirmado(false);
              }}
            >
              {emailJaConfirmado ? "Fechar" : "Cancelar"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;