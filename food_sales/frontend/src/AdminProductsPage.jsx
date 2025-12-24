import { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const emptyForm = {
  id: null,
  name: "",
  description: "",
  price: "",
  available: true,
  image_url: "",
};

export function AdminProductsPage({ accessToken, onBack }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  async function fetchFoods() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/foods/`);
      if (!response.ok) {
        throw new Error(`Erro ao buscar produtos: ${response.status}`);
      }
      const data = await response.json();
      setFoods(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchFoods();
  }, []);

  function handleEdit(food) {
    setForm({
      id: food.id,
      name: food.name,
      description: food.description || "",
      price: String(food.price),
      available: food.available,
      image_url: food.image_url || "",
    });
    setSaveError(null);
  }

  function handleNew() {
    setForm(emptyForm);
    setSaveError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    const payload = {
      name: form.name,
      description: form.description,
      price: form.price,
      available: form.available,
      image_url: form.image_url,
    };

    const url = form.id
      ? `${API_BASE_URL}/foods/${form.id}/`
      : `${API_BASE_URL}/foods/`;
    const method = form.id ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detail = data && (data.detail || JSON.stringify(data));
        throw new Error(detail || "Erro ao salvar produto");
      }

      await fetchFoods();
      setForm(emptyForm);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Tem certeza que deseja excluir este produto?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/foods/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao excluir produto: ${response.status}`);
      }

      setFoods((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return <div>Carregando produtos...</div>;
  }

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <h1>Admin - Produtos</h1>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={onBack}>Voltar</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <header
        style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}
      >
        <h1>Admin - Produtos</h1>
        <button onClick={onBack}>Voltar</button>
      </header>

      {/* Lista de produtos */}
      <h2>Lista</h2>
      {foods.length === 0 && <p>Nenhum produto cadastrado.</p>}

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Nome</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Preço</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Disponível</th>
            <th style={{ borderBottom: "1px solid #ccc" }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food.id}>
              <td style={{ borderBottom: "1px solid #eee" }}>{food.name}</td>
              <td style={{ borderBottom: "1px solid #eee", textAlign: "center" }}>
                R$ {Number(food.price).toFixed(2)}
              </td>
              <td style={{ borderBottom: "1px solid #eee", textAlign: "center" }}>
                {food.available ? "Sim" : "Não"}
              </td>
              <td style={{ borderBottom: "1px solid #eee" }}>
                <button onClick={() => handleEdit(food)} style={{ marginRight: 8 }}>
                  Editar
                </button>
                <button onClick={() => handleDelete(food.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Formulário de criação/edição */}
      <h2>{form.id ? "Editar produto" : "Novo produto"}</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 8 }}>
          <label>
            Nome:
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={{ width: "100%" }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            Descrição:
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            Preço:
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              style={{ width: "100%" }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            URL da imagem:
            <input
              type="text"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            Disponível:
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => setForm({ ...form, available: e.target.checked })}
              style={{ marginLeft: 8 }}
            />
          </label>
        </div>

        {saveError && <p style={{ color: "red" }}>{saveError}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Salvando..." : form.id ? "Salvar alterações" : "Criar produto"}
        </button>

        {form.id && (
          <button
            type="button"
            onClick={handleNew}
            style={{ marginLeft: 8 }}
          >
            Cancelar edição
          </button>
        )}
      </form>
    </div>
  );
}
