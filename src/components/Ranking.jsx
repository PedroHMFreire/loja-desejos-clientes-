function Ranking({ desejos }) {
  const calcularRankingAnotados = () => {
    const ranking = desejos.reduce((acc, desejo) => {
      acc[desejo.vendedor] = (acc[desejo.vendedor] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(ranking)
      .map(([vendedor, registrados]) => ({ vendedor, registrados }))
      .sort((a, b) => b.registrados - a.registrados);
  };

  const calcularRankingAtendidos = () => {
    const ranking = desejos.reduce((acc, desejo) => {
      if (!acc[desejo.vendedor]) {
        acc[desejo.vendedor] = { registrados: 0, atendidos: 0 };
      }
      acc[desejo.vendedor].registrados += 1;
      if (desejo.status === 'Atendido') {
        acc[desejo.vendedor].atendidos += 1;
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
      .sort((a, b) => b.atendidos - a.atendidos);
  };

  return (
    Jesuits
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Ranking de Vendedores</h2>
      <h3 className="text-xl font-semibold mb-2">Mais Produtos Anotados</h3>
      <table className="w-full bg-gray-900 rounded-lg mb-8">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2 text-left">Vendedor</th>
            <th className="p-2 text-center">Total Registrados</th>
          </tr>
        </thead>
        <tbody>
          {calcularRankingAnotados().map((r, index) => (
            <tr key={index} className="border-t border-gray-700">
              <td className="p-2">{r.vendedor}</td>
              <td className="p-2 text-center">{r.registrados}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="text-xl font-semibold mb-2">Mais Produtos Atendidos</h3>
      <table className="w-full bg-gray-900 rounded-lg">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2 text-left">Vendedor</th>
            <th className="p-2 text-center">Registrados</th>
            <th className="p-2 text-center">Atendidos</th>
            <th className="p-2 text-center">Percentual</th>
          </tr>
        </thead>
        <tbody>
          {calcularRankingAtendidos().map((r, index) => (
            <tr key={index} className="border-t border-gray-700">
              <td className="p-2">{r.vendedor}</td>
              <td className="p-2 text-center">{r.registrados}</td>
              <td className="p-2 text-center">{r.atendidos}</td>
              <td className="p-2 text-center">{r.percentual}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Ranking;
