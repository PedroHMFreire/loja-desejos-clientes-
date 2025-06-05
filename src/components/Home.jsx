/* src/components/Home.jsx */
import { useState } from 'react'

export default function Home({ desejos, setDesejos, vendedores, lojas, categorias }) {
  const [form, setForm] = useState({
    nome: '',
    tel: '',
    produto: '',
    tamanho: '',
    valor: '',
    vendedor: '',
    loja: '',
    categoria: ''
  })

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.nome || !form.tel || !form.produto || !form.tamanho || !form.valor || !form.vendedor || !form.loja || !form.categoria) return
    const novoDesejo = { ...form, id: Date.now(), data: new Date().toISOString() }
    const atualizados = [...desejos, novoDesejo]
    setDesejos(atualizados)
    localStorage.setItem('desejos', JSON.stringify(atualizados))
    setForm({ nome: '', tel: '', produto: '', tamanho: '', valor: '', vendedor: '', loja: '', categoria: '' })
  }

  const handleDelete = id => {
    const atualizados = desejos.filter(d => d.id !== id)
    setDesejos(atualizados)
    localStorage.setItem('desejos', JSON.stringify(atualizados))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 text-orange-500">Registrar Desejo</h1>
      <form onSubmit={handleSubmit} className="grid gap-2 mb-6">
        <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome do Cliente" className="p-2 bg-gray-800 rounded" />
        <input name="tel" value={form.tel} onChange={handleChange} placeholder="Telefone do Cliente" className="p-2 bg-gray-800 rounded" />
        <input name="produto" value={form.produto} onChange={handleChange} placeholder="Produto Desejado" className="p-2 bg-gray-800 rounded" />
        <input name="tamanho" value={form.tamanho} onChange={handleChange} placeholder="Tamanho do Produto" className="p-2 bg-gray-800 rounded" />
        <input name="valor" value={form.valor} onChange={handleChange} placeholder="Valor Estimado (R$)" type="number" className="p-2 bg-gray-800 rounded" />
        <select name="vendedor" value={form.vendedor} onChange={handleChange} className="p-2 bg-gray-800 rounded">
          <option value="">Selecione o Vendedor</option>
          {vendedores.map(v => <option key={v.cpf} value={v.nome}>{v.nome}</option>)}
        </select>
        <select name="loja" value={form.loja} onChange={handleChange} className="p-2 bg-gray-800 rounded">
          <option value="">Selecione a Loja</option>
          {lojas.map(l => <option key={l.nome} value={l.nome}>{l.nome}</option>)}
        </select>
        <select name="categoria" value={form.categoria} onChange={handleChange} className="p-2 bg-gray-800 rounded">
          <option value="">Selecione a Categoria</option>
          {categorias.map(c => <option key={c.nome} value={c.nome}>{c.nome}</option>)}
        </select>
        <button type="submit" className="bg-orange-500 p-2 rounded text-white">Adicionar</button>
      </form>

      <h2 className="text-xl font-semibold mb-2">Desejos Registrados</h2>
      <ul className="space-y-2">
        {desejos.map(d => (
          <li key={d.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
            <span>{d.nome} quer {d.produto} tamanho {d.tamanho} (R$ {d.valor}) ({d.vendedor})</span>
            <button onClick={() => handleDelete(d.id)} className="text-red-500">Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
