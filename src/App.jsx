import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chamados from "./pages/Chamados";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chamados" element={<Chamados />} />
    </Routes>
  );
}

export default App;
