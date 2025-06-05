import { useState, useEffect } from 'react';

function Home({ desejos, setDesejos, vendedores, lojas, categorias }) {
  const [produto, setProduto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [nome, setNome] = useState('');
  const [ddd, setDdd] = useState('');
  const [numero, setNumero] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [loja, setLoja] = useState('');
  const [consentimento, setConsentimento] = useState(false);
  const numeroGerente = '5511999999999'; // Substitua pelo número real do gerente

  useEffect(() => {
    localStorage.setItem('desejos', JSON.stringify(desejos));
  }, [desejos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!consentimento) {
      alert('O cliente deve consentir com o armazenamento de dados (LGPD).');
      return;
    }
    if (!vendedor || !loja || !categoria) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const telefone = `+55${ddd}${numero}`;
    const novoDesejo = {
      id: Date.now(),
      produto,
      categoria,
      valor,
      nome,
      telefone,
      vendedor,
      loja,
      consentimento_lgpd: consentimento,
      status: 'Não Atendido',
      data_solicitacao: new Date().toISOString(),
    };

    setDesejos([...desejos, novoDesejo]);
    setProduto('');
    setCategoria('');
    setValor('');
    setNome('');
    setDdd('');
    setNumero('');
    setVendedor('');
    setLoja('');
    setConsentimento(false);

    // Enviar mensagens WhatsApp
    const mensagemCliente = `Oi, ${nome}. Recebemos o seu pedido e assim que recebermos reposição avisamos você. Qualquer dúvida estou à disposição!`;
    const mensagemGerente = `Cliente ${nome} busca o produto ${produto}. Mas não temos em estoque. Aguardo uma posição da produção.`;
    window.location.href = `whatsapp://send?phone=${telefone}&text=${encodeURIComponent(mensagemCliente)}`;
    setTimeout(() => {
      window.location.href = `whatsapp://send?phone=${numeroGerente}&text=${encodeURIComponent(mensagemGerente)}`;
    }, 1000);

    alert('Desejo registrado com sucesso!');
  };

  const formatarValor = (input) => {
    const valorNumerico = input.replace(/[^0-9,]/g, '');
    setValor(valorNumerico ? `R$ ${valorNumerico}` : '');
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <label className="block text-white">Produto Desejado</label>
          <input
            type="text"
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-white">Categoria do Produto</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
            required
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-white">Valor do Produto</label>
          <input
            type="text"
            value={valor}
            onChange={(e) => formatarValor(e.target.value)}
            placeholder="R$ 0,00"
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-white">Nome Completo do Cliente</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
            required
          />
        </div>
        <div className="mb-4 flex space-x-2">
          <div className="w-1/4">
            <label className="block text-white">DDD</label>
            <input
              type="text"
              value={ddd}
              onChange={(e) => setDdd(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength="2"
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
              required
            />
          </div>
          <div className="w-3/4">
            <label className="block text-white">WhatsApp do Cliente</label>
            <input
              type="text"
              value={numero}
              onChange={(e) => setNumero(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength="9"
              className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
              required
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-white">Vendedor</label>
          <select
            value={vendedor}
            onChange={(e) => setVendedor(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
            required
          >
            <option value="">Selecione um vendedor</option>
            {vendedores.map((vend, index) => (
              <option key={index} value={vend}>{vend}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-white">Loja</label>
          <select
            value={loja}
            onChange={(e) => setLoja(e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500"
            required
          >
            <option value="">Selecione uma loja</option>
            {lojas.map((lj, index) => (
              <option key={index} value={lj}>{lj}</option>
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
            <span className="text-white">Cliente consente com armazenamento de dados (LGPD)</span>
          </label>
        </div>
        <button
          type="submit"
          className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600 transition-transform transform hover:scale-105"
        >
          Registrar
        </button>
      </form>
    </div>
  );
}

export default Home;
