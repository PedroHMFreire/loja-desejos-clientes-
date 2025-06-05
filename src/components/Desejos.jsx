import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

function Desejos({ desejos, setDesejos, vendedores, lojas }) {
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroVendedor, setFiltroVendedor] = useState('');
  const [filtroLoja, setFiltroLoja] = useState('');
  const numeroGerente = '5511999999999'; // Substitua pelo número real do gerente

  useEffect(() => {
    localStorage.setItem('desejos', JSON.stringify(desejos));
  }, [desejos]);

  const handleMarcarAtendido = (id) => {
    setDesejos(
      desejos.map((desejo) =>
        desejo.id === id ? { ...desejo, status: 'Atendido' } : desejo
      )
    );
  };

  const handleEnviarCliente = (desejo) => {
    const mensagem = `Oi, ${desejo.nome}. Recebemos o seu pedido e assim que recebermos reposição avisamos você. Qualquer dúvida estou à disposição!`;
    window.location.href = `whatsapp://send?phone=${desejo.telefone}&text=${encodeURIComponent(mensagem)}`;
  };

  const handleEnviarGerente = (desejo) => {
    const mensagem = `Cliente ${desejo.nome} busca o produto ${desejo.produto}. Mas não temos em estoque. Aguardo uma posição da produção.`;
    window.location.href = `whatsapp://send?phone=${numeroGerente}&text=${encodeURIComponent(mensagem)}`;
  };

  const desejosFiltrados = desejos.filter((desejo) => {
    const dataDesejo = new Date(desejo.data_solicitacao);
    const dataInicio = filtroDataInicio ? new Date(filtroDataInicio) : null;
    const dataFim = filtroDataFim ? new Date(filtroDataFim) : null;
    return (
      desejo.nome.toLowerCase().includes(filtroNome.toLowerCase()) &&
      (!dataInicio || dataDesejo >= dataInicio) &&
      (!dataFim || dataDesejo <= dataFim) &&
      (!filtroVendedor || desejo.vendedor === filtroVendedor) &&
      (!filtroLoja || desejo.loja === filtroLoja)
    );
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Desejos</h2>
      <div className="bg-gray-900 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Filtrar por nome"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
          />
          <input
            type="date"
            value={filtroDataInicio}
            onChange={(e) => setFiltroDataInicio(e.target.value)}
            className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
          />
          <input
            type="date"
            value={filtroDataFim}
            onChange={(e) => setFiltroDataFim(e.target.value)}
            className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
          />
          <select
            value={filtroVendedor}
            onChange={(e) => setFiltroVendedor(e.target.value)}
            className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
          >
            <option value="">Todos os vendedores</option>
            {vendedores.map((vend, index) => (
              <option key={index} value={vend}>{vend}</option>
            ))}
          </select>
          <select
            value={filtroLoja}
            onChange={(e) => setFiltroLoja(e.target.value)}
            className="p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
          >
            <option value="">Todas as lojas</option>
            {lojas.map((lj, index) => (
              <option key={index} value={lj}>{lj}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full bg-gray-900 rounded-lg">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-2 text-left">Nome</th>
              <th className="p-2 text-left">Telefone</th>
              <th className="p-2 text-left">Produto</th>
              <th className="p-2 text-left">Categoria</th>
              <th className="p-2 text-left">Valor</th>
              <th className="p-2 text-left">Vendedor</th>
              <th className="p-2 text-left">Loja</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Data</th>
              <th className="p-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {desejosFiltrados.map((d) => (
              <tr
                key={d.id}
                className={`${d.status === 'Não Atendido' ? 'bg-red-900/30' : 'bg-green-900/30'}`}
              >
                <td className="p-2">{d.nome}</td>
                <td className="p-2">{d.telefone}</td>
                <td className="p-2">{d.produto}</td>
                <td className="p-2">{d.categoria}</td>
                <td className="p-2">{d.valor}</td>
                <td className="p-2">{d.vendedor}</td>
                <td className="p-2">{d.loja}</td>
                <td className="p-2">{d.status}</td>
                <td className="p-2">{new Date(d.data_solicitacao).toLocaleDateString('pt-BR')}</td>
                <td className="p-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEnviarCliente(d)}
                      className="p-2 bg-green-600 rounded hover:bg-green-700 transition-transform transform hover:scale-105"
                    >
                      <FaWhatsapp />
                    </button>
                    <button
                      onClick={() => handleEnviarGerente(d)}
                      className="p-2 bg-yellow-600 rounded hover:bg-yellow-700 transition-transform transform hover:scale-105"
                    >
                      <FaWhatsapp />
                    </button>
                    {d.status === 'Não Atendido' && (
                      <button
                        onClick={() => handleMarcarAtendido(d.id)}
                        className="p-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-transform transform hover:scale-105"
                      >
                        Atendido
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Desejos;
