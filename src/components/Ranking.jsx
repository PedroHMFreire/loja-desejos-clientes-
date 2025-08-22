// src/components/Ranking.jsx
import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { loadFromLocalStorage } from '../utils/localStorage'
import { auth, onAuthStateChanged, db, ref, set } from '../firebase'

export default function Ranking({ desejos = [] }) {
  const [filtros, setFiltros] = useState({ vendedor: '', loja: '', dataInicial: '', dataFinal: '' })
  const [msg, setMsg] = useState("")
  const [uid, setUid] = useState(null)

  // Captura UID corretamente (SDK modular)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => setUid(user?.uid || null))
    return unsub
  }, [])

  const handleFiltro = e => setFiltros({ ...filtros, [e.target.name]: e.target.value })

  // Filtro por período, vendedor e loja
  const filtrarPorPeriodo = d => {
    if (!d.createdAt) return false
    const dataDesejo = new Date(d.createdAt)
    const dataIni = filtros.dataInicial ? new Date(filtros.dataInicial) : null
    const dataFim = filtros.dataFinal ? new Date(filtros.dataFinal) : null
    if (dataIni && dataDesejo < dataIni) return false
    if (dataFim && dataDesejo > dataFim) return false
    if (filtros.vendedor && d.vendedor !== filtros.vendedor) return false
    if (filtros.loja && d.loja !== filtros.loja) return false
    return true
  }

  // Agrupa por vendedor e soma valores
  const valores = desejos
    .filter(filtrarPorPeriodo)
    .reduce((acc, d) => {
      const nome = d.vendedor || 'Sem vendedor'
      const valor = Number(d.valor) || 0
      acc[nome] = (acc[nome] || 0) + valor
      return acc
    }, {})

  const rankingArray = Object.entries(valores)
    .map(([nome, total]) => ({ nome, total }))
    .sort((a, b) => b.total - a.total)

  // Exportação Excel
  const exportarExcel = () => {
    if (rankingArray.length === 0) return
    const ws = XLSX.utils.json_to_sheet(rankingArray)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Ranking")
    XLSX.writeFile(wb, "ranking.xlsx")
  }

  // Exportação PDF
  const exportarPDF = () => {
    if (rankingArray.length === 0) return
    const doc = new jsPDF()
    doc.text("Ranking de Vendedores", 14, 16)
    doc.autoTable({
      startY: 22,
      head: [["Vendedor", "Total"]],
      body: rankingArray.map(r => [r.nome, r.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })])
    })
    doc.save("ranking.pdf")
  }

  // Backup manual (opcional): salva um snapshot do array de desejos em /backups
  const backupFirebase = async () => {
    try {
      if (!uid) throw new Error("Sem usuário logado")
      const ts = Date.now()
      await set(ref(db, `users/${uid}/backups/desejos/${ts}`), desejos)
      setMsg('Backup realizado com sucesso!')
    } catch (e) {
      setMsg('Falha ao realizar backup!')
    }
    setTimeout(() => setMsg(''), 2000)
  }

  const vendedoresUnicos = [...new Set(desejos.map(d => d.vendedor).filter(Boolean))]
  const lojasUnicas = [...new Set(desejos.map(d => d.loja).filter(Boolean))]
  const totalGeral = rankingArray.reduce((acc, r) => acc + r.total, 0)

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-orange-500">Ranking de Vendedores</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <select name="vendedor" value={filtros.vendedor} onChange={handleFiltro} className="p-2 bg-gray-800 rounded">
          <option value="">Todos os Vendedores</option>
          {vendedoresUnicos.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
        <select name="loja" value={filtros.loja} onChange={handleFiltro} className="p-2 bg-gray-800 rounded">
          <option value="">Todas as Lojas</option>
          {lojasUnicas.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <input type="date" name="dataInicial" value={filtros.dataInicial} onChange={handleFiltro} className="p-2 bg-gray-800 rounded" />
        <input type="date" name="dataFinal" value={filtros.dataFinal} onChange={handleFiltro} className="p-2 bg-gray-800 rounded" />
      </div>
      <div className="flex gap-2 mb-4">
        <button onClick={exportarExcel} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={rankingArray.length === 0}>
          Exportar Excel
        </button>
        <button onClick={exportarPDF} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50" disabled={rankingArray.length === 0}>
          Exportar PDF
        </button>
        <button onClick={backupFirebase} className="bg-orange-500 text-white px-4 py-2 rounded">
          Backup Firebase
        </button>
        <button onClick={() => setFiltros({ vendedor: '', loja: '', dataInicial: '', dataFinal: '' })} className="bg-gray-400 text-white px-4 py-2 rounded ml-auto">
          Limpar Filtros
        </button>
      </div>
      {msg && <div className="text-center text-green-600 mb-2">{msg}</div>}
      <div className="mb-2 text-right font-semibold">
        Total geral: {totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </div>
      {rankingArray.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Nenhum dado para exibir o ranking.</div>
      ) : (
        <table className="w-full text-left border mt-2">
          <thead>
            <tr className="bg-orange-100">
              <th className="p-2">#</th>
              <th className="p-2">Vendedor</th>
              <th className="p-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {rankingArray.map((r, i) => (
              <tr key={r.nome} className={i === 0 ? "bg-yellow-100 font-bold" : ""}>
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{r.nome}</td>
                <td className="p-2">{r.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}