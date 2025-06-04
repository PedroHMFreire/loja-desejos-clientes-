import { useState, useEffect } from 'react';
import './styles.css';

function App() {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [produto, setProduto] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [desejos, setDesejos] = useState([]);

  // Carrega produtos do backend
  useEffect(() => {
    fetch('http://localhost:5000/api/produtos')
      .then(res => res.json())
      .then(data => setProdutos(data))
      .catch(err => console.error('Erro ao carregar produtos:', err));
  }, []);

  // Carrega desejos do backend
  useEffect(() => {
    fetch('http://localhost:5000/api/desejos')
      .then(res => res.json())
      .then(data => setDesejos(data))
      .catch(err => console.error('Erro ao carregar desejos:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consentimento) {
      alert('O cliente deve consentir com o armazenamento de dados (LGPD).');
      return;
    }

    const desejo = { nome, telefone, produto_id: produto, consentimento_lgpd: consentimento };
    try {
      const res = await fetch('http://localhost:5000/api/desejos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(desejo),
      });
      if (res.ok) {
        alert('Desejo registrado com sucesso!');
        setNome('');
        setTelefone('');
        setProduto('');
        setConsentimento(false);
        // Atualiza lista de desejos
        const updatedDesejos = await fetch('http://localhost:5000/api/desejos').then(res => res.json());
        setDesejos(updatedDesejos);
      }
    } catch (err) {
      console.error('Erro ao registrar desejo:', err);
      alert('Erro ao registrar desejo.');
    }
  };

  const handleEnviarMensagem = (desejo) => {
    const produtoNome = produtos.find(p => p.id === desejo.produto_id)?.nome || 'Produto';
    const mensagem = `Olá ${desejo.nome}, o produto ${produtoNome} está disponível na loja! Entre em contato para mais detalhes.`;
    const url = `sms:${desejo.telefone}?body=${encodeURIComponent(mensagem)}`;
    window.location.href = url;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Registrar Desejo do Cliente</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mb-8">
        <div className="mb-4">
          <label className="block text-gray-700">Nome do Cliente</label>
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
          <select
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Selecione um produto</option>
            {produtos.map(p => (
              <option key={p.id} value={p.id}>{p.nome} ({p.codigo})</option>
            ))}
          </select>
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
            <p><strong>Produto:</strong> {produtos.find(p => p.id === d.produto_id)?.nome || 'N/A'}</p>
            <button
              onClick={() => handleEnviarMensagem(d)}
              className="mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Enviar para o Cliente
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
