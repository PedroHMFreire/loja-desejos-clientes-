const express = require('express');
const path = require('path');
const app = express();

const staticPath = path.join(__dirname, 'dist');
app.use(express.static(staticPath));

// SPA fallback: serve index.html para qualquer rota
app.get('*', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
