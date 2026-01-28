import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <img src="/Novologo.jpg" alt="Logo do Hospital" />
        <span className={styles.title}></span>
      </div>

      <nav className={styles.nav}>
        <Link to="/">Início</Link>
        <Link to="/chamados">Chamados</Link>
      </nav>
    </header>
  );
};

export default Header;
