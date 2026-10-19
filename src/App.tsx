import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CadastroCliente, CadastroLoja } from './pages/Cadastro';
import { Home } from './pages/Home';
import { Carrinho } from './pages/cliente/Carrinho';
import { Loja } from './pages/cliente/Loja';
import { Lojas } from './pages/cliente/Lojas';
import { Pedidos } from './pages/cliente/Pedidos';
import { Entregadores } from './pages/entregador/Entregadores';
import { PedidosPendentes } from './pages/loja/PedidosPendentes';
import { Produtos } from './pages/loja/Produtos';

function AreaCliente() {
  const { clienteId } = useParams();
  return (
    <Layout
      titulo="Cliente"
      links={[
        { para: `/cliente/${clienteId}`, texto: 'Lojas' },
        { para: `/cliente/${clienteId}/carrinho`, texto: 'Carrinho' },
        { para: `/cliente/${clienteId}/pedidos`, texto: 'Meus pedidos' },
      ]}
    />
  );
}

function AreaLoja() {
  const { lojaId } = useParams();
  return (
    <Layout
      titulo="Loja"
      links={[
        { para: `/loja/${lojaId}`, texto: 'Pedidos' },
        { para: `/loja/${lojaId}/produtos`, texto: 'Cardápio' },
      ]}
    />
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cadastro/cliente" element={<CadastroCliente />} />
      <Route path="/cadastro/loja" element={<CadastroLoja />} />

      <Route path="/cliente/:clienteId" element={<AreaCliente />}>
        <Route index element={<Lojas />} />
        <Route path="lojas/:lojaId" element={<Loja />} />
        <Route path="carrinho" element={<Carrinho />} />
        <Route path="pedidos" element={<Pedidos />} />
      </Route>

      <Route path="/loja/:lojaId" element={<AreaLoja />}>
        <Route index element={<PedidosPendentes />} />
        <Route path="produtos" element={<Produtos />} />
      </Route>

      <Route path="/entregadores" element={<Layout titulo="Entregadores" links={[]} />}>
        <Route index element={<Entregadores />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
