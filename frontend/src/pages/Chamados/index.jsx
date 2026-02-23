import React, { useEffect, useState } from "react";
import styles from "./Chamados.module.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ModalChamado from "../../components/ModalChamado";
import { getUsuario } from "../../services/auth";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Chamados = () => {
  const [tickets, setTickets] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState("Todos");
  const [filtroPrioridade, setFiltroPrioridade] = useState("Todas");
  const [somenteVencidos, setSomenteVencidos] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);
  const [chamadoSelecionado, setChamadoSelecionado] = useState(null);

  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 20;

  const usuarioLogado = getUsuario();

  const carregarTickets = async () => {
  const res = await fetch("http://localhost:3001/api/tickets");
  const data = await res.json();

  setTickets(data);
  setPaginaAtual(1); 
};

  useEffect(() => {
    carregarTickets();
  }, []);

  const atualizarStatus = async (id, novoStatus) => {
    await fetch(`http://localhost:3001/api/tickets/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: novoStatus,
        usuario: usuarioLogado?.nome || "Sistema",
      }),
    });

    carregarTickets();
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "-";
    return new Date(dataISO).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const diasPorPrioridade = (prioridade) => {
    if (prioridade === "Alta") return 3;
    if (prioridade === "Normal") return 5;
    return 7;
  };

  const calcularPrazo = (ticket) => {
    const criado = new Date(ticket.criado_em);
    const prazo = new Date(criado);
    prazo.setDate(criado.getDate() + diasPorPrioridade(ticket.prioridade));
    return prazo;
  };

  const diasParaVencer = (ticket) => {
    if (ticket.status === "Fechado") return "Encerrado";

    const hoje = new Date();
    const prazo = calcularPrazo(ticket);

    const diff = Math.ceil((prazo - hoje) / (1000 * 60 * 60 * 24));

    if (diff < 0) return `Vencido há ${Math.abs(diff)} dias`;
    if (diff === 0) return "Vence hoje";
    return `Vence em ${diff} dias`;
  };

  const statusPrazo = (ticket) => {
    if (ticket.status === "Fechado") return "ok";

    const hoje = new Date();
    const prazo = calcularPrazo(ticket);

    return prazo < hoje ? "atrasado" : "ok";
  };

  const totalAbertos = tickets.filter((t) => t.status === "Aberto").length;
  const totalEmAndamento = tickets.filter((t) => t.status === "Em andamento").length;
  const totalFechados = tickets.filter((t) => t.status === "Fechado").length;

  const ticketsFiltrados = tickets.filter((ticket) => {
    const statusOk = filtroStatus === "Todos" || ticket.status === filtroStatus;
    const prioridadeOk =
      filtroPrioridade === "Todas" || ticket.prioridade === filtroPrioridade;
    const vencidoOk = !somenteVencidos ? true : statusPrazo(ticket) === "atrasado";

    return statusOk && prioridadeOk && vencidoOk;
  });

  const totalPaginas = Math.ceil(ticketsFiltrados.length / itensPorPagina);
  const inicio = (paginaAtual - 1) * itensPorPagina;
  const ticketsPaginados = ticketsFiltrados.slice(inicio, inicio + itensPorPagina);

  const abrirDetalhes = (ticket) => {
    const prazoFinal = calcularPrazo(ticket);

    setChamadoSelecionado({
      ticket: ticket.id,
      descricao: ticket.descricao,
      setor: ticket.setor,
      prioridade: ticket.prioridade,
      status: ticket.status,
      criadoEm: formatarData(ticket.criado_em),
      prazoLabel: diasParaVencer(ticket),
      prazoFinal: prazoFinal.toLocaleDateString("pt-BR"),
      abertoPor: ticket.profissional,
      iniciadoPor: ticket.iniciado_por || null,
      fechadoPor: ticket.fechado_por || null,
      dataFechamento: ticket.fechado_em ? formatarData(ticket.fechado_em) : null,
    });

    setModalAberto(true);
  };

  const exportarExcel = () => {
    const dados = ticketsFiltrados.map((t) => ({
      Ticket: t.id,
      Profissional: t.profissional,
      Setor: t.setor,
      Descrição: t.descricao,
      "Criado em": formatarData(t.criado_em),
      Prazo: diasParaVencer(t),
      Prioridade: t.prioridade,
      Status: t.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Chamados");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(fileData, "chamados.xlsx");
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.content}>
        <h1 className={styles.title}>Chamados</h1>

        <div className={styles.topBar}>
          <div className={styles.filters}>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
              <option value="Todos">Todos os Status</option>
              <option value="Aberto">Aberto</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Fechado">Fechado</option>
            </select>

            <select value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)}>
              <option value="Todas">Todas as Prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Normal">Normal</option>
              <option value="Baixa">Baixa</option>
            </select>

            <label className={styles.filtroVencidos}>
              <input
                type="checkbox"
                checked={somenteVencidos}
                onChange={() => setSomenteVencidos(!somenteVencidos)}
              />
              Apenas vencidos
            </label>

            <button className={styles.exportBtn} onClick={exportarExcel}>
              Exportar XLSX
            </button>
          </div>

          <div className={styles.cards}>
            <div className={`${styles.card} ${styles.cardAberto}`}>
              <span>Abertos</span>
              <strong>{totalAbertos}</strong>
            </div>

            <div className={`${styles.card} ${styles.cardAndamento}`}>
              <span>Em andamento</span>
              <strong>{totalEmAndamento}</strong>
            </div>

            <div className={`${styles.card} ${styles.cardFechado}`}>
              <span>Fechados</span>
              <strong>{totalFechados}</strong>
            </div>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Profissional</th>
                <th>Setor</th>
                <th>Descrição</th>
                 <th>Img</th>
                <th>Criado em</th>
                <th>Prazo</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {ticketsPaginados.map((ticket) => {
                const prazoFinal = calcularPrazo(ticket);

                return (
                  <tr key={ticket.id} className={styles[statusPrazo(ticket)]}>
                    <td>{ticket.id}</td>
                    <td>{ticket.profissional}</td>
                    <td>{ticket.setor}</td>
                    <td>{ticket.descricao}</td>
                    <td>
                      {ticket.imagem && (
                        <a
                          href={`http://localhost:3001/uploads/${ticket.imagem}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.cameraIcon}
                          title="Visualizar imagem"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                        </a>
                      )}
                    </td>
                    <td>{formatarData(ticket.criado_em)}</td>

                    <td>
                      <span
                        title={`Prazo final: ${prazoFinal.toLocaleDateString("pt-BR")}`}
                        className={`${styles.prazo} ${
                          statusPrazo(ticket) === "atrasado"
                            ? styles.vencido
                            : styles.dentro
                        }`}
                      >
                        {diasParaVencer(ticket)}
                      </span>
                    </td>

                    <td>
                      <span className={`${styles.badge} ${styles[ticket.prioridade.toLowerCase()]}`}>
                        {ticket.prioridade}
                      </span>
                    </td>

                    <td>
                      <span className={`${styles.status} ${styles[ticket.status.toLowerCase().replace(" ", "")]}`}>
                        {ticket.status}
                      </span>
                    </td>

                    <td className={styles.acoes}>
                      <button className={styles.detalhesBtn} onClick={() => abrirDetalhes(ticket)}>
                        Detalhes
                      </button>

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
                    </td>
                  </tr>
                );
              })}

              {ticketsFiltrados.length === 0 && (
                <tr>
                  <td colSpan="9" className={styles.empty}>
                    Nenhum chamado encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className={styles.pagination}>
            <button disabled={paginaAtual === 1} onClick={() => setPaginaAtual(paginaAtual - 1)}>
              ◀ Anterior
            </button>

            <span>
              Página {paginaAtual} de {totalPaginas}
            </span>

            <button disabled={paginaAtual === totalPaginas} onClick={() => setPaginaAtual(paginaAtual + 1)}>
              Próxima ▶
            </button>
          </div>
        )}
      </main>

      {modalAberto && (
        <ModalChamado chamado={chamadoSelecionado} onClose={() => setModalAberto(false)} />
      )}

      <Footer />
    </div>
  );
};

export default Chamados;
