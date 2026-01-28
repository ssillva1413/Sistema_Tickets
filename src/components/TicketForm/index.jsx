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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert("Chamado enviado com sucesso!");
        setFormData({
          setor: "",
          profissional: "",
          descricao: "",
          prioridade: "Normal",
        });
      } else {
        alert("Erro ao enviar o chamado!");
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar o chamado!");
    }
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
          placeholder="Ex: Recepção, Centro Cirúrgico..."
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
        Enviar Chamado
      </button>
    </form>
  );
};

export default TicketForm;
