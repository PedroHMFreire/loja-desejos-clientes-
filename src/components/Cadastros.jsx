/* src/components/Cadastros.jsx */
import { useState } from 'react'
import { db, ref, push, remove } from '../firebase'

function CadastroSimples({ titulo, campos, lista, chave }) {
  const [form, setForm] = useState({})

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (Object.values(form).some(v => !v)) return
    push(ref(db, chave), form)
    setForm({})
  }

  const handleDelete = id => {
    remove(ref(db, `${chave}/${id}`))
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

export default function Cadastros({ vendedores, lojas, categorias }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-orange-500">Cadastros</h1>
      <CadastroSimples
        titulo="Vendedores"
        campos={[{ nome: 'nome', label: 'Nome' }, { nome: 'cpf', label: 'CPF' }]}
        lista={vendedores}
        chave="vendedores"
      />
      <CadastroSimples
        titulo="Lojas"
        campos={[{ nome: 'nome', label: 'Nome' }, { nome: 'endereco', label: 'Endereço' }]}
        lista={lojas}
        chave="lojas"
      />
      <CadastroSimples
        titulo="Categorias"
        campos={[{ nome: 'nome', label: 'Nome' }]}
        lista={categorias}
        chave="categorias"
      />
    </div>
  )
}
