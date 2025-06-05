import { useState, useEffect } from 'react';

function Cadastros({ vendedores, setVendedores, lojas, setLojas, categorias, setCategorias }) {
  const [novoVendedor, setNovoVendedor] = useState('');
  const [novaLoja, setNovaLoja] = useState('');
  const [novaCategoria, setNovaCategoria] = useState('');

  useEffect(() => {
    localStorage.setItem('vendedores', JSON.stringify(vendedores));
    localStorage.setItem('lojas', JSON.stringify(lojas));
    localStorage.setItem('categorias', JSON.stringify(categorias));
  }, [vendedores, lojas, categorias]);

  const handleAddVendedor = (e) => {
    e.preventDefault();
    if (novoVendedor && !vendedores.includes(novoVendedor)) {
      setVendedores([...vendedores, novoVendedor]);
      setNovoVendedor('');
    }
  };

  const handleAddLoja = (e) => {
    e.preventDefault();
    if (novaLoja && !lojas.includes(novaLoja)) {
      setLojas([...lojas, novaLoja]);
      setNovaLoja('');
    }
  };

  const handleAddCategoria = (e) => {
    e.preventDefault();
    if (novaCategoria && !categorias.includes(novaCategoria)) {
      setCategorias([...categorias, novaCategoria]);
      setNovaCategoria('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Cadastros</h2>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Cadastrar Vendedor</h3>
        <form onSubmit={handleAddVendedor} className="bg-gray-900 p-4 rounded-lg">
          <input
            type="text"
            value={novoVendedor}
            onChange={(e) => setNovoVendedor(e.target.value)}
            placeholder="Nome do vendedor"
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 mb-2"
            required
          />
          <button
            type="submit"
            className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600 transition-transform transform hover:scale-105"
          >
            Adicionar Vendedor
          </button>
        </form>
        <ul className="mt-2">
          {vendedores.map((vend, index) => (
            <li key={index} className="p-2 bg-gray-800 rounded mb-1">{vend}</li>
          ))}
        </ul>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Cadastrar Loja</h3>
        <form onSubmit={handleAddLoja} className="bg-gray-900 p-4 rounded-lg">
          <input
            type="text"
            value={novaLoja}
            onChange={(e) => setNovaLoja(e.target.value)}
            placeholder="Nome da loja"
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 mb-2"
            required
          />
          <button
            type="submit"
            className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600 transition-transform transform hover:scale-105"
          >
            Adicionar Loja
          </button>
        </form>
        <ul className="mt-2">
          {lojas.map((lj, index) => (
            <li key={index} className="p-2 bg-gray-800 rounded mb-1">{lj}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Cadastrar Categoria</h3>
        <form onSubmit={handleAddCategoria} className="bg-gray-900 p-4 rounded-lg">
          <input
            type="text"
            value={novaCategoria}
            onChange={(e) => setNovaCategoria(e.target.value)}
            placeholder="Nome da categoria"
            className="w-full p-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-orange-500 mb-2"
            required
          />
          <button
            type="submit"
            className="w-full bg-orange-500 text-white p-2 rounded hover:bg-orange-600 transition-transform transform hover:scale-105"
          >
            Adicionar Categoria
          </button>
        </form>
        <ul className="mt-2">
          {categorias.map((cat, index) => (
            <li key={index} className="p-2 bg-gray-800 rounded mb-1">{cat}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Cadastros;
