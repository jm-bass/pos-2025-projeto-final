import { useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export function RegisterPage({ onRegisterSuccess, onBackToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== password2) {
      setError("As senhas não conferem");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const detail =
          data && (data.detail || JSON.stringify(data));
        throw new Error(detail || "Erro ao registrar usuário");
      }

      const data = await response.json();
      // opcional: já chamar onRegisterSuccess para ir direto pro login com username preenchido
      onRegisterSuccess(data.username);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 16 }}>
      <h1>Criar conta</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>
            Usuário:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: "100%" }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            E-mail:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            Senha:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%" }}
              required
            />
          </label>
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>
            Confirmar senha:
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              style={{ width: "100%" }}
              required
            />
          </label>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Cadastrar"}
        </button>

        <button
          type="button"
          onClick={onBackToLogin}
          style={{ marginLeft: 8 }}
        >
          Voltar para login
        </button>
      </form>
    </div>
  );
}
