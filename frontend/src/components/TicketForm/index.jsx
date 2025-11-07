import React, { useState } from "react";
import styles from "./TicketForm.module.css";

const TicketForm = () => {
  const [formData, setFormData] = useState({
    setor: "",
    profissional: "",
    descricao: "",
    prioridade: "Normal",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Ticket enviado:", formData);
    alert("Chamado enviado com sucesso!");
    setFormData({
      setor: "",
      profissional: "",
      descricao: "",
      prioridade: "Normal",
    });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      <div className={styles.field}>
        <label>Nome do Profissional:</label>
        <input
          type="text"
          name="profissional"
          placeholder="Seu nome completo"
          value={formData.profissional}
          onChange={handleChange}
          required
        />
      </div>
      <div className={styles.field}>
        <label>Setor:</label>
        <input
          type="text"
          name="setor"
          placeholder="Ex: Enfermagem, Laboratório..."
          value={formData.setor}
          onChange={handleChange}
          required
        />
      </div>

      

      <div className={styles.field}>
        <label>Descrição do Problema:</label>
        <textarea
          name="descricao"
          rows="4"
          placeholder="Descreva o problema ou solicitação..."
          value={formData.descricao}
          onChange={handleChange}
          required
        ></textarea>
      </div>

      <div className={styles.field}>
        <label>Prioridade:</label>
        <select
          name="prioridade"
          value={formData.prioridade}
          onChange={handleChange}
        >
          <option value="Baixa">Baixa</option>
          <option value="Normal">Normal</option>
          <option value="Alta">Alta</option>
        </select>
      </div>

      <button type="submit" className={styles.button}>
        Enviar
      </button>
    </form>
  );
};

export default TicketForm;
