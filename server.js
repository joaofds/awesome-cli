const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Servir arquivos estáticos (HTML, CSS, JS, etc.)
app.use(express.static(path.join(__dirname)));

// Lê o arquivo data.json
app.get('/data', (req, res) => {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erro ao ler arquivo');
    res.json(JSON.parse(data));
  });
});

// Adiciona um novo comando
app.post('/add-command', (req, res) => {
  const { categoria, subcategoria, nomeComando, descricao, comando } = req.body;
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Erro ao ler arquivo');
    let json = JSON.parse(data);
    if (!json[categoria]) json[categoria] = {};
    if (!json[categoria][subcategoria]) json[categoria][subcategoria] = {};
    json[categoria][subcategoria][nomeComando] = { Description: descricao, Command: comando };
    fs.writeFile('data.json', JSON.stringify(json, null, 2), err => {
      if (err) return res.status(500).send('Erro ao salvar arquivo');
      res.send('Comando adicionado!');
    });
  });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
