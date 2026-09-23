import React from "react";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      © 2025 Hospital Agenor Araújo — Desenvolvido por Saulo Silva — Todos os direitos reservados.
      <br />
      <a
        href="https://github.com/ssillva1413/Sistema_Tickets"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#fff",
          textDecoration: "underline",
          fontWeight: "500",
        }}
      >
        
      </a>
    </footer>
  );
};

export default Footer;
