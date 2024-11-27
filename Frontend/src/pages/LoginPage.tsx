import { useState } from "react"; 
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/auth/admin/login/", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      alert("Welcome Admin!");

      navigate("/dashboardPage");
    } catch (err) {
      if (err instanceof AxiosError && err.response) {
        setError(err.response.data?.error || "Invalid email or password");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-t from-sky-300 to-blue-50 flex justify-center items-center">
      <div className="bg-gradient-to-t from-sky-300 to-emerald-300 pt-3 p-20 rounded-lg shadow-lg w-full max-w-xl">
        <div className="flex justify-center">
          <img 
            src="/assets/Dynah.png" 
            alt="Logo"
            className="h-21- w-21" 
          />
        </div>
        <h2 
          className="text-5xl font-spartan font-extrabold mb-8 text-center" 
          style={{ color: "#183E9F" }}
        >
          Admin
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 w-9/12 flex items-center rounded-2xl p-1 shadow-2xl bg-white focus-within:ring-2 focus-within:ring-sky-500 mx-auto block">
            <FaUser className="text-2xl mx-2" style={{ color: "#040E46" }} /> 
            <input
              type="text"
              id="email"
              className="w-full px-2 py-2 focus:outline-none bg-inherit"
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
              style={{ color: "#040E46" }} 
            />
          </div>
          <div className="mb-5 w-9/12 flex items-center rounded-2xl p-1 shadow-2xl bg-white focus-within:ring-2 focus-within:ring-sky-500 mx-auto block">
            <FaLock className="text-2xl mx-2" style={{ color: "#040E46" }} />
            <input
              type="password"
              id="password"
              className="w-full px-2 py-2 focus:outline-none bg-inherit"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
              style={{ color: "#040E46" }} 
            />
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-1/2 ${
              loading ? "bg-sky-400" : "bg-sky-500 hover:bg-sky-600"
            } text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 mx-auto block`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
