import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();

  const handleSubmit =(e: { preventDefault: () => void; })=>{
    e.preventDefault();
    navigate('/dashboardPage')
  }
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
        <h2 className="text-5xl font-spartan font-extrabold mb-8 text-center" style={{ color: '#183E9F' }}>Admin</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 w-9/12 flex items-center rounded-2xl p-1 shadow-2xl bg-white focus-within:ring-2 focus-within:ring-sky-500 mx-auto block">
            <FaUser className="text-2xl mx-2" style={{ color: '#040E46' }} /> 
            <input
              type="text"
              id="username"
              className="w-full px-2 py-2 focus:outline-none bg-inherit"
              placeholder="Username"
              style={{ color: '#040E46' }} 
            />
          </div>
          <div className="mb-5 w-9/12 flex items-center rounded-2xl p-1 shadow-2xl bg-white focus-within:ring-2 focus-within:ring-sky-500 mx-auto block">
            <FaLock className="text-2xl mx-2" style={{ color: '#040E46' }} /> {/* Lock Icon */}
            <input
              type="password"
              id="password"
              className="w-full px-2 py-2 focus:outline-none bg-inherit"
              placeholder="Password"
              style={{ color: '#040E46' }} 
            />
          </div>

          <button
            type="submit"
            className="w-1/2 bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 mx-auto block"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

  
