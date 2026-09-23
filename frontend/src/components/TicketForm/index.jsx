import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import styles from "./TicketForm.module.css";

import { getToken } from "../../services/auth";

const setoresHospital = [
  "Recepção SUS",
  "Clinica Casa de Saúde",
  "Comercial",
  "CAF/Farmácia",
  "Centro Cirúrgico",
  "Clinica cirurgica SUS",
  "Clinica cirurgica PARTICULAR",
  "Nutrição",
  "Facilities",
  "Clinica Medica",
  "Faturamento",
  "Financeiro",
  "Departamento Pessoal",
  "Compras",
  "Marketing",
  "SCIH ",
  "NQSP",
  "Direção Assistencial",
  "Direção Geral",
  "UTI Adulto",
  "UTI Pediatrica",
  "Engenharia Clínica",
  "Outro",
];

const TicketForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    setor: "",
    descricao: "",
    prioridade: "Normal",
    imagem: null,
  });

  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [numeroChamado, setNumeroChamado] = useState(null);

  const sucessoRef = useRef(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      imagem: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (enviando) return;

    setEnviando(true);

    try {
      const data = new FormData();

      data.append("setor", formData.setor);
      data.append("descricao", formData.descricao);
      data.append("prioridade", formData.prioridade);

      if (formData.imagem) {
        data.append("imagem", formData.imagem);
      }

      const API_URL = import.meta.env.VITE_API_URL;
      const token = getToken();

      const response = await fetch(`${API_URL}/api/tickets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setNumeroChamado(result.id);
        setEnviado(true);

        setFormData({
          setor: "",
          descricao: "",
          prioridade: "Normal",
          imagem: null,
        });

        setTimeout(() => {
          sucessoRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);

        setTimeout(() => {
          navigate("/chamados");
        }, 10000);
      } else {
        console.error("Erro ao enviar chamado:", result);
      }
    } catch (error) {
      console.error("Erro ao enviar:", error);
    }

    setEnviando(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      {!enviado && (
        <button
          type="button"
          className={styles.button}
          onClick={() => navigate("/chamados")}
        >
          ← Voltar
        </button>
      )}

      {enviado && (
        <div ref={sucessoRef} className={styles.sucesso}>
          <strong>
            ✔ Chamado #{numeroChamado} aberto com sucesso
          </strong>

          <span>
            Sua solicitação foi registrada. A equipe de TI irá
            analisar em breve.
          </span>


          <div className={styles.progressBar}></div>
        </div>
      )}

      <div className={styles.field}>
        <label>Setor</label>

        <select
          name="setor"
          value={formData.setor}
          onChange={handleChange}
          required
        >
          <option value="">Selecione</option>

          {setoresHospital.map((setor) => (
            <option key={setor} value={setor}>
              {setor}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label>Descrição do Problema</label>

        <textarea
          name="descricao"
          rows="3"
          placeholder="Descreva o problema..."
          value={formData.descricao}
          onChange={handleChange}
          required
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Prioridade</label>

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
          <label>Anexar Imagem</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {!enviado && (
        <button
          type="submit"
          className={styles.button}
          disabled={enviando}
        >
          {enviando ? "Enviando..." : "Enviar "}
        </button>
      )}
    </form>
  );
};

export default TicketForm;