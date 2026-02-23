import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import styles from "./WhatsappButton.module.css";

const WhatsappButton = () => {
  const numero = "5588993849658";

  const mensagem =
    "Olá, preciso urgente de suporte da TI.%0A" +
    "Sistema: Tickets%0A" +
    "Informe o numero do ticket e o motivo da urgência:";

  const link = `https://wa.me/${numero}?text=${mensagem}`;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.whatsapp}
    >
      <FaWhatsapp size={40} />
    </a>
  );
};

export default WhatsappButton;
