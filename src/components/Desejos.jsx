/* src/components/Desejos.jsx */
import { useState } from 'react'
import { db, ref, remove } from '../firebase'

export default function Desejos({ desejos }) {
  const [filtros, setFiltros] = useState({ vendedor: '', loja: '' })

  const handleFiltro = e => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value })
  }

  const handleDelete = id => {
    remove(ref(db, `desejos/${id}`))
  }

  const gerarTexto = (d) =>
    `Cliente: ${d.nome} (${d.tel})\nProduto: ${d.produto}\nTamanho: ${d.tamanho}\nValor: R$ ${d.valor}\nVendedor: ${d.vendedor}\nLoja: ${d.loja}\nCategoria: ${d.categoria}`

  const mensagemCliente = (d) =>
    `Olá, ${d.nome}. Foi um prazer receber sua visita. Assim que recebermos o produto desejado, vamos entrar em contato. Abaixo detalhes do produto. Qualquer dúvida estamos à disposição.%0A%0A` +
    `Produto: ${d.produto}%0ATamanho: ${d.tamanho}%0AValor estimado: R$ ${d.valor}`

  const enviarWhatsapp = (numero, texto) => {
    const link = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
    window.open(link, '_blank')
  }

  const desejosFiltrados = desejos.filter(d => {
    const vendedorOk = filtros.vendedor ? d.vendedor === filtros.vendedor : true
    const lojaOk = filtros.loja ? d.loja === filtros.loja : true
    return vendedorOk && lojaOk
  })

  const vendedoresUnicos = [...new Set(desejos.map(d => d.vendedor).filter(Boolean))]
  const lojasUnicas = [...new Set(desejos.map(d => d.loja).filter(Boolean))]

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
          {lojasUnicas.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <ul className="space-y-2">
        {desejosFiltrados.map(d => (
          <li key={d.id} className="bg-gray-800 p-3 rounded">
            <div className="flex flex-col">
              <span className="font-medium">Cliente: {d.nome} ({d.tel})</span>
              <span>Produto: {d.produto} - Tamanho: {d.tamanho} - Valor: R$ {d.valor}</span>
              <span>Vendedor: {d.vendedor} | Loja: {d.loja} | Categoria: {d.categoria}</span>
              <div className="flex gap-4 mt-2 flex-wrap">
                <button onClick={() => enviarWhatsapp('', gerarTexto(d))} className="text-sm text-green-400 underline">Enviar para produção</button>
                <button onClick={() => enviarWhatsapp(d.tel.replace(/\D/g, ''), mensagemCliente(d))} className="text-sm text-blue-400 underline">Enviar para cliente</button>
                <button onClick={() => handleDelete(d.id)} className="text-sm text-red-400 underline">Excluir</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
