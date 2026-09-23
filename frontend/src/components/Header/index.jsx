import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  isAuthenticated,
  logout,
  getUsuario,
} from "../../services/auth";

import styles from "./Header.module.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const autenticado = isAuthenticated();
  const usuario = getUsuario();

  const emChamados = location.pathname === "/chamados";
  const emGerenciarUsuarios = location.pathname === "/gerenciar-usuarios";

  const ehAdministrador =
    usuario?.email?.trim().toLowerCase() === "suportehmaa@gmail.com";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="/Novologo.jpg" alt="Logo do Hospital" />
      </div>

      {autenticado && emChamados && (
        <div className={styles.userCenter}>
          Olá, seja bem vindo(a)! 👤 {usuario?.nome}
        </div>
      )}

      <nav className={styles.nav}>
        {autenticado && emChamados && ehAdministrador && (
          <Link to="/gerenciar-usuarios" className={styles.navLink}>
            Gerenciar usuários
          </Link>
        )}

        {autenticado && emGerenciarUsuarios && (
          <Link to="/chamados" className={styles.navLink}>
            ← Voltar
          </Link>
        )}

        {autenticado && (
          <Link
            to="/"
            onClick={handleLogout}
            className={styles.navLink}
          >
            Sair
          </Link>
        )}

        {!autenticado && (
          <Link to="/login" className={styles.navLink}>
            Entrar
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;