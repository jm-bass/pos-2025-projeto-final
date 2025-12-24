import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const STATUS_LABELS = {
  PENDING: "Em espera",
  PREPARING: "Em preparação",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

const STATUS_OPTIONS = [
  "PENDING",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export function AdminOrdersPage({ accessToken, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);

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

  async function handleStatusChange(orderId, newStatus) {
    setSavingId(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detail = data && (data.detail || JSON.stringify(data));
        throw new Error(detail || "Erro ao atualizar status");
      }

      const updated = await response.json();
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? updated : o))
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return <div>Carregando pedidos...</div>;
  }

  if (error) {
    return (
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
        <h1>Admin - Pedidos</h1>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={onBack}>Voltar</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <header
        style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}
      >
        <h1>Admin - Pedidos</h1>
        <div>
          <button onClick={fetchOrders} style={{ marginRight: 8 }}>
            Atualizar
          </button>
          <button onClick={onBack}>Voltar</button>
        </div>
      </header>

      {orders.length === 0 && <p>Nenhum pedido encontrado.</p>}

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
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <strong>Pedido #{order.id}</strong> —{" "}
              {new Date(order.created_at).toLocaleString()}
              <div>Cliente: {order.user}</div>
              <div>Endereço: {order.delivery_address}</div>
            </div>
            <div>
              <div>
                Status atual:{" "}
                <strong>{STATUS_LABELS[order.status] || order.status}</strong>
              </div>
              <div style={{ marginTop: 4 }}>
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value)
                  }
                  disabled={savingId === order.id}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status] || status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <div>Pagamento: {order.payment_method}</div>
            <div>Taxa de entrega: R$ {Number(order.delivery_fee).toFixed(2)}</div>
            <div>Subtotal: R$ {Number(order.subtotal).toFixed(2)}</div>
            <div>
              <strong>Total: R$ {Number(order.total).toFixed(2)}</strong>
            </div>
          </div>

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
