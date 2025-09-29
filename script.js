const form = document.getElementById("formInspecao");
const mensagem = document.getElementById("mensagem");

// CONFIGURAÇÃO: substitua pelos seus dados
const GITHUB_TOKEN = "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"; // ⚠️ Gere um novo token
const REPO_OWNER = "afobelem-netizen";
const REPO_NAME = "InspecaoCampo"; // confere se o nome tá certinho!
const FILE_PATH = "InspecaoCampo/dadosInspecao.json";
const BRANCH = "main";

// Função UTF-8 segura para Base64
function encodeBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const inspecao = {};
  formData.forEach((value, key) => inspecao[key] = value);
  inspecao.data = new Date().toISOString();

  mensagem.textContent = "Salvando no GitHub...";

  try {
    // 1️⃣ Buscar o arquivo existente
    const getFile = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
    });

    const fileData = await getFile.json();

    let existingData = [];
    let sha;

    if (!fileData.message) { // arquivo existe
      sha = fileData.sha;
      existingData = JSON.parse(atob(fileData.content));
    }

    existingData.push(inspecao);

    // 2️⃣ Atualizar ou criar arquivo
    const updateBody = {
      message: "Nova inspeção de campo",
      content: encodeBase64(JSON.stringify(existingData, null, 2)),
      branch: BRANCH
    };

    if (sha) updateBody.sha = sha;

    const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: { 
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updateBody)
    });

    if (updateResponse.ok) {
      mensagem.textContent = "✅ Inspeção salva no GitHub!";
      form.reset();
    } else {
      const erro = await updateResponse.json();
      mensagem.textContent = `❌ Erro ao salvar: ${erro.message}`;
      console.error(erro);
    }

  } catch (err) {
    mensagem.textContent = "❌ Erro ao salvar no GitHub.";
    console.error(err);
  }
});
