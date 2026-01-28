import React, { useEffect, useState } from "react";
import styles from "./Chamados.module.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Chamados = () => {
  const [tickets, setTickets] = useState([]);

  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("Todas");
  const [busca, setBusca] = useState("");

  const [paginaAtual, setPaginaAtual] = useState(1);
  const [itensPorPagina, setItensPorPagina] = useState(10);

  const carregarTickets = async () => {
    const res = await fetch("http://localhost:3001/api/tickets");
    const data = await res.json();
    setTickets(data);
  };

  useEffect(() => {
    carregarTickets();
  }, []);

  const atualizarStatus = async (id, novoStatus) => {
    await fetch(`http://localhost:3001/api/tickets/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });

    carregarTickets();
  };

  /* ===== INDICADORES ===== */
  const totalAbertos = tickets.filter(t => t.status === "Aberto").length;
  const totalEmAndamento = tickets.filter(t => t.status === "Em andamento").length;
  const totalFechados = tickets.filter(t => t.status === "Fechado").length;

  /* ===== FILTROS ===== */
  const ticketsFiltrados = tickets.filter((ticket) => {
    const statusOk =
      filtroStatus === "Todos" || ticket.status === filtroStatus;

    const prioridadeOk =
      filtroPrioridade === "Todas" ||
      ticket.prioridade === filtroPrioridade;

    const buscaOk =
      ticket.profissional.toLowerCase().includes(busca.toLowerCase()) ||
      ticket.descricao.toLowerCase().includes(busca.toLowerCase());

    return statusOk && prioridadeOk && buscaOk;
  });

  /* ===== PAGINAÇÃO ===== */
  const totalPaginas = Math.ceil(
    ticketsFiltrados.length / itensPorPagina
  );

  const inicio = (paginaAtual - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;

  const ticketsPaginados = ticketsFiltrados.slice(inicio, fim);

  const trocarStatusViaCard = (status) => {
    setFiltroStatus(status);
    setPaginaAtual(1);
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.content}>
        <h1 className={styles.title}>Chamados</h1>

        {/* ===== TOPO ===== */}
        <div className={styles.topBar}>
          {/* FILTROS */}
          <div className={styles.filters}>
            <select
              value={filtroStatus}
              onChange={(e) => {
                setFiltroStatus(e.target.value);
                setPaginaAtual(1);
              }}
            >
              <option value="Todos">Todos os Status</option>
              <option value="Aberto">Aberto</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Fechado">Fechado</option>
            </select>

            <select
              value={filtroPrioridade}
              onChange={(e) => {
                setFiltroPrioridade(e.target.value);
                setPaginaAtual(1);
              }}
            >
              <option value="Todas">Todas as Prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Normal">Normal</option>
              <option value="Baixa">Baixa</option>
            </select>

            <input
              type="text"
              placeholder="Buscar por profissional ou descrição..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaAtual(1);
              }}
              className={styles.search}
            />
          </div>

          {/* CARDS */}
          <div className={styles.cards}>
            <div
              className={`${styles.card} ${styles.cardAberto}`}
              onClick={() => trocarStatusViaCard("Aberto")}
            >
              <span>Abertos</span>
              <strong>{totalAbertos}</strong>
            </div>

            <div
              className={`${styles.card} ${styles.cardAndamento}`}
              onClick={() => trocarStatusViaCard("Em andamento")}
            >
              <span>Em andamento</span>
              <strong>{totalEmAndamento}</strong>
            </div>

            <div
              className={`${styles.card} ${styles.cardFechado}`}
              onClick={() => trocarStatusViaCard("Fechado")}
            >
              <span>Fechados</span>
              <strong>{totalFechados}</strong>
            </div>
          </div>
        </div>

        {/* ===== TABELA ===== */}
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Profissional</th>
                <th>Setor</th>
                <th>Descrição</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {ticketsPaginados.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.profissional}</td>
                  <td>{ticket.setor}</td>
                  <td>{ticket.descricao}</td>

                  <td>
                    <span className={`${styles.badge} ${styles[ticket.prioridade.toLowerCase()]}`}>
                      {ticket.prioridade}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`${styles.status} ${
                        styles[ticket.status.toLowerCase().replace(" ", "")]
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </td>

                  <td>
                    {ticket.status === "Aberto" && (
                      <button
                        className={styles.btnStart}
                        onClick={() => atualizarStatus(ticket.id, "Em andamento")}
                      >
                        Iniciar
                      </button>
                    )}

                    {ticket.status === "Em andamento" && (
                      <button
                        className={styles.btnClose}
                        onClick={() => atualizarStatus(ticket.id, "Fechado")}
                      >
                        Fechar
                      </button>
                    )}

                    {ticket.status === "Fechado" && <span>—</span>}
                  </td>
                </tr>
              ))}

              {ticketsPaginados.length === 0 && (
                <tr>
                  <td colSpan="7" className={styles.empty}>
                    Nenhum chamado encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ===== PAGINAÇÃO ===== */}
        <div className={styles.pagination}>
          <select
            value={itensPorPagina}
            onChange={(e) => {
              setItensPorPagina(Number(e.target.value));
              setPaginaAtual(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>

          <div className={styles.pages}>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i}
                className={paginaAtual === i + 1 ? styles.activePage : ""}
                onClick={() => setPaginaAtual(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Chamados;
