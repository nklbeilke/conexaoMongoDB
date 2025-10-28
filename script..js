// SELETORES DE ELEMENTOS //
const palavraInput = document.getElementById ("palavra_input");
const listaPalavras = document.getElementById("lista_palavras");
const revisoesContainer = document.getElementById("revisoesContainer");
const form = document.getElementById("documentForm");
const output = document.getElementById("jsonOutput");
const copyBtn = document.getElementById("copyJsonBtn");
const gerarPdfBtn = document.getElementById("gerarPdfBtn");

let palavras = [];

// FUNÇÕES DE MANIPULAÇÃO DO FORMULÁRIO

// ADICIONA PALAVRAS CHAVE AO PRESSIONAR Enter
palavraInput.addEventListener("keypress", e => {
    if(e.key === "Enter"){
        e.preventDefault();
        const palavra = palavraInput.ariaValueMax.trim();
        if(palavra && !palavras.includes(palavra)){
            palavras.push(palavra);
            atualizarPalavras();
            palavraInput.value = "";
        }
    }
});

//Atualiza a lista de palavras-chave na tela e permite a remoção
function atualizarPalavras(){
    listaPalavras.innerHTML = "";
    palavras.forEach(p =>{
        const li = document.createElement("li");
        li.textContent = p;
        li.addEventListener("click", () => {
            palavras = palavras.filter(item => item !== p);
            atualizarPalavras();
        });
        listaPalavras.appendChild(li)
    });
}

// Adiciona dinamicamente os campos para uma nova revisão
document.getElementById("addRevisão").addEventListener("click", () => {
    const div = document.createElement("div");
    div.classList.add("revisao");
    div.innerHTML = `
    <label>Data:</label>
    <input type"datetime-local" class="data_revisao" required>
    <label>Revisado por: </label>
    <input type="text" class="revisado_por" required>
    <label>Comentário:</label>
    <input type="text" class="comentario_revisao" required>
    `;
    revisoesContainer.appendChild(div);
});

// ---FUNÇÃO CENTRAL PARA COLETAR OS DADOS DO FORMULÁRIO
// Reutilizada para gerar tanto o JSON quanto o PDF
function construirDocumento(){
    // Coleta todas as revisões adicionadas
    const revisoesInputs = Array.from(document.querySelectorAll(".revisao"));
    const revisoes = revisoesInputs.map(div => ({
        data: div.querySelector(".data_revisao").value,
        revisado_por: div.querySelector(".revisado_por").value,
        comentario: div.querySelector(".comentario_revisao").value
    }));

    const document = {
        titulo: document.getElementById("titulo").value,
        tipo: document.getElementById("tipo").value,
        ano: parseInt(document.getElementById("ano").value),
        status: document.getElementById("status").value,
        data_envio: document.getElementById("data_envio").value,
        responsavel: {
            nome: document.getElementById("nome_responsavel").value,
            cargo: document.getElementById("cargo_responsavel").value,
            departamento: document.getElementById("departamento_responsavel").value
        },
        palavras_chave: palavras,
        revisoes: revisoes,
    };

    return document;
}

// LÓGICA DE GERAÇÃO (JSON E PDF)
// Evento para gerar o documento JSON no formato MongoDB
form.addEventListener("submit", e=> {
    e.preventDefault();
    const documento = construirDocumento();

    //Cria uma cópia do objeto para formatar as datas para o MongoDB
    const documentoMongo = JSON.parse(JSON.stringify(documento));
    documentoMongo.data_envio = {"$date": documento.data_envio};
    documentoMongo.revisoes.forEach(rev => {
        rev.data = {"$date": rev.data};
    });

    //Exibe o JSON formatado na tela
    output.textContent = JSON.stringify(documentoMongo, null, 2);
});

// Evento para o botão de gerar o relatório
gerarPdfBtn.addEventListener("click", () =>{
    const doc = construirDocumento();

    //Validação para garantir que o formulário foi preenchido
    if(!doc.titulo){
        alert("Por favor, preencha o formulário antes de gerar o PDF.");
        return;
    }

    //Acessa a bibilioteca jsPDF que foi carregada no HTML
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    let y = 20; //Posição vertical inicial no documento pdf 

    // Adiciona o conteúdo ao PDF
    pdf.setFontSize(18);
    pdf.text(doc.titulo, 105, y, { align: 'center'});
    y +=15;

    pdf.setFontSize(12);
    pdf.text(`Tipo: ${doc.tipo}`, 20, y);
    pdf.text(`Ano: ${doc.ano}`, 120, y);
    y += 7;
    pdf.text(`Status: ${doc.status}`, 20, y);
    pdf.text(`Data de Envio: ${new Date(doc.data_envio).toLocaleString('pt-BR')}`, 120, y);
    y+= 15;

    //Seção do Responsável
    pdf.setFontSize(14);
    pdf.text("Responsável", 20, y);
    y+= 7;
    pdf.setFontSize(12);
    pdf.text(`- Nome: ${doc.responsavel.nome}`, 25, y);
})