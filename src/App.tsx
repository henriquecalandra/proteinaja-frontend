import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Home from './pages/Home';
import Conversas from './pages/Conversas';
import Pedidos from './pages/Pedidos';
import Clientes from './pages/Clientes';

function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function PrivateLayout({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateLayout><Home /></PrivateLayout>} />
        <Route path="/conversas" element={<PrivateLayout><Conversas /></PrivateLayout>} />
        <Route path="/pedidos" element={<PrivateLayout><Pedidos /></PrivateLayout>} />
        <Route path="/clientes" element={<PrivateLayout><Clientes /></PrivateLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
