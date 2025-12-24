import { useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000/api";

export function LoginPage({ onLoginSuccess, prefilledUsername = "", onGoToRegister }) {
  const [username, setUsername] = useState(prefilledUsername);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL.replace("/api", "")}/api/token/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Usuário ou senha inválidos");
      }

      const data = await response.json();
      onLoginSuccess(data.access, data.refresh);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: 16 }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>
            Usuário:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            />
          </label>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <button
          type="button"
          onClick={onGoToRegister}
          style={{ marginLeft: 8 }}
        >
          Criar conta
        </button>
      </form>
    </div>
  );
}
