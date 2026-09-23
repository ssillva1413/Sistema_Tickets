import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

import {
  getUsuario,
  getToken,
  isAuthenticated,
} from "../../services/auth";

import styles from "./GerenciarUsuarios.module.css";

const API_URL = import.meta.env.VITE_API_URL;
const EMAIL_ADMIN = "suportehmaa@gmail.com";

const GerenciarUsuarios = () => {
  const usuarioLogado = getUsuario();

  const ehAdministrador =
    usuarioLogado?.email?.trim().toLowerCase() === EMAIL_ADMIN;

  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [alterandoId, setAlterandoId] = useState(null);

  useEffect(() => {
    if (!mensagem) return;

    const temporizador = setTimeout(() => {
      setMensagem("");
    }, 5000);

    return () => clearTimeout(temporizador);
  }, [mensagem]);

  const carregarUsuarios = async () => {
    setCarregando(true);
    setErro("");

    try {
      const token = getToken();

      const response = await fetch(`${API_URL}/api/admin/usuarios`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível carregar os usuários."
        );
      }

      setUsuarios(data);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      setErro(error.message || "Erro ao conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated() && ehAdministrador) {
      carregarUsuarios();
    } else {
      setCarregando(false);
    }
  }, []);

  const alterarPerfil = async (usuario, novoPerfil) => {
    if (usuario.perfil === novoPerfil) return;

    const confirmado = window.confirm(
      `Deseja alterar o perfil de ${usuario.nome} para "${novoPerfil}"?`
    );

    if (!confirmado) return;

    setAlterandoId(usuario.id);
    setErro("");
    setMensagem("");

    try {
      const token = getToken();

      const response = await fetch(
        `${API_URL}/api/admin/usuarios/${usuario.id}/perfil`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            perfil: novoPerfil,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível alterar o perfil."
        );
      }

      setUsuarios((usuariosAtuais) =>
        usuariosAtuais.map((item) =>
          item.id === usuario.id
            ? { ...item, perfil: data.usuario.perfil }
            : item
        )
      );

      setMensagem(
        `Perfil de ${usuario.nome} atualizado para "${data.usuario.perfil}".`
      );
    } catch (error) {
      console.error("Erro ao alterar perfil:", error);
      setErro(error.message || "Erro ao conectar ao servidor.");
    } finally {
      setAlterandoId(null);
    }
  };

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (!ehAdministrador) {
    return <Navigate to="/chamados" replace />;
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.content}>
        <div className={styles.heading}>
          <div className={styles.headingInfo}>
            <h1 className={styles.title}>Gerenciar usuários</h1>

            <p className={styles.subtitle}>
              Consulte os usuários cadastrados e gerencie seus perfis de
              acesso.
            </p>
          </div>

          <div className={styles.headingActions}>
            <button
              type="button"
              className={styles.refreshButton}
              onClick={carregarUsuarios}
              disabled={carregando}
            >
              {carregando ? "Atualizando..." : "Atualizar lista"}
            </button>
          </div>
        </div>

        {mensagem && (
          <div className={styles.successMessage}>
            {mensagem}
          </div>
        )}

        {erro && (
          <div className={styles.errorMessage}>
            {erro}
          </div>
        )}

        {carregando ? (
          <div className={styles.feedback}>
            Carregando usuários...
          </div>
        ) : erro && usuarios.length === 0 ? (
          <div className={styles.feedback}>
            Não foi possível carregar a lista de usuários.
          </div>
        ) : usuarios.length === 0 ? (
          <div className={styles.feedback}>
            Nenhum usuário cadastrado.
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  <th>Conta</th>
                  <th>E-mail confirmado</th>
                  <th>Cadastro</th>
                  <th>Ação</th>
                </tr>
              </thead>

              <tbody>
                {usuarios.map((usuario) => {
                  const ehContaAdmin =
                    usuario.email?.trim().toLowerCase() === EMAIL_ADMIN;

                  return (
                    <tr key={usuario.id}>
                      <td>{usuario.id}</td>

                      <td>{usuario.nome}</td>

                      <td>{usuario.email}</td>

                      <td>
                        <span
                          className={
                            usuario.perfil === "ti"
                              ? styles.perfilTI
                              : styles.perfilUsuario
                          }
                        >
                          {usuario.perfil}
                        </span>
                      </td>

                      <td>
                        <span
                          className={
                            usuario.ativo
                              ? styles.ativo
                              : styles.inativo
                          }
                        >
                          {usuario.ativo ? "Ativa" : "Inativa"}
                        </span>
                      </td>

                      <td>
                        {usuario.email_confirmado
                          ? "Confirmado"
                          : "Pendente"}
                      </td>

                      <td>
                        {usuario.criado_em
                          ? new Date(usuario.criado_em).toLocaleDateString(
                              "pt-BR"
                            )
                          : "-"}
                      </td>

                      <td>
                        {ehContaAdmin ? (
                          <span className={styles.adminLabel}>
                            Administrador
                          </span>
                        ) : (
                          <select
                            className={styles.profileSelect}
                            value={usuario.perfil}
                            disabled={alterandoId === usuario.id}
                            onChange={(event) =>
                              alterarPerfil(usuario, event.target.value)
                            }
                            aria-label={`Alterar perfil de ${usuario.nome}`}
                          >
                            <option value="usuario">Usuário</option>
                            <option value="ti">TI</option>
                          </select>
                        )}

                        {alterandoId === usuario.id && (
                          <span className={styles.saving}>
                            Salvando...
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className={styles.note}>
          As alterações de perfil serão consideradas no próximo login do
          usuário.
        </p>
      </main>

      <Footer />
    </div>
  );
};

export default GerenciarUsuarios;