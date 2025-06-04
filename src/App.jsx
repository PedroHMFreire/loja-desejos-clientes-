import { useState, useEffect } from 'react';
import './styles.css';

function App() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [produto, setProduto] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [desejos, setDesejos] = useState([]);
  const numeroGerente = '5511999999999'; // Substitua pelo número do gerente (formato: +55DDDnumero)

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

    const novoDesejo = {
      id: Date.now(), // ID único baseado no timestamp
      nome,
      telefone,
      produto,
      consentimento_lgpd: consentimento,
      data_solicitacao: new Date().toISOString(),
    };

    setDesejos([...desejos, novoDesejo]);
    setNome('');
    setTelefone('');
    setProduto('');
    setConsentimento(false);
    alert('Desejo registrado com sucesso!');
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
      <div className="max-w-md mx-auto">
        {desejos.map(d => (
          <div key={d.id} className="bg-white p-4 rounded-lg shadow mb-4">
            <p><strong>Cliente:</strong> {d.nome}</p>
            <p><strong>Telefone:</strong> {d.telefone}</p>
            <p><strong>Produto:</strong> {d.produto}</p>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
