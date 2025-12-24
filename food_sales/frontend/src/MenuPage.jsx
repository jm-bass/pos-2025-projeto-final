import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export function MenuPage({ accessToken, onLogout }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cart, setCart] = useState({});
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    async function fetchFoods() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/foods/`);
        if (!response.ok) {
          throw new Error(`Erro ao buscar comidas: ${response.status}`);
        }

        const data = await response.json();
        setFoods(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFoods();
  }, []);

  function addToCart(foodId) {
    setCart((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1,
    }));
  }

  function removeFromCart(foodId) {
    setCart((prev) => {
      const current = prev[foodId] || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[foodId];
        return copy;
      }
      return { ...prev, [foodId]: current - 1 };
    });
  }

  const cartItems = foods
    .filter((f) => cart[f.id])
    .map((food) => ({
      food,
      quantity: cart[food.id],
      lineTotal: Number(food.price) * cart[food.id],
    }));

  const subtotal = cartItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee = cartItems.length > 0 ? 2.0 : 0.0;
  const total = subtotal + deliveryFee;

  async function handleCreateOrder() {
    setOrderError(null);
    setOrderSuccess(null);

    if (!deliveryAddress.trim()) {
      setOrderError("Informe o endereço de entrega");
      return;
    }
    if (cartItems.length === 0) {
      setOrderError("Seu carrinho está vazio");
      return;
    }

    setCreatingOrder(true);
    try {
      const payload = {
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        items: cartItems.map((item) => ({
          food_id: item.food.id,
          quantity: item.quantity,
        })),
      };

      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json(); // lê o body só uma vez

      if (!response.ok) {
        const detail =
          data && (data.detail || JSON.stringify(data));
        throw new Error(detail || "Erro ao criar pedido");
      }

        setOrderSuccess(`Pedido #${data.id} criado com sucesso!`);
        setCart({});
        setDeliveryAddress("");
        setPaymentMethod("PIX");

        setTimeout(() => {
        setOrderSuccess(null);
        }, 4000);

    } catch (err) {
      setOrderError(err.message);
    } finally {
      setCreatingOrder(false);
    }
  }

  if (loading) return <div>Carregando comidas...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 16 }}>
      <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h1>Cardápio</h1>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* Lista de comidas */}
        <div>
          {foods.length === 0 && <p>Nenhuma comida cadastrada.</p>}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            {foods.map((food) => (
              <div
                key={food.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: "#fafafa",
                }}
              >
                {food.image_url && (
                  <img
                    src={food.image_url}
                    alt={food.name}
                    style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 4 }}
                  />
                )}
                <h3>{food.name}</h3>
                {food.description && <p>{food.description}</p>}
                <p><strong>Preço:</strong> R$ {Number(food.price).toFixed(2)}</p>
                <p>
                  <strong>Disponível:</strong> {food.available ? "Sim" : "Não"}
                </p>
                <button
                  disabled={!food.available}
                  onClick={() => addToCart(food.id)}
                >
                  {food.available ? "Adicionar ao carrinho" : "Indisponível"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Carrinho e fechamento */}
        <div>
          <h2>Carrinho</h2>
            {cartItems.length === 0 && (
            <p>Seu carrinho está vazio.</p>
            )}

            {cartItems.map((item) => (
            <div
                key={item.food.id}
                style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
                }}
            >
                <div>
                <strong>{item.food.name}</strong>
                <div>Qtd: {item.quantity}</div>
                <div>R$ {item.lineTotal.toFixed(2)}</div>
                </div>
                <div>
                <button onClick={() => removeFromCart(item.food.id)}>-</button>
                <button onClick={() => addToCart(item.food.id)} style={{ marginLeft: 4 }}>
                    +
                </button>
                </div>
            </div>
            ))}

            {/* bloco de resumo e mensagens SEM depender do carrinho */}
            <hr />
            <p>Subtotal: R$ {subtotal.toFixed(2)}</p>
            <p>Taxa de entrega: R$ {deliveryFee.toFixed(2)}</p>
            <p><strong>Total: R$ {total.toFixed(2)}</strong></p>

            <div style={{ marginTop: 12 }}>
            <label>
                Endereço de entrega:
                <textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                rows={3}
                style={{ width: "100%" }}
                />
            </label>
            </div>

            <div style={{ marginTop: 8 }}>
            <label>
                Forma de pagamento:
                <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: "100%" }}
                >
                <option value="CASH">Dinheiro</option>
                <option value="PIX">Pix</option>
                <option value="CARD">Cartão</option>
                </select>
            </label>
            </div>

            {orderError && <p style={{ color: "red" }}>{orderError}</p>}
            {orderSuccess && <p style={{ color: "green" }}>{orderSuccess}</p>}

            <button
            style={{ marginTop: 12 }}
            onClick={handleCreateOrder}
            disabled={creatingOrder}
            >
            {creatingOrder ? "Enviando pedido..." : "Finalizar pedido"}
            </button>

        </div>
      </div>
    </div>
  );
}
