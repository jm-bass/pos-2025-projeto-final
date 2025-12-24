import { useState, useEffect } from "react";
import { LoginPage } from "./LoginPage";
import { RegisterPage } from "./RegisterPage";
import { MenuPage } from "./MenuPage";
import { OrdersPage } from "./OrdersPage";
import { AdminProductsPage } from "./AdminProductsPage";
import { AdminOrdersPage } from "./AdminOrdersPage";



function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [prefilledUsername, setPrefilledUsername] = useState("");
  const [currentPage, setCurrentPage] = useState("menu"); // 'menu' | 'orders' | 'admin_products' | 'admin_orders'
  const [currentUser, setCurrentUser] = useState(null);


    async function fetchCurrentUser(token) {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Erro ao buscar usuário atual");
      }
      const data = await response.json();
      setCurrentUser(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleLoginSuccess(access, refresh) {
    setAccessToken(access);
    setRefreshToken(refresh);
    fetchCurrentUser(access);
  }

  function handleLogout() {
    setAccessToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
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

  // usuário logado
  if (currentPage === "orders") {
    return (
      <OrdersPage
        accessToken={accessToken}
        onBackToMenu={() => setCurrentPage("menu")}
      />
    );
  }

  if (currentPage === "admin_products") {
    return (
      <AdminProductsPage
        accessToken={accessToken}
        onBack={() => setCurrentPage("menu")}
      />
    );
  }

  if (currentPage === "admin_orders") {
    return (
      <AdminOrdersPage
        accessToken={accessToken}
        onBack={() => setCurrentPage("menu")}
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
          {currentUser?.is_staff && (
          <>
            <button onClick={() => setCurrentPage("admin_products")} style={{ marginRight: 8 }}>
              Admin Produtos
            </button>
            <button onClick={() => setCurrentPage("admin_orders")} style={{ marginRight: 8 }}>
              Admin Pedidos
            </button>
          </>
        )}

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
