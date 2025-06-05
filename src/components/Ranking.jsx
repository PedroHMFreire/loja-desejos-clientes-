/* src/components/Ranking.jsx */
import { useState } from 'react'
import { utils, writeFile } from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Ranking({ desejos }) {
  const [filtros, setFiltros] = useState({ vendedor: '', loja: '', dataInicial: '', dataFinal: '' })

  const handleFiltro = e => setFiltros({ ...filtros, [e.target.name]: e.target.value })

  const filtrarPorPeriodo = d => {
    const dataDesejo = new Date(d.data)
    const dataIni = filtros.dataInicial ? new Date(filtros.dataInicial) : null
    const dataFim = filtros.dataFinal ? new Date(filtros.dataFinal) : null
    return (
      (!filtros.vendedor || d.vendedor === filtros.vendedor) &&
      (!filtros.loja || d.loja === filtros.loja) &&
      (!dataIni || dataDesejo >= dataIni) &&
      (!dataFim || dataDesejo <= dataFim)
    )
  }

  const valores = desejos.filter(filtrarPorPeriodo).reduce((acc, d) => {
    const key = d.vendedor || 'Sem vendedor'
    acc[key] = (acc[key] || 0) + parseFloat(d.valor || 0)
    return acc
  }, {})

  const rankingArray = Object.entries(valores)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)

  const exportarExcel = () => {
    const ws = utils.json_to_sheet(rankingArray)
    const wb = utils.book_new()
    utils.book_append_sheet(wb, ws, 'Ranking')
    writeFile(wb, 'ranking.xlsx')
  }

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.text('Ranking por Valor Perdido', 14, 16)
    autoTable(doc, {
      head: [['Posição', 'Vendedor', 'Total (R$)']],
      body: rankingArray.map((r, i) => [i + 1, r.nome, r.total.toFixed(2)])
    })
    doc.save('ranking.pdf')
  }

  const vendedoresUnicos = [...new Set(desejos.map(d => d.vendedor).filter(Boolean))]
  const lojasUnicas = [...new Set(desejos.map(d => d.loja).filter(Boolean))]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-orange-500">Ranking por Valor Perdido</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <select name="vendedor" value={filtros.vendedor} onChange={handleFiltro} className="p-2 bg-gray-800 rounded">
          <option value="">Todos os Vendedores</option>
          {vendedoresUnicos.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select name="loja" value={filtros.loja} onChange={handleFiltro} className="p-2 bg-gray-800 rounded">
          <option value="">Todas as Lojas</option>
          {lojasUnicos.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <input type="date" name="dataInicial" value={filtros.dataInicial} onChange={handleFiltro} className="p-2 bg-gray-800 rounded" />
        <input type="date" name="dataFinal" value={filtros.dataFinal} onChange={handleFiltro} className="p-2 bg-gray-800 rounded" />
      </div>

      <div className="flex gap-4 mb-4">
        <button onClick={exportarExcel} className="bg-green-600 text-white px-4 py-2 rounded">Exportar Excel</button>
        <button onClick={exportarPDF} className="bg-red-600 text-white px-4 py-2 rounded">Exportar PDF</button>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={rankingArray}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nome" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total" fill="#f97316" />
        </BarChart>
      </ResponsiveContainer>

      <ul className="space-y-2 mt-6">
        {rankingArray.map((v, i) => (
          <li key={v.nome} className="bg-gray-800 p-3 rounded flex justify-between items-center">
            <span className="font-medium">#{i + 1} {v.nome}</span>
            <span>R$ {v.total.toFixed(2)}</span>
          </li>
        ))}
        {rankingArray.length === 0 && <p>Nenhum valor perdido no período.</p>}
      </ul>
    </div>
  )
}
