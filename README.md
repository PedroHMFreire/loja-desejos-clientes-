Loja Desejos Clientes
Sistema para registro de desejos de clientes em uma loja de roupas.
Estrutura

/client: Frontend (React PWA)
/server: Backend (Node.js/Express)

Configuração

Crie um banco PostgreSQL e configure a URL no arquivo /server/.env.
Importe os produtos do arquivo /server/data/produtos.csv para a tabela produtos.
Execute no terminal:cd server
npm install
npm start
cd ../client
npm install
npm run dev



Deploy no Render

Crie um Static Site para /client (build: npm run build, output: dist).
Crie um Web Service para /server (start: node server.js).
Configure o banco PostgreSQL no Render e adicione a DATABASE_URL ao serviço do backend.

Banco de Dados
Crie as tabelas:
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  consentimento_lgpd BOOLEAN NOT NULL
);

CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  nome VARCHAR(100) NOT NULL
);

CREATE TABLE desejos (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  produto_id INTEGER REFERENCES produtos(id),
  data_solicitacao TIMESTAMP NOT NULL
);

Importação de Produtos
Use o seguinte comando SQL para importar produtos.csv:
COPY produtos(codigo, nome) FROM '/caminho/para/produtos.csv' DELIMITER ',' CSV HEADER;


