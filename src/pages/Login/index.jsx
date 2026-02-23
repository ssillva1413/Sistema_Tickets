import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/auth";
import styles from "./Login.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const ok = login(email, senha);
    if (ok) {
      navigate("/chamados");
    } else {
      setErro("Acesso restrito à equipe de TI");
    }
  };

  return (
    <div className={styles.login}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1>Sign in</h1>

        {erro && <p className={styles.error}>{erro}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <button type="submit">Entrar</button>

        <button
          type="button"
          className={styles.back}
          onClick={() => navigate("/")}
        >
          Voltar
        </button>
      </form>
    </div>
  );
};

export default Login;
