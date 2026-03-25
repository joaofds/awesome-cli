// Variável para armazenar o último <details> aberto
let lastOpenedDetails = null;
let countId = 0;

function buildTree(data, parentElement, depth = 0) {
    for (const [key, value] of Object.entries(data)) {
        const li = document.createElement('li');

        // Exibe até o segundo nível como <details> e <summary>
        if (typeof value === 'object' && depth < 2) {
            const details = document.createElement('details');
            const summary = document.createElement('summary');
            summary.textContent = key;
            details.appendChild(summary);
            li.appendChild(details);

            const ul = document.createElement('ul');
            details.appendChild(ul);
            buildTree(value, ul, depth + 1);

            // Evento de clique para fechar o último <details> aberto no primeiro nível
            if (depth === 0) {
                summary.addEventListener('click', () => {
                    if (lastOpenedDetails && lastOpenedDetails !== details) {
                        lastOpenedDetails.removeAttribute('open');  // Fecha o último item aberto
                    }
                    lastOpenedDetails = details;  // Define o novo <details> como o último aberto
                });
            }
        } else if (depth === 2) {
            // Terceiro nível: comando clicável
            li.textContent = key;
            li.addEventListener('click', (event) => {
                event.stopPropagation(); // Evita a propagação para os elementos pais
            
                // Cria um novo elemento com a classe "command-details"
                const newCommandDetails = document.createElement('pre');
                newCommandDetails.classList.add('command-details');
                newCommandDetails.textContent = `${value.Description}\n${value.Command}`;
                newCommandDetails.setAttribute("id", `detail-${++countId}`);
                
                // Adiciona o novo elemento à coluna de conteúdo
                document.querySelector('.content').appendChild(newCommandDetails);

                // seleciona <pre> recem criado
                const pre = document.querySelector(`#detail-${countId}`)

                // botao para remover elemento.
                let button = document.createElement('button');
                button.classList.add('btn', 'btn-sm', 'btn-primary');
                button.setAttribute("onclick", "deleteElement(event, this);");
                button.textContent = "Remover";
                pre.appendChild(button);
            });
            
        }

        parentElement.appendChild(li);
        parentElement.classList.add("inner-ul")

    }
}

// Busca json e constroi a arvore
// Detecta ambiente (localhost ou produção)
const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const DATA_URL = isLocalhost ? 'http://localhost:3000/data' : 'data.json';

document.addEventListener('DOMContentLoaded', () => {
    const tree = document.querySelector('.tree');
    
    fetch(DATA_URL)
    .then(response => response.json())
    .then(data => {
    
        // Ordenar os primeiros itens do objeto (primeiro nível)
        const sortedData = Object.keys(data)
            .sort() // Ordena alfabeticamente
            .reduce((sortedObj, key) => {
                sortedObj[key] = data[key];
                return sortedObj;
            }, {});
            
        buildTree(sortedData, tree);
        window.cliData = sortedData; // Disponibiliza para o formulário
        popularCategorias(sortedData);
    });

    // Preenche categorias no datalist
    function popularCategorias(data) {
        const categoriaInput = document.getElementById('categoria');
        const categoriasList = document.getElementById('categorias-list');
        categoriasList.innerHTML = '';
        Object.keys(data).forEach(cat => {
            categoriasList.innerHTML += `<option value="${cat}">`;
        });
    }

    // Preenche subcategorias no datalist ao mudar categoria
    document.getElementById('categoria').addEventListener('input', function() {
        const subcategoriaInput = document.getElementById('subcategoria');
        const subcategoriasList = document.getElementById('subcategorias-list');
        subcategoriasList.innerHTML = '';
        const categoria = this.value;
        if (categoria && window.cliData[categoria]) {
            Object.keys(window.cliData[categoria]).forEach(sub => {
                subcategoriasList.innerHTML += `<option value="${sub}">`;
            });
        }
    });

    // Lida com envio do formulário
    document.getElementById('add-command-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const categoria = document.getElementById('categoria').value.trim();
        const subcategoria = document.getElementById('subcategoria').value.trim();
        const nomeComando = document.getElementById('nome-comando').value;
        const descricao = document.getElementById('descricao').value;
        const comando = document.getElementById('comando').value;
        if (!categoria || !subcategoria || !nomeComando || !descricao || !comando) return;
        if (!isLocalhost) {
            alert('Salvar comandos só é possível localmente!');
            return;
        }
        // Envia para o backend
        fetch('http://localhost:3000/add-command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoria, subcategoria, nomeComando, descricao, comando })
        })
        .then(res => res.ok ? res.text() : Promise.reject('Erro ao salvar'))
        .then(msg => {
            // Atualiza árvore na interface
            adicionarComandoNaArvore(categoria, subcategoria, nomeComando, descricao, comando);
            this.reset();
            alert('Comando salvo com sucesso!');
        })
        .catch(() => alert('Erro ao salvar comando no backend.'));
    });

    // Adiciona novo comando na árvore visual
    function adicionarComandoNaArvore(categoria, subcategoria, nomeComando, descricao, comando) {
        // Procura o <li> da categoria
        const tree = document.querySelector('.tree');
        let catDetails = Array.from(tree.querySelectorAll('summary')).find(s => s.textContent === categoria)?.parentElement;
        if (!catDetails) return;
        let subDetails = Array.from(catDetails.querySelectorAll('summary')).find(s => s.textContent === subcategoria)?.parentElement;
        if (!subDetails) return;
        // Cria novo comando
        const li = document.createElement('li');
        li.textContent = nomeComando;
        li.addEventListener('click', (event) => {
            event.stopPropagation();
            const newCommandDetails = document.createElement('pre');
            newCommandDetails.classList.add('command-details');
            newCommandDetails.textContent = `${descricao}\n${comando}`;
            newCommandDetails.setAttribute("id", `detail-${++countId}`);
            document.querySelector('.content').appendChild(newCommandDetails);
            const pre = document.querySelector(`#detail-${countId}`)
            let button = document.createElement('button');
            button.classList.add('btn', 'btn-sm', 'btn-primary');
            button.setAttribute("onclick", "deleteElement(event, this);");
            button.textContent = "Remover";
            pre.appendChild(button);
        });
        subDetails.querySelector('ul').appendChild(li);
    }
});

// Remove elemento
function deleteElement(event, el) {
    el.parentElement.remove()
}