import React from 'react';
import { Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { cores } from '../tema';

const TOPO = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 50;

/** Barra azul com o número e o nome da tela (igual aos wireframes). */
export function Cabecalho({ numero, titulo }) {
  return (
    <View style={[estilos.cabecalho, { paddingTop: TOPO + 10 }]}>
      <View style={estilos.numero}>
        <Text style={estilos.numeroTexto}>{numero}</Text>
      </View>
      <Text style={estilos.cabecalhoTexto}>{titulo}</Text>
    </View>
  );
}

export function Botao({ titulo, onPress, primario = false, desabilitado = false, estilo }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      style={({ pressed }) => [
        estilos.botao,
        primario ? estilos.botaoPrimario : estilos.botaoSecundario,
        (pressed || desabilitado) && { opacity: 0.6 },
        estilo,
      ]}
    >
      <Text style={[estilos.botaoTexto, { color: primario ? cores.branco : cores.azul }]}>{titulo}</Text>
    </Pressable>
  );
}

const TIPOS = {
  sucesso: { cor: cores.verde, fundo: cores.verdeClaro },
  erro: { cor: cores.vermelho, fundo: cores.vermelhoClaro },
  espera: { cor: cores.ambar, fundo: cores.ambarClaro },
};

/** Mensagem de espera, sucesso ou erro. */
export function Aviso({ tipo = 'espera', texto, estilo }) {
  const t = TIPOS[tipo];
  return (
    <View style={[estilos.aviso, { backgroundColor: t.fundo, borderColor: t.cor }, estilo]}>
      <Text style={[estilos.avisoTexto, { color: t.cor }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  cabecalho: {
    backgroundColor: cores.azul,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  numero: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: cores.branco,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  numeroTexto: { color: cores.azul, fontWeight: 'bold', fontSize: 16 },
  cabecalhoTexto: { color: cores.branco, fontWeight: 'bold', fontSize: 18 },
  botao: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: cores.azul,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  botaoPrimario: { backgroundColor: cores.azul },
  botaoSecundario: { backgroundColor: cores.azulClaro },
  botaoTexto: { fontWeight: 'bold', fontSize: 16 },
  aviso: { borderWidth: 1, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12 },
  avisoTexto: { fontWeight: 'bold', fontSize: 14 },
});
