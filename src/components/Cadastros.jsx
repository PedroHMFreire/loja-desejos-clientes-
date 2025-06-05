/* src/components/Cadastros.jsx */
import { useState, useEffect } from 'react'

function CadastroSimples({ titulo, campos, lista, setLista, chave }) {
  const [form, setForm] = useState({})

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (Object.values(form).some(v => !v)) return
    const novaEntrada = { ...form, id: Date.now() }
    const atualizados = [...lista, novaEntrada]
    setLista(atualizados)
    localStorage.setItem(chave, JSON.stringify(atualizados))
    setForm({})
  }

  const handleDelete = id => {
    const atualizados = lista.filter(e => e.id !== id)
    setLista(atualizados)
    localStorage.setItem(chave, JSON.stringify(atualizados))
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4 text-orange-500">{titulo}</h2>
      <form onSubmit={handleSubmit} className="grid gap-2 mb-4">
        {campos.map(c => (
          <input key={c.nome} name={c.nome} value={form[c.nome] || ''} onChange={handleChange} placeholder={c.label} className="p-2 bg-gray-800 rounded" />
        ))}
        <button type="submit" className="bg-orange-500 p-2 rounded text-white">Adicionar</button>
      </form>
      <ul className="space-y-2">
        {lista.map(e => (
          <li key={e.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
            <span>{campos.map(c => e[c.nome]).join(' - ')}</span>
            <button onClick={() => handleDelete(e.id)} className="text-red-500">Excluir</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Cadastros({ vendedores, setVendedores, lojas, setLojas, categorias, setCategorias }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-orange-500">Cadastros</h1>
      <CadastroSimples
        titulo="Vendedores"
        campos={[{ nome: 'nome', label: 'Nome' }, { nome: 'cpf', label: 'CPF' }]}
        lista={vendedores}
        setLista={setVendedores}
        chave="vendedores"
      />
      <CadastroSimples
        titulo="Lojas"
        campos={[{ nome: 'nome', label: 'Nome' }, { nome: 'endereco', label: 'Endereço' }]}
        lista={lojas}
        setLista={setLojas}
        chave="lojas"
      />
      <CadastroSimples
        titulo="Categorias"
        campos={[{ nome: 'nome', label: 'Nome' }]}
        lista={categorias}
        setLista={setCategorias}
        chave="categorias"
      />
    </div>
  )
}
