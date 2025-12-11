/* ======================================================
   Código completo com:
   - cadastro tutor (2 etapas)
   - cadastro pet com sexo
   - login email+senha
   - topo com tutor+pet exibido apenas na tela principal (tela3)
   - trocar pet (criar novo) + restaurar previous pets
   - funções dieta/consultas/passeios/medicamentos/banho/vacinas/album
   - comunidade (publicar + filtrar)
   - configurações (salvar)
====================================================== */

/* Elementos e estado */
const sections = document.querySelectorAll('section.screen');
const footer = document.getElementById('footer');
const topArea = document.getElementById('topArea');
const menuBtn = document.getElementById('menuBtn');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const tituloMeuPet = document.getElementById('tituloMeuPet');
const userInfoBox = document.getElementById('userInfo');

let usuario = { previousPets: [], pets: [], selectedPetIndex: 0 };

/* Recupera dados salvos (se houver) */
const dadosSalvos = localStorage.getItem('usuarioPet');
if (dadosSalvos) {
  try {
    usuario = JSON.parse(dadosSalvos) || usuario;
    if (!Array.isArray(usuario.previousPets)) usuario.previousPets = usuario.previousPets || [];
    if (!Array.isArray(usuario.pets)) usuario.pets = usuario.pets || [];
    if (typeof usuario.selectedPetIndex !== 'number') usuario.selectedPetIndex = 0;
  } catch (e) {
    usuario = { previousPets: [], pets: [], selectedPetIndex: 0 };
  }
}

/* Navegação / abrir tela */
function abrirTela(id) {
  sections.forEach(s => s.classList.toggle('active', s.id === id));

  // Ajusta top/footer conforme padrão
  if (id === "tela1" || id === "telaCadastroTutor" || id === "telaCadastroPet") {
    topArea.classList.add('big');
    if (menuBtn) menuBtn.classList.add('hidden');
    if (footer) footer.classList.add('hidden');
  } else {
    topArea.classList.remove('big');
    if (menuBtn) menuBtn.classList.remove('hidden');
    if (footer) footer.classList.remove('hidden');
  }
  closeDrawer();
  atualizarTopo(id);
}

/* inicia na tela de login */
abrirTela('tela1');

/* Atualiza topo com tutor + pet (visível apenas na tela 'tela3') */
function atualizarTopo(currentId) {
  const userNameEl = document.getElementById('userName');
  const petNameEl = document.getElementById('petName');

  // default hide
  if (!usuario || !usuario.nome || !usuario.pets || usuario.pets.length === 0) {
    if (userInfoBox) userInfoBox.classList.add('hidden');
    if (tituloMeuPet) tituloMeuPet.textContent = 'Meu Pet';
    return;
  }

  // show only when current screen is tela3 (main categories)
  const visibleOn = currentId || document.querySelector('section.screen.active')?.id;
  if (visibleOn === 'tela3') {
    const pet = usuario.pets[usuario.selectedPetIndex] || null;
    if (userInfoBox) userInfoBox.classList.remove('hidden');
    if (userNameEl) userNameEl.textContent = `Tutor: ${usuario.nome}`;
    if (petNameEl) petNameEl.textContent = pet ? `Pet: ${pet.nome} (${pet.especie || '—'})` : 'Pet: —';
    if (tituloMeuPet) tituloMeuPet.textContent = pet ? `${pet.nome} • ${usuario.nome}` : 'Meu Pet';
  } else {
    if (userInfoBox) userInfoBox.classList.add('hidden');
    if (tituloMeuPet) tituloMeuPet.textContent = 'Meu Pet';
  }
}

/* Cadastro tutor -> pet */
function proximoCadastroPet() {
  const nome = document.getElementById('tutorNome').value.trim();
  const email = document.getElementById('tutorEmail').value.trim();
  const senha = document.getElementById('tutorSenha').value.trim();
  const cidade = document.getElementById('tutorCidade').value.trim();
  const estado = document.getElementById('tutorEstado').value.trim().toUpperCase();

  if (!nome || !email || !senha) {
    alert('Preencha nome, email e senha do tutor.');
    return;
  }

  // Guarda temporariamente
  window._cadastroTemp = { nome, email, senha, cidade, estado };
  abrirTela('telaCadastroPet');
}

function concluirCadastroTotal() {
  const petNome = document.getElementById('petNomeCadastro').value.trim();
  const petEspecie = document.getElementById('petEspecieCadastro').value.trim();
  const petIdade = document.getElementById('petIdadeCadastro').value;
  const petSexo = document.getElementById('petSexoCadastro').value || '';
  const petRaca = document.getElementById('petRacaCadastro').value.trim();
  const petDataNasc = document.getElementById('petDataNascCadastro').value;

  if (!petNome || !petEspecie) {
    alert('Preencha pelo menos nome e espécie do pet.');
    return;
  }

  const tutor = window._cadastroTemp || {};
  if (!tutor || !tutor.email) {
    alert('Dados do tutor não encontrados. Volte e preencha os dados do tutor.');
    abrirTela('telaCadastroTutor');
    return;
  }

  // monta objeto usuario e pet
  usuario = {
    nome: tutor.nome,
    email: tutor.email,
    senha: tutor.senha,
    cidade: tutor.cidade || '',
    estado: tutor.estado || '',
    previousPets: usuario.previousPets || [],
    pets: usuario.pets || [],
    selectedPetIndex: 0
  };

  const novoPet = {
    id: 'p_' + Date.now(),
    nome: petNome,
    especie: petEspecie,
    idade: petIdade || '',
    sexo: petSexo || '',
    raca: petRaca || '',
    dataNasc: petDataNasc || '',
    petData: {
      listaRegistros: '',
      listaDieta: '',
      listaConsultas: '',
      listaPasseios: '',
      listaMedicamentos: '',
      listaBanho: '',
      listaVacinas: '',
      albumHTML: ''
    }
  };

  usuario.pets.push(novoPet);
  usuario.selectedPetIndex = usuario.pets.length - 1;

  // salva em localStorage
  try { localStorage.setItem('usuarioPet', JSON.stringify(usuario)); } catch(e){}

  // limpa temporário e campos
  window._cadastroTemp = null;
  ['tutorNome','tutorEmail','tutorSenha','tutorCidade','tutorEstado','petNomeCadastro','petEspecieCadastro','petIdadeCadastro','petSexoCadastro','petRacaCadastro','petDataNascCadastro'].forEach(id=>{
    if(document.getElementById(id)) document.getElementById(id).value = '';
  });

  alert('Cadastro concluído! Faça login com o email e senha cadastrados.');
  abrirTela('tela1');
}

/* LOGIN */
function entrar() {
  const emailLogin = document.getElementById('loginNome').value.trim().toLowerCase();
  const senhaLogin = document.getElementById('loginSenha').value.trim();
  const dadosRaw = localStorage.getItem('usuarioPet');
  if (!dadosRaw) {
    alert("Nenhuma conta cadastrada neste navegador.");
    return;
  }
  try {
    const dados = JSON.parse(dadosRaw);
    if (!dados) { alert("Dados inválidos."); return; }

    if (emailLogin === (dados.email || '').toLowerCase() && senhaLogin === dados.senha) {
      usuario = dados;
      usuario.previousPets = usuario.previousPets || [];
      usuario.pets = usuario.pets || [];
      if (typeof usuario.selectedPetIndex !== 'number') usuario.selectedPetIndex = 0;
      atualizarTopo('tela3');
      abrirTela('tela3');
    } else {
      alert("Email ou senha incorretos!");
    }
  } catch(e) {
    alert("Erro ao ler dados salvos.");
  }
}

/* Drawer */
function toggleDrawer() {
  if (drawer.classList.contains('open')) closeDrawer();
  else {
    drawer.classList.add('open');
    drawerOverlay.style.display = 'block';
  }
}
function closeDrawer() {
  drawer.classList.remove('open');
  drawerOverlay.style.display = 'none';
}

function drawerClick(action) {
  closeDrawer();
  if (action === 'sair') { abrirTela('tela1'); return; }
  if (action === 'trocarPet') { abrirTela('telaTrocarPet'); return; }
  if (action === 'configuracoes') { abrirTela('telaConfiguracoes'); preencherConfiguracoes(); return; }
  if (action === 'comunidade') { abrirTela('telaComunidade'); carregarNotasComunidade(); return; }
  alert(`Opção: ${action}`);
}

/* util */
function escapeHtml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* FUNÇÕES DAS TELAS */

/* DIETA */
function salvarDieta() {
  let item = document.getElementById('dietaItem').value.trim();
  if (!item) return;
  const listaDieta = document.getElementById('listaDieta');
  listaDieta.innerHTML += `<div class="item-lista"><strong>${escapeHtml(item)}</strong></div>`;
  adicionarRegistroGeral("Dieta adicionada: " + item);
  document.getElementById('dietaItem').value = "";
}

/* CONSULTAS */
function salvarConsulta() {
  let data = document.getElementById('consultaData').value;
  let desc = document.getElementById('consultaDesc').value.trim();
  if (!data || !desc) return;
  const listaConsultas = document.getElementById('listaConsultas');
  listaConsultas.innerHTML += `<div class="item-lista"><strong>${escapeHtml(data)}</strong> ${escapeHtml(desc)}</div>`;
  adicionarRegistroGeral("Consulta marcada: " + desc);
  document.getElementById('consultaData').value = "";
  document.getElementById('consultaDesc').value = "";
}

/* PASSEIOS */
function salvarPasseio() {
  let data = document.getElementById('passeioData').value;
  let local = document.getElementById('passeioLocal').value.trim();
  if (!data || !local) return;
  const listaPasseios = document.getElementById('listaPasseios');
  listaPasseios.innerHTML += `<div class="item-lista"><strong>${escapeHtml(data)}</strong> ${escapeHtml(local)}</div>`;
  adicionarRegistroGeral("Passeio registrado: " + local);
  document.getElementById('passeioData').value = "";
  document.getElementById('passeioLocal').value = "";
}

/* MEDICAMENTOS */
function salvarMedicamentos() {
  let data = document.getElementById('medicamentosData').value;
  let local = document.getElementById('medicamentosLocal').value.trim();
  if (!data || !local) return;
  const listaMedicamentos = document.getElementById('listaMedicamentos');
  listaMedicamentos.innerHTML += `<div class="item-lista"><strong>${escapeHtml(data)}</strong> ${escapeHtml(local)}</div>`;
  adicionarRegistroGeral("Medicamento registrado: " + local);
  document.getElementById('medicamentosData').value = "";
  document.getElementById('medicamentosLocal').value = "";
}

/* BANHO */
function salvarBanho() {
  let data = document.getElementById('banhoData').value;
  let local = document.getElementById('banhoLocal').value.trim();
  if (!data || !local) return;
  const listaBanho = document.getElementById('listaBanho');
  listaBanho.innerHTML += `<div class="item-lista"><strong>${escapeHtml(data)}</strong> ${escapeHtml(local)}</div>`;
  adicionarRegistroGeral("Banho registrado: " + local);
  document.getElementById('banhoData').value = "";
  document.getElementById('banhoLocal').value = "";
}

/* VACINAS */
function salvarVacina() {
  let data = document.getElementById('vacinaData').value;
  let nome = document.getElementById('vacinaNome').value.trim();
  if (!data || !nome) return;
  const listaVacinas = document.getElementById('listaVacinas');
  listaVacinas.innerHTML += `<div class="item-lista"><strong>${escapeHtml(data)}</strong> ${escapeHtml(nome)}</div>`;
  adicionarRegistroGeral("Vacina aplicada: " + nome);
  document.getElementById('vacinaData').value = "";
  document.getElementById('vacinaNome').value = "";
}

/* ALBUM */
function adicionarFoto() {
  let file = document.getElementById('fotoInput').files[0];
  if (!file) return;
  let img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  document.getElementById('albumGrid').appendChild(img);
  document.getElementById('fotoInput').value = "";
}

/* REGISTROS GERAIS */
function adicionarRegistroGeral(txt) {
  const listaRegistros = document.getElementById('listaRegistros');
  listaRegistros.innerHTML = `<div class="item-lista"><strong>Registro</strong> ${escapeHtml(txt)}</div>` + listaRegistros.innerHTML;
}

/* TROCAR PET (criar novo) */
function alterarPet() {
  const novoNome = document.getElementById('nomeNovoPet').value.trim();
  const novaEspecie = document.getElementById('especieNovoPet').value.trim();
  const novaIdade = document.getElementById('idadeNovoPet').value;
  const novoSexo = document.getElementById('sexoNovoPet').value || '';
  const novaDataNasc = document.getElementById('dataNascNovoPet').value;

  if (!novoNome || !novaEspecie) {
    alert('Informe nome e espécie do novo pet.');
    return;
  }

  // Salva snapshot do pet atual (se houver)
  const petAtual = usuario.pets && usuario.pets[usuario.selectedPetIndex];
  if (petAtual) {
    const snapshot = {
      nome: petAtual.nome,
      salvoEm: new Date().toISOString(),
      petData: {
        listaRegistros: document.getElementById('listaRegistros').innerHTML,
        listaDieta: document.getElementById('listaDieta').innerHTML,
        listaConsultas: document.getElementById('listaConsultas').innerHTML,
        listaPasseios: document.getElementById('listaPasseios').innerHTML,
        listaMedicamentos: document.getElementById('listaMedicamentos').innerHTML,
        listaBanho: document.getElementById('listaBanho').innerHTML,
        listaVacinas: document.getElementById('listaVacinas').innerHTML,
        albumHTML: document.getElementById('albumGrid').innerHTML
      }
    };
    usuario.previousPets = usuario.previousPets || [];
    usuario.previousPets.push(snapshot);
  }

  // cria novo pet e seleciona
  const novoPet = {
    id: 'p_' + Date.now(),
    nome: novoNome,
    especie: novaEspecie,
    idade: novaIdade || '',
    sexo: novoSexo || '',
    raca: '',
    dataNasc: novaDataNasc || '',
    petData: {
      listaRegistros: '',
      listaDieta: '',
      listaConsultas: '',
      listaPasseios: '',
      listaMedicamentos: '',
      listaBanho: '',
      listaVacinas: '',
      albumHTML: ''
    }
  };

  usuario.pets = usuario.pets || [];
  usuario.pets.push(novoPet);
  usuario.selectedPetIndex = usuario.pets.length - 1;

  try { localStorage.setItem('usuarioPet', JSON.stringify(usuario)); } catch(e){}

  // limpa visuais
  ['listaRegistros','listaDieta','listaConsultas','listaPasseios','listaMedicamentos','listaBanho','listaVacinas','albumGrid'].forEach(id=>{
    if(document.getElementById(id)) document.getElementById(id).innerHTML = '';
  });

  ['nomeNovoPet','especieNovoPet','idadeNovoPet','sexoNovoPet','dataNascNovoPet'].forEach(id=>{
    if(document.getElementById(id)) document.getElementById(id).value = '';
  });

  atualizarTopo('tela3');
  alert('Novo pet criado e selecionado!');
  abrirTela('tela3');
}

/* Mostrar lista previousPets e restaurar */
function mostrarListaPreviousPets() {
  const container = document.getElementById('listaPreviousContainer');
  container.innerHTML = '';
  if (!usuario.previousPets || usuario.previousPets.length === 0) {
    container.innerHTML = `<div class="tela-note">Nenhum pet anterior salvo.</div>`;
    return;
  }

  const listDiv = document.createElement('div');
  listDiv.className = 'previous-list';
  usuario.previousPets.slice().reverse().forEach((snap, idxRev) => {
    const realIdx = usuario.previousPets.length - 1 - idxRev;
    const btn = document.createElement('button');
    btn.textContent = `${snap.nome || 'Sem nome'} — salvo em ${new Date(snap.salvoEm).toLocaleString()}`;
    btn.onclick = () => {
      if (!confirm(`Restaurar "${snap.nome}" como pet atual?`)) return;

      const restoredPet = {
        id: 'p_restored_' + Date.now(),
        nome: snap.nome || ('PetRestored_' + Date.now()),
        especie: '—',
        idade: '',
        raca: '',
        dataNasc: '',
        petData: {
          listaRegistros: snap.petData.listaRegistros || '',
          listaDieta: snap.petData.listaDieta || '',
          listaConsultas: snap.petData.listaConsultas || '',
          listaPasseios: snap.petData.listaPasseios || '',
          listaMedicamentos: snap.petData.listaMedicamentos || '',
          listaBanho: snap.petData.listaBanho || '',
          listaVacinas: snap.petData.listaVacinas || '',
          albumHTML: snap.petData.albumHTML || ''
        }
      };

      usuario.pets = usuario.pets || [];
      usuario.pets.push(restoredPet);
      usuario.selectedPetIndex = usuario.pets.length - 1;

      // remove snapshot restaurado
      usuario.previousPets.splice(realIdx, 1);

      try { localStorage.setItem('usuarioPet', JSON.stringify(usuario)); } catch(e){}
      // aplica dados restaurados na interface
      document.getElementById('listaRegistros').innerHTML = restoredPet.petData.listaRegistros || '';
      document.getElementById('listaDieta').innerHTML = restoredPet.petData.listaDieta || '';
      document.getElementById('listaConsultas').innerHTML = restoredPet.petData.listaConsultas || '';
      document.getElementById('listaPasseios').innerHTML = restoredPet.petData.listaPasseios || '';
      document.getElementById('listaMedicamentos').innerHTML = restoredPet.petData.listaMedicamentos || '';
      document.getElementById('listaBanho').innerHTML = restoredPet.petData.listaBanho || '';
      document.getElementById('listaVacinas').innerHTML = restoredPet.petData.listaVacinas || '';
      document.getElementById('albumGrid').innerHTML = restoredPet.petData.albumHTML || '';

      atualizarTopo('tela3');
      alert('Pet restaurado e selecionado!');
      abrirTela('tela3');
    };
    listDiv.appendChild(btn);
  });

  container.appendChild(listDiv);
}

/* CONFIGURAÇÕES */
function salvarConfiguracoes() {
  const cidade = document.getElementById('configCidade').value.trim();
  const estado = document.getElementById('configEstado').value.trim().toUpperCase();
  const duvida = document.getElementById('configDuvida').value.trim();
  const contato = document.getElementById('configContato').value.trim();
  const reclamacao = document.getElementById('configReclamacao').value.trim();

  const cfg = { cidade, estado, duvida, contato, reclamacao, atualizadoEm: new Date().toISOString() };
  try {
    localStorage.setItem('appPetConfig', JSON.stringify(cfg));
    alert('Configurações salvas!');
  } catch(e) {
    alert('Não foi possível salvar as configurações.');
  }
}

function preencherConfiguracoes() {
  const raw = localStorage.getItem('appPetConfig');
  if (!raw) return;
  try {
    const cfg = JSON.parse(raw);
    if (!cfg) return;
    if (document.getElementById('configCidade')) document.getElementById('configCidade').value = cfg.cidade || '';
    if (document.getElementById('configEstado')) document.getElementById('configEstado').value = cfg.estado || '';
    if (document.getElementById('configDuvida')) document.getElementById('configDuvida').value = cfg.duvida || '';
    if (document.getElementById('configContato')) document.getElementById('configContato').value = cfg.contato || '';
    if (document.getElementById('configReclamacao')) document.getElementById('configReclamacao').value = cfg.reclamacao || '';
  } catch(e) { /* ignore */ }
}

/* COMUNIDADE */
function carregarNotasComunidade() {
  const lista = document.getElementById('listaComunidade');
  const estadoFiltro = document.getElementById('filtroEstado') ? document.getElementById('filtroEstado').value : 'Todas';
  const cidadeFiltro = document.getElementById('filtroCidade') ? document.getElementById('filtroCidade').value.trim().toLowerCase() : '';

  const raw = localStorage.getItem('appPetCommunityNotes');
  let notas = [];
  if (raw) {
    try { notas = JSON.parse(raw) || []; } catch(e) { notas = []; }
  }

  const filtradas = notas.filter(n => {
    if (estadoFiltro && estadoFiltro !== 'Todas' && n.estado !== estadoFiltro) return false;
    if (cidadeFiltro && n.cidade && n.cidade.toLowerCase().indexOf(cidadeFiltro) === -1) return false;
    return true;
  });

  lista.innerHTML = '';
  if (filtradas.length === 0) {
    lista.innerHTML = `<div class="item-lista"><strong>Sem contribuições</strong><div class="tela-note">Nenhuma nota para essa região.</div></div>`;
    return;
  }

  filtradas.slice().reverse().forEach(n => {
    const div = document.createElement('div');
    div.className = 'item-lista';
    div.innerHTML = `<strong>${escapeHtml(n.nomeTutor || 'Anônimo')}</strong> — <small>${escapeHtml(n.cidade || '')} ${n.estado ? '- ' + escapeHtml(n.estado) : ''} • ${new Date(n.criadoEm).toLocaleString()}</small>
                     <div style="margin-top:6px;">${escapeHtml(n.mensagem)}</div>`;
    lista.appendChild(div);
  });
}

function adicionarNotaComunidade() {
  const mensagem = document.getElementById('comunidadeMensagem').value.trim();
  const cidade = document.getElementById('comunidadeCidade').value.trim();
  const estado = document.getElementById('comunidadeEstado').value;
  if (!mensagem) {
    alert('Escreva uma mensagem antes de publicar.');
    return;
  }
  const nomeTutor = usuario && usuario.nome ? usuario.nome : 'Visitante';

  const nota = {
    id: 'n_' + Date.now(),
    nomeTutor,
    cidade,
    estado,
    mensagem,
    criadoEm: new Date().toISOString()
  };

  let notas = [];
  const raw = localStorage.getItem('appPetCommunityNotes');
  if (raw) {
    try { notas = JSON.parse(raw) || []; } catch(e) { notas = []; }
  }
  notas.push(nota);
  try {
    localStorage.setItem('appPetCommunityNotes', JSON.stringify(notas));
    document.getElementById('comunidadeMensagem').value = '';
    document.getElementById('comunidadeCidade').value = '';
    document.getElementById('comunidadeEstado').value = 'Todas';
    alert('Compartilhado na comunidade!');
    carregarNotasComunidade();
  } catch(e) {
    alert('Não foi possível publicar a nota.');
  }
}

/* Event listeners filtros */
if (document.getElementById('filtroEstado')) document.getElementById('filtroEstado').addEventListener('change', carregarNotasComunidade);
if (document.getElementById('filtroCidade')) document.getElementById('filtroCidade').addEventListener('input', carregarNotasComunidade);

/* Inicialização */
window.addEventListener('load', () => {
  usuario.previousPets = usuario.previousPets || [];
  usuario.pets = usuario.pets || [];

  // se usuário já estiver logado (tem dados em storage), não o coloca automaticamente em sessão
  // (exige login), mas preenche topo caso esteja na tela certa
  preencherConfiguracoes();
  carregarNotasComunidade();
  atualizarTopo();

  // se havia conta no storage e tiver pets, tituloMeuPet pode exibir saudação simples quando na tela3
  if (usuario && usuario.nome) {
    if (usuario.pets && usuario.pets[usuario.selectedPetIndex]) {
      tituloMeuPet.textContent = `${usuario.pets[usuario.selectedPetIndex].nome} • ${usuario.nome}`;
    } else {
      tituloMeuPet.textContent = `Bem-vindo(a), ${usuario.nome}! 🐾`;
    }
  }

  const btnHome = document.getElementById("btnHomeFooter");
  if (btnHome) btnHome.addEventListener("click", () => abrirTela('tela3'));
});
