/* src/components/Desejos.jsx */
import { useState } from 'react'

export default function Desejos({ desejos, setDesejos }) {
  const [filtros, setFiltros] = useState({ vendedor: '', loja: '' })

  const handleFiltro = e => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  const handleDelete = id => {
    const atualizados = desejos.filter(d => d.id !== id)
    setDesejos(atualizados)
    localStorage.setItem('desejos', JSON.stringify(atualizados))
  }

  const desejosFiltrados = desejos.filter(d => {
    const vendedorOk = filtros.vendedor ? d.vendedor === filtros.vendedor : true
    const lojaOk = filtros.loja ? d.loja === filtros.loja : true
    return vendedorOk && lojaOk
  })

  const vendedoresUnicos = [...new Set(desejos.map(d => d.vendedor))]
  const lojasUnicas = [...new Set(desejos.map(d => d.loja))]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-orange-500">Desejos</h1>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <select name="vendedor" value={filtros.vendedor} onChange={handleFiltro} className="p-2 bg-gray-800 rounded">
          <option value="">Todos os Vendedores</option>
          {vendedoresUnicos.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select name="loja" value={filtros.loja} onChange={handleFiltro} className="p-2 bg-gray-800 rounded">
          <option value="">Todas as Lojas</option>
          {lojasUnicos.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <ul className="space-y-2">
        {desejosFiltrados.map(d => (
          <li key={d.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
            <span>{d.nome} quer {d.produto} ({d.vendedor})</span>
            <button onClick={() => handleDelete(d.id)} className="text-red-500">Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
