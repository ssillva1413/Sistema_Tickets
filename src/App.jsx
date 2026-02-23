import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Chamados from "./pages/Chamados";
import Login from "./pages/Login";
import PrivateRoute from "./routes/PrivateRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/chamados"
        element={
          <PrivateRoute>
            <Chamados />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
