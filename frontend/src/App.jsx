import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Chamados from "./pages/Chamados";
import Login from "./pages/Login";
import PrivateRoute from "./routes/PrivateRoute";
import CriarConta from "./pages/CriarConta";
import ConfirmarEmail from "./pages/Confirma/ConfirmarEmail";
import RedefinirSenha from "./pages/RedefinirSenha/RedefinirSenha";
import EsqueciSenha from "./pages/EsqueciSenha/EsqueciSenha";
import GerenciarUsuarios from "./pages/GerenciarUsuarios/GerenciarUsuarios";

function App() {
  return (
    <>
      <Routes>
    
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />   
        <Route path="/criar-conta" element={<CriarConta />} />      
        <Route path="/confirmar-email" element={<ConfirmarEmail />} />       
        <Route path="/esqueci-senha" element={<EsqueciSenha />} /> 
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/gerenciar-usuarios" element={<GerenciarUsuarios />}/>      
        <Route path="/chamados" element={<PrivateRoute> <Chamados /></PrivateRoute>} />
        <Route path="/novo-chamado" element={ <PrivateRoute> <Home /></PrivateRoute>} />
       
      </Routes>
    </>
  );
}

export default App;