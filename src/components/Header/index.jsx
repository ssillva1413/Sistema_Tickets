import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAuthenticated, logout, getUsuario } from "../../services/auth";
import styles from "./Header.module.css";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const autenticado = isAuthenticated();
  const emChamados = location.pathname === "/chamados";
  const usuario = getUsuario();

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
         Olá, sem bem vindo! 👤 {usuario?.nome}
        </div>
      )}

      <nav className={styles.nav}>
        {!autenticado && (
          <Link to="/login">Sign in</Link>
        )}

        {autenticado && emChamados && (
          <span onClick={handleLogout} className={styles.link}>
            Sign out
          </span>
        )}
      </nav>
    </header>
  );
};

export default Header;
