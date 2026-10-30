import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Aviso, Botao, Cabecalho } from '../componentes/Basicos';
import CartaoAtivo from '../componentes/CartaoAtivo';
import { cores } from '../tema';

/**
 * Tela 7 — QR Code do ativo.
 * Aparece logo após o cadastro (novo = true) ou ao tocar em um item da lista.
 */
export default function TelaAtivoQr({ ativo, novo, onRegistrarOutro, onLista, onInicio }) {
  return (
    <View style={estilos.tela}>
      <Cabecalho numero={7} titulo={novo ? 'Ativo registrado' : 'QR Code do ativo'} />
      <ScrollView contentContainerStyle={estilos.conteudo}>
        {novo && <Aviso tipo="sucesso" texto={`Ativo registrado: ${ativo.codigo}`} />}

        <View style={estilos.etiqueta}>
          <QRCode value={ativo.codigo} size={190} quietZone={12} backgroundColor="#FFFFFF" color="#000000" />
          <Text style={estilos.codigo}>{ativo.codigo}</Text>
          <Text style={estilos.sub}>{ativo.nome} · Pat. {ativo.patrimonio}</Text>
        </View>
        <Text style={estilos.dica}>
          Para testar a leitura: tire um print desta tela e abra no PC (ou mostre em outro celular) e leia pelo
          botão "Ler QR Code".
        </Text>

        <CartaoAtivo ativo={ativo} estilo={{ marginTop: 16 }} />

        {novo && <Botao titulo="Registrar outro ativo" primario onPress={onRegistrarOutro} />}
        <Botao titulo="Ver ativos cadastrados" onPress={onLista} primario={!novo} />
        <Botao titulo="Voltar ao início" onPress={onInicio} />
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { padding: 20, paddingBottom: 40 },
  etiqueta: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 12,
    paddingVertical: 18,
    marginTop: 14,
    backgroundColor: cores.branco,
  },
  codigo: { fontSize: 26, fontWeight: 'bold', color: cores.tinta, marginTop: 10, letterSpacing: 1 },
  sub: { fontSize: 13, color: cores.apagado, marginTop: 2 },
  dica: { fontSize: 12, color: cores.apagado, textAlign: 'center', marginTop: 10 },
});
