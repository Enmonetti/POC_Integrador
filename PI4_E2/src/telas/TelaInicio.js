import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Aviso, Botao, Cabecalho } from '../componentes/Basicos';
import { cores } from '../tema';

/** Tela 1 — Início */
export default function TelaInicio({ onLerQr, onDigitar, onRegistrar, onLista }) {
  return (
    <View style={estilos.tela}>
      <Cabecalho numero={1} titulo="Início" />
      <ScrollView contentContainerStyle={estilos.conteudo}>
        <Text style={estilos.titulo}>Inventário de Computadores</Text>
        <Text style={estilos.subtitulo}>Consulte um computador pelo QR Code</Text>

        <View style={estilos.quadro}>
          <IconeQr />
          <Text style={estilos.dica}>Aponte a câmera para a etiqueta{'\n'}colada no computador</Text>
        </View>

        <Botao titulo="Ler QR Code" primario onPress={onLerQr} estilo={{ paddingVertical: 18 }} />
        <Botao titulo="Digitar código manualmente" onPress={onDigitar} />

        <Text style={estilos.secao}>Cadastro</Text>
        <View style={estilos.linha}>
          <Botao titulo="Registrar ativo" onPress={onRegistrar} estilo={{ flex: 1, marginRight: 8 }} />
          <Botao titulo="Ver ativos" onPress={onLista} estilo={{ flex: 1 }} />
        </View>

        <View style={{ flex: 1, minHeight: 20 }} />
        <Aviso tipo="espera" texto="PoC — dados simulados (dados/ativos.json)" />
      </ScrollView>
    </View>
  );
}

/** Desenho simples de um QR Code feito só com Views. */
function IconeQr() {
  const canto = (estilo) => (
    <View style={[estilos.canto, estilo]}>
      <View style={estilos.cantoMiolo} />
    </View>
  );
  return (
    <View style={estilos.qr}>
      {canto({ top: 6, left: 6 })}
      {canto({ top: 6, right: 6 })}
      {canto({ bottom: 6, left: 6 })}
      <View style={[estilos.ponto, { bottom: 12, right: 12 }]} />
      <View style={[estilos.ponto, { bottom: 24, right: 24 }]} />
      <View style={[estilos.ponto, { bottom: 10, right: 30 }]} />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { flexGrow: 1, padding: 20 },
  secao: { fontSize: 13, fontWeight: 'bold', color: cores.apagado, marginTop: 22, textTransform: 'uppercase' },
  linha: { flexDirection: 'row' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: cores.tinta, textAlign: 'center', marginTop: 8 },
  subtitulo: { fontSize: 14, color: cores.apagado, textAlign: 'center', marginTop: 4 },
  quadro: {
    backgroundColor: cores.azulClaro,
    borderColor: cores.linha,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 18,
    marginVertical: 16,
  },
  dica: { color: cores.apagado, textAlign: 'center', marginTop: 14, fontSize: 14 },
  qr: { width: 84, height: 84, backgroundColor: cores.branco, borderWidth: 1, borderColor: cores.tinta },
  canto: { position: 'absolute', width: 26, height: 26, backgroundColor: cores.tinta, padding: 6 },
  cantoMiolo: { flex: 1, backgroundColor: cores.branco, margin: 1 },
  ponto: { position: 'absolute', width: 9, height: 9, backgroundColor: cores.tinta },
});
