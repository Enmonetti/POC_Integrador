import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../tema';

const COR_STATUS = {
  'Em uso': cores.verde,
  'Em manutenção': cores.ambar,
  'Disponível': cores.azul,
};

/**
 * Cartão com as informações do computador.
 * Usado sobre a imagem da câmera (RA) e também no resultado da consulta manual.
 */
export default function CartaoAtivo({ ativo, estilo }) {
  // processador/memória/armazenamento/sistema são opcionais no cadastro
  const config = [ativo.processador, ativo.memoria, ativo.armazenamento].filter(Boolean).join(' · ');
  const linhas = [
    ['Código', ativo.codigo],
    ['Patrimônio', ativo.patrimonio],
    ['Local', ativo.localizacao],
    ['Config.', config || 'Não informada'],
  ];
  const subtitulo = [ativo.tipo, ativo.sistema].filter(Boolean).join(' · ');
  const corStatus = COR_STATUS[ativo.status] ?? cores.apagado;

  return (
    <View style={[estilos.cartao, estilo]}>
      <View style={estilos.topo}>
        <Text style={estilos.nome} numberOfLines={1}>{ativo.nome}</Text>
        <View style={[estilos.status, { borderColor: corStatus }]}>
          <Text style={[estilos.statusTexto, { color: corStatus }]}>{ativo.status}</Text>
        </View>
      </View>
      <Text style={estilos.tipo}>{subtitulo}</Text>
      {linhas.map(([rotulo, valor], i) => (
        <View key={rotulo} style={[estilos.linha, i === linhas.length - 1 && { borderBottomWidth: 0 }]}>
          <Text style={estilos.rotulo}>{rotulo}</Text>
          <Text style={estilos.valor}>{valor}</Text>
        </View>
      ))}
    </View>
  );
}

const estilos = StyleSheet.create({
  cartao: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: cores.verde,
    padding: 14,
  },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nome: { fontSize: 17, fontWeight: 'bold', color: cores.tinta, flexShrink: 1, marginRight: 8 },
  status: { borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  statusTexto: { fontSize: 12, fontWeight: 'bold' },
  tipo: { color: cores.apagado, fontSize: 12, marginTop: 2, marginBottom: 6 },
  linha: {
    flexDirection: 'row',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  rotulo: { width: 88, color: cores.apagado, fontSize: 13 },
  valor: { flex: 1, color: cores.tinta, fontSize: 14, fontWeight: 'bold' },
});
