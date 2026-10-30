import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Aviso, Botao, Cabecalho } from '../componentes/Basicos';
import { cadastrarAtivo, proximoCodigo, STATUS, TIPOS } from '../api/ativosApi';
import { cores } from '../tema';

const VAZIO = {
  nome: '',
  tipo: 'Desktop',
  patrimonio: '',
  localizacao: '',
  status: 'Em uso',
  processador: '',
  memoria: '',
  armazenamento: '',
  sistema: '',
};

/** Tela 6 — Registrar ativo (simula POST /api/ativos) */
export default function TelaRegistro({ onSalvo, onVoltar }) {
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [codigoPrevisto, setCodigoPrevisto] = useState('...');

  useEffect(() => {
    proximoCodigo().then((c) => setCodigoPrevisto(c ?? 'limite atingido'));
  }, []);

  function alterar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }));
  }

  async function salvar() {
    setSalvando(true);
    setErros({});
    try {
      const resposta = await cadastrarAtivo(form);
      if (resposta.ok) {
        setForm(VAZIO);
        onSalvo(resposta.ativo);
      } else {
        setErros(resposta.erros);
      }
    } catch (e) {
      setErros({ geral: 'Não foi possível salvar. Tente de novo.' });
    } finally {
      setSalvando(false);
    }
  }

  const temErro = Object.values(erros).some(Boolean);

  return (
    <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Cabecalho numero={6} titulo="Registrar ativo" />
      <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
        <View style={estilos.codigo}>
          <Text style={estilos.codigoRotulo}>Código que será gerado</Text>
          <Text style={estilos.codigoValor}>{codigoPrevisto}</Text>
          <Text style={estilos.codigoDica}>Esse código vai no QR Code da etiqueta.</Text>
        </View>

        <Campo rotulo="Nome / modelo *" valor={form.nome} onChange={(v) => alterar('nome', v)}
          placeholder="Ex.: Dell OptiPlex 7090" erro={erros.nome} />

        <Rotulo texto="Tipo *" />
        <Opcoes opcoes={TIPOS} valor={form.tipo} onChange={(v) => alterar('tipo', v)} />
        <ErroCampo texto={erros.tipo} />

        <Campo rotulo="Patrimônio *" valor={form.patrimonio}
          onChange={(v) => alterar('patrimonio', v.replace(/\D/g, ''))}
          placeholder="Ex.: 2001" teclado="number-pad" maximo={10} erro={erros.patrimonio} />

        <Campo rotulo="Localização *" valor={form.localizacao} onChange={(v) => alterar('localizacao', v)}
          placeholder="Ex.: Lab. 2 - Sala 8" erro={erros.localizacao} />

        <Rotulo texto="Status *" />
        <Opcoes opcoes={STATUS} valor={form.status} onChange={(v) => alterar('status', v)} />
        <ErroCampo texto={erros.status} />

        <Text style={estilos.secao}>Configuração (opcional)</Text>
        <Campo rotulo="Processador" valor={form.processador} onChange={(v) => alterar('processador', v)}
          placeholder="Ex.: Intel Core i5-11500" />
        <View style={estilos.linha}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Campo rotulo="Memória" valor={form.memoria} onChange={(v) => alterar('memoria', v)} placeholder="8 GB" />
          </View>
          <View style={{ flex: 1 }}>
            <Campo rotulo="Armazenamento" valor={form.armazenamento}
              onChange={(v) => alterar('armazenamento', v)} placeholder="SSD 256 GB" />
          </View>
        </View>
        <Campo rotulo="Sistema operacional" valor={form.sistema} onChange={(v) => alterar('sistema', v)}
          placeholder="Ex.: Windows 11 Pro" />

        {salvando && <Aviso tipo="espera" texto="Salvando..." estilo={{ marginTop: 16 }} />}
        {temErro && !salvando && (
          <Aviso tipo="erro" texto={erros.geral ?? 'Corrija os campos destacados.'} estilo={{ marginTop: 16 }} />
        )}

        <Botao titulo="Salvar ativo" primario onPress={salvar} desabilitado={salvando} />
        <Botao titulo="Cancelar" onPress={onVoltar} />
        <Text style={estilos.nota}>* campos obrigatórios. O cadastro fica salvo neste celular (dados de teste).</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Rotulo({ texto }) {
  return <Text style={estilos.rotulo}>{texto}</Text>;
}

function ErroCampo({ texto }) {
  return texto ? <Text style={estilos.erro}>{texto}</Text> : null;
}

function Campo({ rotulo, valor, onChange, placeholder, erro, teclado = 'default', maximo = 60 }) {
  return (
    <View>
      <Rotulo texto={rotulo} />
      <TextInput
        style={[estilos.campo, erro && { borderColor: cores.vermelho }]}
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={teclado}
        maxLength={maximo}
      />
      <ErroCampo texto={erro} />
    </View>
  );
}

function Opcoes({ opcoes, valor, onChange }) {
  return (
    <View style={estilos.opcoes}>
      {opcoes.map((o) => {
        const ativo = o === valor;
        return (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            style={[estilos.opcao, ativo && estilos.opcaoAtiva]}
            accessibilityRole="radio"
            accessibilityState={{ selected: ativo }}
          >
            <Text style={[estilos.opcaoTexto, ativo && { color: cores.branco }]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { padding: 20, paddingBottom: 40 },
  codigo: {
    backgroundColor: cores.azulClaro,
    borderColor: cores.azul,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  codigoRotulo: { color: cores.apagado, fontSize: 12 },
  codigoValor: { color: cores.azul, fontSize: 26, fontWeight: 'bold', letterSpacing: 2, marginVertical: 2 },
  codigoDica: { color: cores.apagado, fontSize: 12 },
  secao: { fontSize: 15, fontWeight: 'bold', color: cores.tinta, marginTop: 24 },
  rotulo: { fontSize: 13, fontWeight: 'bold', color: cores.tinta, marginTop: 14, marginBottom: 6 },
  campo: {
    borderWidth: 1.5,
    borderColor: cores.linha,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: cores.tinta,
  },
  erro: { color: cores.vermelho, fontSize: 12, marginTop: 4 },
  linha: { flexDirection: 'row' },
  opcoes: { flexDirection: 'row', flexWrap: 'wrap' },
  opcao: {
    borderWidth: 1.5,
    borderColor: cores.azul,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginRight: 8,
    marginBottom: 8,
  },
  opcaoAtiva: { backgroundColor: cores.azul },
  opcaoTexto: { color: cores.azul, fontWeight: 'bold', fontSize: 13 },
  nota: { color: cores.apagado, fontSize: 12, textAlign: 'center', marginTop: 12 },
});
