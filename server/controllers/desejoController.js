const pool = require('../models/db');

exports.getProdutos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM produtos');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
};

exports.getDesejos = async (req, res) => {
  try {
    const result = await pool.query('SELECT d.id, d.cliente_id, d.produto_id, c.nome, c.telefone FROM desejos d JOIN clientes c ON d.cliente_id = c.id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar desejos' });
  }
};

exports.createDesejo = async (req, res) => {
  const { nome, telefone, produto_id, consentimento_lgpd } = req.body;
  try {
    const clienteResult = await pool.query(
      'INSERT INTO clientes (nome, telefone, consentimento_lgpd) VALUES ($1, $2, $3) RETURNING id',
      [nome, telefone, consentimento_lgpd]
    );
    const clienteId = clienteResult.rows[0].id;
    await pool.query(
      'INSERT INTO desejos (cliente_id, produto_id, data_solicitacao) VALUES ($1, $2, NOW())',
      [clienteId, produto_id]
    );
    res.status(201).json({ message: 'Desejo registrado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar desejo' });
  }
};
