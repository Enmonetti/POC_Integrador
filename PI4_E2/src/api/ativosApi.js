/**
 * API SIMULADA
 * ------------
 * As funções deste arquivo fazem o papel das rotas descritas em docs/api.md:
 *   GET  /api/ativos/{codigo}  -> buscarAtivo(codigo)
 *   GET  /api/ativos           -> listarAtivos()
 *   POST /api/ativos           -> cadastrarAtivo(dados)
 *
 * Origem dos dados nesta PoC:
 *   - dados/ativos.json  -> 5 computadores simulados (somente leitura)
 *   - AsyncStorage       -> computadores cadastrados pelo próprio app (ficam salvos no celular)
 *
 * Para trocar por uma API real depois, basta substituir o corpo das funções por chamadas
 * fetch() mantendo o mesmo formato de retorno ({ status, ok, ativo | erro | erros }).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import dados from '../../dados/ativos.json';

// Formato aceito para o código do marcador: ATV- seguido de 3 números (ex.: ATV-001)
export const FORMATO_CODIGO = /^ATV-\d{3}$/;
const TAMANHO_MAXIMO = 32; // conteúdo maior que isso nem é analisado
const ATRASO_SIMULADO_MS = 500; // imita o tempo de resposta de uma rede
const CHAVE_ARMAZENAMENTO = '@pi4_e2:ativos_cadastrados';

export const TIPOS = ['Desktop', 'Notebook', 'All-in-one'];
export const STATUS = ['Em uso', 'Disponível', 'Em manutenção'];

// Caracteres invisíveis (controle, zero-width, BOM) e hífens "diferentes"
const INVISIVEIS = /[\u0000-\u001F\u007F-\u009F​-‍﻿]/g;
const HIFENS = /[‐-―−]/g;

export function normalizarCodigo(texto) {
  return String(texto ?? '').replace(INVISIVEIS, '').replace(HIFENS, '-').trim().toUpperCase();
}

export function validarCodigo(codigo) {
  return codigo.length <= TAMANHO_MAXIMO && FORMATO_CODIGO.test(codigo);
}

function limparTexto(texto, maximo = 60) {
  return String(texto ?? '').replace(INVISIVEIS, '').replace(/\s+/g, ' ').trim().slice(0, maximo);
}

function esperar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- armazenamento local (ativos cadastrados no app) ----------

async function lerCadastrados() {
  try {
    const texto = await AsyncStorage.getItem(CHAVE_ARMAZENAMENTO);
    const lista = texto ? JSON.parse(texto) : [];
    return Array.isArray(lista) ? lista : [];
  } catch (e) {
    return []; // dado corrompido não derruba o app
  }
}

async function gravarCadastrados(lista) {
  await AsyncStorage.setItem(CHAVE_ARMAZENAMENTO, JSON.stringify(lista));
}

/** Apaga somente os ativos cadastrados pelo app (os simulados do JSON continuam). */
export async function apagarCadastrados() {
  await AsyncStorage.removeItem(CHAVE_ARMAZENAMENTO);
}

// ---------- operações da "API" ----------

/** GET /api/ativos — todos os ativos (simulados + cadastrados no app). */
export async function listarAtivos() {
  const simulados = dados.ativos.map((a) => ({ ...a, origem: 'simulado' }));
  const cadastrados = (await lerCadastrados()).map((a) => ({ ...a, origem: 'cadastrado' }));
  return [...simulados, ...cadastrados];
}

/** Próximo código livre no formato ATV-000 (ex.: ATV-006). */
export async function proximoCodigo(lista) {
  const todos = lista ?? (await listarAtivos());
  const maior = todos.reduce((m, a) => {
    const n = parseInt(String(a.codigo).slice(4), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  if (maior >= 999) return null;
  return `ATV-${String(maior + 1).padStart(3, '0')}`;
}

/**
 * GET /api/ativos/{codigo}
 *   200 -> { status: 200, ok: true,  ativo }
 *   400 -> { status: 400, ok: false, erro: { tipo: 'formato', ... } }
 *   404 -> { status: 404, ok: false, erro: { tipo: 'nao_encontrado', ... } }
 */
export async function buscarAtivo(entrada) {
  const codigo = normalizarCodigo(entrada);
  await esperar(ATRASO_SIMULADO_MS);

  if (!validarCodigo(codigo)) {
    const exibido = codigo.length > 24 ? `${codigo.slice(0, 24)}...` : codigo;
    return {
      status: 400,
      ok: false,
      erro: { tipo: 'formato', codigo: exibido, mensagem: `O conteúdo "${exibido}" não segue o padrão ATV-000.` },
    };
  }

  const ativo = (await listarAtivos()).find((a) => a.codigo === codigo);
  if (!ativo) {
    return {
      status: 404,
      ok: false,
      erro: { tipo: 'nao_encontrado', codigo, mensagem: `O código ${codigo} não está cadastrado no inventário.` },
    };
  }
  return { status: 200, ok: true, ativo };
}

/**
 * POST /api/ativos — cadastra um computador. O código ATV-000 é gerado automaticamente.
 *   201 -> { status: 201, ok: true,  ativo }
 *   400 -> { status: 400, ok: false, erros: { campo: 'mensagem' } }   campos inválidos
 *   409 -> { status: 409, ok: false, erros: { patrimonio: '...' } }   patrimônio repetido
 *   507 -> { status: 507, ok: false, erros: { geral: '...' } }        códigos esgotados
 */
export async function cadastrarAtivo(entrada) {
  await esperar(ATRASO_SIMULADO_MS);

  const novo = {
    nome: limparTexto(entrada.nome),
    tipo: limparTexto(entrada.tipo, 20),
    patrimonio: limparTexto(entrada.patrimonio, 10),
    localizacao: limparTexto(entrada.localizacao),
    status: limparTexto(entrada.status, 20),
    processador: limparTexto(entrada.processador),
    memoria: limparTexto(entrada.memoria, 20),
    armazenamento: limparTexto(entrada.armazenamento, 30),
    sistema: limparTexto(entrada.sistema, 40),
  };

  const erros = {};
  if (novo.nome.length < 3) erros.nome = 'Informe o nome/modelo (mínimo 3 caracteres).';
  if (!/^\d{1,10}$/.test(novo.patrimonio)) erros.patrimonio = 'Patrimônio deve ter só números (até 10).';
  if (novo.localizacao.length < 3) erros.localizacao = 'Informe a localização (mínimo 3 caracteres).';
  if (!TIPOS.includes(novo.tipo)) erros.tipo = 'Escolha o tipo.';
  if (!STATUS.includes(novo.status)) erros.status = 'Escolha o status.';
  if (Object.keys(erros).length > 0) return { status: 400, ok: false, erros };

  const todos = await listarAtivos();
  if (todos.some((a) => a.patrimonio === novo.patrimonio)) {
    return { status: 409, ok: false, erros: { patrimonio: `Já existe um ativo com o patrimônio ${novo.patrimonio}.` } };
  }

  const codigo = await proximoCodigo(todos);
  if (!codigo) return { status: 507, ok: false, erros: { geral: 'Limite de 999 códigos atingido.' } };

  const ativo = {
    id: todos.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0) + 1,
    codigo,
    ...novo,
    cadastradoEm: new Date().toISOString(),
  };

  const cadastrados = await lerCadastrados();
  await gravarCadastrados([...cadastrados, ativo]);
  return { status: 201, ok: true, ativo: { ...ativo, origem: 'cadastrado' } };
}
