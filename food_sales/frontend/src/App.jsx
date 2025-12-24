import { useState } from "react";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";
import { MenuPage } from "./MenuPage";
import { OrdersPage } from "./OrdersPage";

function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [prefilledUsername, setPrefilledUsername] = useState("");
  const [currentPage, setCurrentPage] = useState("menu"); // 'menu' | 'orders'

  function handleLoginSuccess(access, refresh) {
    setAccessToken(access);
    setRefreshToken(refresh);
  }

  function handleLogout() {
    setAccessToken(null);
    setRefreshToken(null);
    setCurrentPage("menu");
  }

  function handleRegisterSuccess(username) {
    setShowRegister(false);
    setPrefilledUsername(username || "");
  }

  if (!accessToken) {
    if (showRegister) {
      return (
        <RegisterPage
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={() => setShowRegister(false)}
        />
      );
    }

    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        prefilledUsername={prefilledUsername}
        onGoToRegister={() => setShowRegister(true)}
      />
    );
  }

  // usuário logado: alterna entre menu e pedidos
  if (currentPage === "orders") {
    return (
      <OrdersPage
        accessToken={accessToken}
        onBackToMenu={() => setCurrentPage("menu")}
      />
    );
  }

  return (
    <div>
      {/* pequeno “menu” de navegação simples */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16, textAlign: "right" }}>
        <button onClick={() => setCurrentPage("menu")} style={{ marginRight: 8 }}>
          Cardápio
        </button>
        <button onClick={() => setCurrentPage("orders")} style={{ marginRight: 8 }}>
          Meus pedidos
        </button>
        <button onClick={handleLogout}>Sair</button>
      </div>

      <MenuPage
        accessToken={accessToken}
        onLogout={handleLogout}
      />
    </div>
  );
}

export default App;
