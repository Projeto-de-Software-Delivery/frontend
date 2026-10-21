import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { CadastroCliente, CadastroEntregador, CadastroLoja } from './pages/Cadastro';
import { Home } from './pages/Home';
import { Carrinho } from './pages/cliente/Carrinho';
import { Loja } from './pages/cliente/Loja';
import { Lojas } from './pages/cliente/Lojas';
import { Pedidos } from './pages/cliente/Pedidos';
import { MinhaEntrega } from './pages/entregador/MinhaEntrega';
import { Perfil } from './pages/entregador/Perfil';
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

function AreaEntregador() {
  const { entregadorId } = useParams();
  return (
    <Layout
      titulo="Entregador"
      links={[
        { para: `/entregador/${entregadorId}`, texto: 'Minha entrega' },
        { para: `/entregador/${entregadorId}/perfil`, texto: 'Meu perfil' },
      ]}
    />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cadastro/cliente" element={<CadastroCliente />} />
      <Route path="/cadastro/loja" element={<CadastroLoja />} />
      <Route path="/cadastro/entregador" element={<CadastroEntregador />} />

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

      <Route path="/entregador/:entregadorId" element={<AreaEntregador />}>
        <Route index element={<MinhaEntrega />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
