import React, { useState } from "react";
import styles from "./TicketForm.module.css";

const setoresHospital = [
  "Recepção SUS",
  "Clinica Casa de Saúde",
  "Comercial",
  "Farmácia",
  "Centro Cirúrgico",
  "Clinica particular SUS",
  "Clinica particular PARTICULAR",
  "Nutrição",
  "Facilities",
  "Clinica Medica",
  "Faturamento",
  "Financeiro",
  "Departamento Pessoal",
  "Compras e Marketing",
  "SCIH e NQSP",
  "Direção Assistencial",
  "Direção Geral",
  "UTI Adulto",
  "UTI Pediatrica",
  "Outro",
];

const TicketForm = () => {
  const [formData, setFormData] = useState({
    setor: "",
    profissional: "",
    descricao: "",
    prioridade: "Normal",
    imagem: null,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, imagem: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append("profissional", formData.profissional);
      data.append("setor", formData.setor);
      data.append("descricao", formData.descricao);
      data.append("prioridade", formData.prioridade);
      if (formData.imagem) data.append("imagem", formData.imagem);

      const response = await fetch("http://localhost:3001/api/tickets", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Chamado ${result.id} aberto com sucesso!`);

        setFormData({
          setor: "",
          profissional: "",
          descricao: "",
          prioridade: "Normal",
          imagem: null,
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
          value={formData.profissional}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.field}>
        <label>Setor:</label>
        <select
          name="setor"
          value={formData.setor}
          onChange={handleChange}
          required
        >
          <option value="">Selecione o setor</option>
          {setoresHospital.map((setor) => (
            <option key={setor} value={setor}>
              {setor}
            </option>
          ))}
        </select>
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
        />
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

      <div className={styles.field}>
        <label>Anexar Imagem (opcional):</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
      </div>

      <button type="submit" className={styles.button}>
        Enviar Chamado
      </button>
    </form>
  );
};

export default TicketForm;