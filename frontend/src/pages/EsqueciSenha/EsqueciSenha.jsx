import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./EsqueciSenha.module.css";

const EsqueciSenha = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMensagem("");
    setErro("");
    setCarregando(true);

    try {
      const response = await fetch(
        "http://192.168.1.61:3001/api/esqueci-senha",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErro(
          data.error ||
            data.mensagem ||
            "Não foi possível processar a solicitação."
        );
        return;
      }

      setMensagem(
        "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha."
      );

      setEmail("");
    } catch (error) {
      console.error("Erro ao solicitar recuperação:", error);

      setErro(
        "Não foi possível conectar ao servidor. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className={styles.esqueciSenha}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>Esqueci minha senha</h1>

        <p className={styles.subtitle}>
          Informe seu e-mail para receber um link de recuperação de senha.
        </p>

        {mensagem && (
          <p className={styles.success}>
            {mensagem}
          </p>
        )}

        {erro && (
          <p className={styles.error}>
            {erro}
          </p>
        )}

        <input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <button type="submit" disabled={carregando}>
          {carregando
            ? "Enviando..."
            : "Enviar link de recuperação"}
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

export default EsqueciSenha;