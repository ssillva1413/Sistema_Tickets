  import { useEffect, useState } from "react";
  import { useSearchParams, useNavigate } from "react-router-dom";

  import styles from "./ConfirmarEmail.module.css";

  function ConfirmarEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState("carregando");
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("erro");
        setMensagem("Token de confirmação não informado.");
        return;
      }

      const confirmarEmail = async () => {
        try {
          const response = await fetch(
            `http://192.168.1.61:3001/api/confirmar-email?token=${encodeURIComponent(
              token
            )}`
          );

          const data = await response.json();

          if (!response.ok) {
            setStatus("erro");
            setMensagem(
              data.mensagem || "Não foi possível confirmar o e-mail."
            );
            return;
          }

          setStatus("sucesso");
          setMensagem(data.mensagem);
        } catch (error) {
          console.error("Erro ao confirmar e-mail:", error);

          setStatus("erro");
          setMensagem(
            "Não foi possível conectar ao servidor. Tente novamente."
          );
        }
      };

      confirmarEmail();
    }, [searchParams]);

    return (
      <div className={styles.confirmarEmail}>
        <img
          src="/Novologo.jpg"
          alt="Hospital e Maternidade Agenor Araújo"
          className={styles.logo}
        />

        <div className={styles.conteudo}>
          <h1>Sistema de Chamados</h1>

          {status === "carregando" && (
            <div>
              <div className={styles.spinner}></div>

              <h2>Confirmando seu e-mail...</h2>

              <p>
                Aguarde um instante enquanto ativamos sua conta.
              </p>
            </div>
          )}

          {status === "sucesso" && (
            <div>
              <div className={styles.iconeSucesso}>✓</div>

              <h2>E-mail confirmado!</h2>

              <p>{mensagem}</p>

              <p className={styles.detalhe}>
                Sua conta foi ativada com sucesso. Agora você já pode
                acessar o sistema.
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
              >
                Ir para o login
              </button>
            </div>
          )}

          {status === "erro" && (
            <div>
              

              <h2>Não foi possível confirmar</h2>

              <p className={styles.mensagemErro}>{mensagem}</p>

              <p className={styles.detalhe}>
                Se o link tiver expirado, será necessário solicitar um
                novo e-mail de confirmação.
              </p>

              <button
                type="button"
                onClick={() => navigate("/login")}
              >
                Voltar para o login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  export default ConfirmarEmail;