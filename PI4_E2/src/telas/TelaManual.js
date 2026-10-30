import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Aviso, Botao, Cabecalho } from '../componentes/Basicos';
import { buscarAtivo, normalizarCodigo, validarCodigo } from '../api/ativosApi';
import { cores } from '../tema';

/** Tela 4 — Consulta manual (alternativa quando a câmera ou a RA falham) */
export default function TelaManual({ onResultado, onErro, onVoltarCamera }) {
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState(null); // null | 'consultando' | 'formato'

  async function consultar() {
    const c = normalizarCodigo(codigo);
    // Validação feita ANTES de chamar a API (controle de segurança da entrada)
    if (!validarCodigo(c)) {
      setEstado('formato');
      return;
    }
    setEstado('consultando');
    try {
      const resposta = await buscarAtivo(c);
      if (resposta.ok) onResultado(resposta.ativo);
      else onErro(resposta.erro);
    } catch (e) {
      onErro({ tipo: 'falha' });
    }
  }

  return (
    <KeyboardAvoidingView style={estilos.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Cabecalho numero={4} titulo="Consulta manual" />
      <View style={estilos.conteudo}>
        <Text style={estilos.titulo}>Digite o código da etiqueta</Text>
        <Text style={estilos.sub}>Use quando a câmera ou a RA falhar.</Text>

        <Text style={estilos.rotulo}>Código do ativo</Text>
        <TextInput
          style={[estilos.campo, estado === 'formato' && { borderColor: cores.vermelho }]}
          value={codigo}
          onChangeText={(t) => {
            setCodigo(t.toUpperCase());
            if (estado === 'formato') setEstado(null);
          }}
          placeholder="ATV-001"
          placeholderTextColor="#9CA3AF"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
          returnKeyType="search"
          onSubmitEditing={consultar}
          editable={estado !== 'consultando'}
        />
        <Text style={estilos.formato}>Formato: ATV-000 (3 letras, hífen, 3 números)</Text>

        <Botao titulo="Consultar" primario onPress={consultar} desabilitado={estado === 'consultando'} />

        {estado === 'consultando' && <Aviso tipo="espera" texto="Consultando..." estilo={{ marginTop: 16 }} />}
        {estado === 'formato' && (
          <Aviso tipo="erro" texto="Formato inválido. Ex.: ATV-001" estilo={{ marginTop: 16 }} />
        )}

        <View style={{ flex: 1 }} />
        <Text style={estilos.teste}>Códigos de teste: ATV-001 a ATV-005 (existem) · ATV-999 (não existe)</Text>
        <Botao titulo="Voltar para a câmera" onPress={onVoltarCamera} />
      </View>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { flex: 1, padding: 20 },
  titulo: { fontSize: 18, fontWeight: 'bold', color: cores.tinta },
  sub: { fontSize: 14, color: cores.apagado, marginTop: 4 },
  rotulo: { fontSize: 14, fontWeight: 'bold', color: cores.tinta, marginTop: 24, marginBottom: 6 },
  campo: {
    borderWidth: 1.5,
    borderColor: cores.tinta,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 20,
    letterSpacing: 2,
    color: cores.tinta,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  formato: { fontSize: 12, color: cores.apagado, marginTop: 6 },
  teste: { fontSize: 12, color: cores.apagado, textAlign: 'center' },
});
