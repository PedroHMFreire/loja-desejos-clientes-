ANOTÊ
Sistema para registro de desejos de clientes em lojas de roupas.
Estrutura

/public: Arquivos estáticos (HTML, manifest, favicon).
/src/components: Componentes React (Navbar, Home, Desejos, Ranking, Cadastros).
/src: Código principal do frontend.

Configuração Local

Instale as dependências:npm install


Inicie o servidor de desenvolvimento:npm run dev


Acesse http://localhost:3000 no navegador.

Deploy no Render

Crie um Static Site no Render.
Conecte ao repositório GitHub.
Configure:
Build Command: npm install && npm run build
Publish Directory: dist



Uso

Home: Registre desejos com produto, categoria, valor, cliente, WhatsApp, vendedor e loja.
Desejos: Liste desejos com filtros por nome, data, vendedor e loja.
Ranking: Veja os vendedores com mais produtos anotados e atendidos.
Cadastros: Adicione vendedores, lojas e categorias.
Dados salvos no localStorage do navegador.
Mensagens automáticas via WhatsApp para cliente e gerente após registro.

