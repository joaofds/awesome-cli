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
document.addEventListener('DOMContentLoaded', () => {
    const tree = document.querySelector('.tree');
    
    fetch('data.json')
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
    });
});

// Remove elemento
function deleteElement(event, el) {
    el.parentElement.remove()
}