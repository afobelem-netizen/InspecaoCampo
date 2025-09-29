const form = document.getElementById("formInspecao");
const mensagem = document.getElementById("mensagem");

// CONFIGURAÇÃO: substitua pelos seus dados
const GITHUB_TOKEN = "SEU_TOKEN_AQUI";
const REPO_OWNER = "SEU_USUARIO";
const REPO_NAME = "NOME_DO_REPOSITORIO";
const FILE_PATH = "InspecaoCampo/dadosInspecao.json";
const BRANCH = "main";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const inspecao = {};
  formData.forEach((value, key) => inspecao[key] = value);
  inspecao.data = new Date().toISOString();

  mensagem.textContent = "Salvando no GitHub...";

  try {
    // 1️⃣ Buscar o arquivo existente para pegar o sha
    const getFile = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      }
    });
    const fileData = await getFile.json();
    const sha = fileData.sha;

    // 2️⃣ Atualizar arquivo JSON
    const existingData = JSON.parse(atob(fileData.content));
    existingData.push(inspecao);

    const updateResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Nova inspeção de campo",
        content: btoa(JSON.stringify(existingData, null, 2)),
        sha: sha,
        branch: BRANCH
      })
    });

    if (updateResponse.ok) {
      mensagem.textContent = "✅ Inspeção salva no GitHub!";
      form.reset();
    } else {
      mensagem.textContent = "❌ Erro ao salvar no GitHub.";
      console.error(await updateResponse.json());
    }

  } catch (err) {
    mensagem.textContent = "❌ Erro ao salvar no GitHub.";
    console.error(err);
  }
});
