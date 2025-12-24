import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export function OrdersPage({ accessToken, onBackToMenu }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const STATUS_LABELS = {
    PENDING: "Em espera",
    PREPARING: "Em preparação",
    OUT_FOR_DELIVERY: "Saiu para entrega",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado",
  };


  async function fetchOrders() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/orders/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar pedidos: ${response.status}`);
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <div>Carregando pedidos...</div>;
  }

  if (error) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
        <h1>Meus pedidos</h1>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={onBackToMenu}>Voltar ao cardápio</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h1>Meus pedidos</h1>
        <div>
          <button onClick={fetchOrders} style={{ marginRight: 8 }}>
            Atualizar
          </button>
          <button onClick={onBackToMenu}>Voltar ao cardápio</button>
        </div>
      </header>

      {orders.length === 0 && <p>Você ainda não fez nenhum pedido.</p>}

      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 8,
            padding: 12,
            marginBottom: 12,
            backgroundColor: "#fafafa",
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <strong>Pedido #{order.id}</strong> — {STATUS_LABELS[order.status] || order.status} —{" "}
            {new Date(order.created_at).toLocaleString()}
          </div>
          <div>Endereço: {order.delivery_address}</div>
          <div>Pagamento: {order.payment_method}</div>
          <div>Taxa de entrega: R$ {Number(order.delivery_fee).toFixed(2)}</div>
          <div>Subtotal: R$ {Number(order.subtotal).toFixed(2)}</div>
          <div><strong>Total: R$ {Number(order.total).toFixed(2)}</strong></div>

          <div style={{ marginTop: 8 }}>
            <strong>Itens:</strong>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.quantity}x {item.food.name} — R$ {Number(item.line_total).toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
