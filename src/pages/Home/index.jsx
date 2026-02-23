import React from "react";
import styles from "./Home.module.css";
import Header from "../../components/Header";
import TicketForm from "../../components/TicketForm";
import Footer from "../../components/Footer";

const Home = () => {
  return (
    <div className={styles.home}>
      <Header />

      <main className={styles.section}>
        <div className={styles.container}>
          <h1 className={styles.title}>Abertura de Chamado</h1>
          <p className={styles.subtitle}>
            Preencha as informações abaixo para abrir um ticket.
          </p>
          <TicketForm />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
