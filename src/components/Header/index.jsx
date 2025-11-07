import React from "react";
import styles from "./Header.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
       
        <img src="/Novologo.jpg" alt="Logo do Hospital" />
        <span className={styles.title}>Sistema de Tickets - TI</span>
      </div>

      <nav className={styles.nav}>
        <a href="/">Início</a>
        <a href="/chamados">Chamados</a>
      </nav>
    </header>
  );
};

export default Header;
