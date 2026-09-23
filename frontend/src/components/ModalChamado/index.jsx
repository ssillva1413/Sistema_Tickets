import { useEffect, useState } from "react";
import styles from "./ModalChamado.module.css";
import { getToken } from "../../services/auth";

const API_URL = import.meta.env.VITE_API_URL;

const ModalChamado = ({ chamado, onClose }) => {

  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");


  const carregarComentarios = async () => {

    if (!chamado?.id) return;

    try {

          const res = await fetch(
      `${API_URL}/api/tickets/${chamado.id}/comentarios`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

      const data = await res.json();

      if (Array.isArray(data)) {
        setComentarios(data);
      } else {
        console.warn("Resposta inesperada da API:", data);
        setComentarios([]);
      }

    } catch (err) {

      console.error("Erro ao carregar comentários:", err);
      setComentarios([]);

    }
  };

  const enviarComentario = async () => {

  if (!novoComentario.trim()) return;

  try {

    const res = await fetch(
      `${API_URL}/api/tickets/${chamado.id}/comentarios`,
      {
        method: "POST",
          headers: {
      "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        mensagem: novoComentario,
      })
      }
    );

    const data = await res.json();
    console.log("Resposta servidor:", data);

    if (res.ok) {

      setNovoComentario("");
      carregarComentarios();

    } else {

      console.error("Erro ao enviar comentário:", data);

    }

  } catch (err) {

    console.error("Erro ao enviar comentário:", err);

  }

};

  useEffect(() => {

    if (chamado) {
      carregarComentarios();
    }

  }, [chamado]);

  if (!chamado) return null;

  const imprimir = () => window.print();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.printHeader}>
          <img src="/Novologo.jpg" alt="Logo Hospital" />
          <div>
            <h1>Ficha de Chamado</h1>
          </div>
        </div>

        <header className={styles.header}>
          <h2>Chamado #{chamado.id}</h2>

          <div className={styles.headerActions}>
            <button onClick={imprimir}>🖨️</button>
            <button onClick={onClose}>✖</button>
          </div>
        </header>

        <div className={styles.content}>

          <div className={styles.section}>
            <strong>Descrição</strong>
            <p>{chamado.descricao}</p>
          </div>

          <div className={styles.grid}>
            <span><strong>Setor:</strong> {chamado.setor}</span>
            <span><strong>Prioridade:</strong> {chamado.prioridade}</span>
            <span><strong>Status:</strong> {chamado.status}</span>
            <span><strong>Criado em:</strong> {chamado.criadoEm}</span>
            <span><strong>Prazo:</strong> {chamado.prazoLabel}</span>
            <span><strong>Prazo final:</strong> {chamado.prazoFinal}</span>
          </div>

          <hr />

          <div className={styles.grid}>
            <span><strong>Aberto por:</strong> {chamado.abertoPor}</span>
            <span><strong>Iniciado por:</strong> {chamado.iniciadoPor || "—"}</span>
            <span><strong>Fechado por:</strong> {chamado.fechadoPor || "—"}</span>
            <span>
              <strong>Data de fechamento:</strong>{" "}
              {chamado.dataFechamento || "—"}
            </span>
          </div>

          <hr />

          <div className={styles.comentarios}>
            <strong>Comentários</strong>

            <div className={styles.listaComentarios}>

              {comentarios.length === 0 && (
                <p className={styles.semComentarios}>
                  Nenhum comentário ainda.
                </p>
              )}

              {comentarios.map((c) => (
                <div key={c.id} className={styles.comentarioItem}>

                  <div className={styles.comentarioHeader}>
                    <b>{c.usuario}</b>
                    <span>
                      {new Date(c.criado_em).toLocaleString("pt-BR")}
                    </span>
                  </div>

                  <div className={styles.comentarioMensagem}>
                    {c.mensagem}
                  </div>

                </div>
              ))}

            </div>

            <textarea
              className={styles.textarea}
              placeholder="Escrever comentário..."
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
            />

            <button
              className={styles.botaoEnviar}
              onClick={enviarComentario}
            >
              Enviar comentário
            </button>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ModalChamado;




