/* src/components/Ranking.jsx */

export default function Ranking({ desejos }) {
  const ranking = desejos.reduce((acc, d) => {
    acc[d.vendedor] = (acc[d.vendedor] || 0) + 1
    return acc
  }, {})

  const rankingArray = Object.entries(ranking)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-orange-500">Ranking de Vendedores</h1>
      <ul className="space-y-2">
        {rankingArray.map((v, i) => (
          <li key={v.nome} className="bg-gray-800 p-3 rounded flex justify-between items-center">
            <span className="font-medium">#{i + 1} {v.nome}</span>
            <span>{v.total} desejo(s)</span>
          </li>
        ))}
        {rankingArray.length === 0 && <p>Nenhum desejo registrado.</p>}
      </ul>
    </div>
  )
}
