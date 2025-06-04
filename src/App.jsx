import { useState, useEffect } from 'react';
import './styles.css';

function App() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [produto, setProduto] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [desejos, setDesejos] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('todos'); // Filtro para a lista
  const numeroGerente = '5511999999999'; // Substitua pelo número real do gerente (ex.: +5511987654321)

  // Carrega desejos do localStorage ao iniciar
  useEffect(() => {
    const desejosSalvos = localStorage.getItem('desejos');
    if (desejosSalvos) {
      setDesejos(JSON.parse(desejosSalvos));
    }
  }, []);

  // Salva desejos no localStorage sempre que a lista mudar
  useEffect(() => {
    localStorage.setItem('desejos', JSON.stringify(desejos));
  }, [desejos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!consentimento) {
      alert('O cliente deve consentir com o armazenamento de dados (LGPD).');
      return;
    }
    if (!vendedor) {
      alert('Por favor, informe o nome do vendedor.');
      return;
    }

    const novoDesejo = {
      id: Date.now(),
      nome,
      telefone,
      produto,
      vendedor,
      consentimento_lgpd: consentimento,
      status: 'Não Atendido',
      data_solicitacao: new Date().toISOString(),
    };

    setDesejos([...desejos, novoDesejo]);
    setNome('');
    setTelefone('');
    setProduto('');
    setVendedor('');
    setConsentimento(false);
    alert('Desejo registrado com sucesso!');
  };

  const handleMarcarAtendido = (id) => {
    setDesejos(
      desejos.map((desejo) =>
        desejo.id === id ? { ...desejo, status: 'Atendido' } : desejo
      )
    );
  };

  const handleEnviarCliente = (desejo) => {
    const mensagem = `Oi, ${desejo.nome}. Recebemos o seu pedido e assim que recebermos reposição avisamos você. Qualquer dúvida estou à disposição!`;
    const url = `whatsapp://send?phone=${desejo.telefone}&text=${encodeURIComponent(mensagem)}`;
    window.location.href = url;
  };

  const handleEnviarGerente = (desejo) => {
    const mensagem = `Cliente ${desejo.nome} busca o produto ${desejo.produto}. Mas não temos em estoque. Aguardo uma posição da produção.`;
    const url = `whatsapp://send?phone=${numeroGerente}&text=${encodeURIComponent(mensagem)}`;
    window.location.href = url;
  };

  // Calcula o ranking dos vendedores
  const calcularRanking = () => {
    const ranking = desejos.reduce((acc, desejo) => {
      const { vendedor, status } = desejo;
      if (!acc[vendedor]) {
        acc[vendedor] = { registrados: 0, atendidos: 0 };
      }
      acc[vendedor].registrados += 1;
      if (status === 'Atendido') {
        acc[vendedor].atendidos += 1;
      }
      return acc;
    }, {});

    return Object.entries(ranking)
      .map(([vendedor, { registrados, atendidos }]) => ({
        vendedor,
        registrados,
        atendidos,
        percentual: registrados > 0 ? ((atendidos / registrados) * 100).toFixed(2) : 0,
      }))
      .sort((a, b) => b.percentual - a.percentual);
  };

  // Filtra desejos com base no status
  const desejosFiltrados = desejos.filter((desejo) => {
    if (filtroStatus === 'todos') return true;
    return desejo.status === filtroStatus;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Registrar Desejo do Cliente</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mb-8">
        <div className="mb-4">
          <label className="block text-gray-700">Nome Completo do Cliente</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Telefone</label>
          <input
            type="tel"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Produto Desejado</label>
          <input
            type="text"
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Digite o nome do produto"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Nome do Vendedor</label>
          <input
            type="text"
            value={vendedor}
            onChange={(e) => setVendedor(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Digite seu nome"
            required
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={consentimento}
              onChange={(e) => setConsentimento(e.target.checked)}
              className="mr-2"
            />
            <span className="text-gray-700">Cliente consente com armazenamento de dados (LGPD)</span>
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Registrar
        </button>
      </form>

      <h2 className="text-xl font-bold mb-4 text-center">Desejos Registrados</h2>
      <div className="max-w-md mx-auto mb-8">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setFiltroStatus('todos')}
            className={`px-4 py-2 mr-2 rounded ${filtroStatus === 'todos' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroStatus('Não Atendido')}
            className={`px-4 py-2 mr-2 rounded ${filtroStatus === 'Não Atendido' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Não Atendido
          </button>
          <button
            onClick={() => setFiltroStatus('Atendido')}
            className={`px-4 py-2 rounded ${filtroStatus === 'Atendido' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Atendido
          </button>
        </div>
        {desejosFiltrados.map((d) => (
          <div
            key={d.id}
            className={`p-4 rounded-lg shadow mb-4 ${d.status === 'Não Atendido' ? 'bg-red-100' : 'bg-green-100'}`}
          >
            <p><strong>Cliente:</strong> {d.nome}</p>
            <p><strong>Telefone:</strong> {d.telefone}</p>
            <p><strong>Produto:</strong> {d.produto}</p>
            <p><strong>Vendedor:</strong> {d.vendedor}</p>
            <p><strong>Status:</strong> {d.status}</p>
            <p><strong>Data:</strong> {new Date(d.data_solicitacao).toLocaleDateString('pt-BR')}</p>
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => handleEnviarCliente(d)}
                className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600"
              >
                Enviar para Cliente
              </button>
              <button
                onClick={() => handleEnviarGerente(d)}
                className="flex-1 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
              >
                Enviar para Gerente
              </button>
              {d.status === 'Não Atendido' && (
                <button
                  onClick={() => handleMarcarAtendido(d.id)}
                  className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                  Marcar como Atendido
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4 text-center">Ranking de Vendedores</h2>
      <div className="max-w-md mx-auto">
        <table className="w-full bg-white rounded-lg shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 text-left">Vendedor</th>
              <th className="p-2 text-center">Registrados</th>
              <th className="p-2 text-center">Atendidos</th>
              <th className="p-2 text-center">Percentual</th>
            </tr>
          </thead>
          <tbody>
            {calcularRanking().map((r, index) => (
              <tr key={index} className="border-t">
                <td className="p-2">{r.vendedor}</td>
                <td className="p-2 text-center">{r.registrados}</td>
                <td className="p-2 text-center">{r.atendidos}</td>
                <td className="p-2 text-center">{r.percentual}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
