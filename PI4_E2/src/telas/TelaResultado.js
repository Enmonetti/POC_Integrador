import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Aviso, Botao, Cabecalho } from '../componentes/Basicos';
import CartaoAtivo from '../componentes/CartaoAtivo';
import { cores } from '../tema';

/** Tela 3 (via consulta manual) — mesmo cartão do resultado em RA, sem a câmera. */
export default function TelaResultado({ ativo, onNovaConsulta }) {
  return (
    <View style={estilos.tela}>
      <Cabecalho numero={3} titulo="Resultado" />
      <View style={estilos.conteudo}>
        <Aviso tipo="sucesso" texto={`Ativo encontrado: ${ativo.codigo}`} />
        <CartaoAtivo ativo={ativo} estilo={{ marginTop: 16 }} />
        <Text style={estilos.nota}>Consulta manual: resultado exibido sem a imagem da câmera.</Text>
        <View style={{ flex: 1 }} />
        <Botao titulo="Nova consulta" primario onPress={onNovaConsulta} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { flex: 1, padding: 20 },
  nota: { color: cores.apagado, fontSize: 13, textAlign: 'center', marginTop: 12 },
});
