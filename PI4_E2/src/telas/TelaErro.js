import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Botao, Cabecalho } from '../componentes/Basicos';
import { cores } from '../tema';

const MENSAGENS = {
  nao_encontrado: { titulo: 'Ativo não encontrado', texto: 'O código lido não está cadastrado no inventário.' },
  formato: { titulo: 'QR Code inválido', texto: 'O QR Code lido não segue o padrão ATV-000.' },
  camera: {
    titulo: 'Câmera bloqueada',
    texto: 'Libere o acesso à câmera nas configurações do celular ou use a consulta manual.',
  },
  falha: { titulo: 'Falha ao consultar', texto: 'Não foi possível consultar o ativo. Tente de novo.' },
};

/** Tela 5 — Erro. Sempre oferece duas saídas: nova leitura ou digitar o código. */
export default function TelaErro({ erro, onTentarNovamente, onDigitar }) {
  const base = MENSAGENS[erro?.tipo] ?? MENSAGENS.falha;
  const texto = erro?.mensagem ?? base.texto;

  return (
    <View style={estilos.tela}>
      <Cabecalho numero={5} titulo="Erro" />
      <View style={estilos.conteudo}>
        <View style={estilos.icone}>
          <Text style={estilos.iconeTexto}>!</Text>
        </View>
        <Text style={estilos.titulo}>{base.titulo}</Text>
        <Text style={estilos.texto}>{texto}</Text>

        <Botao titulo="Tentar ler novamente" primario onPress={onTentarNovamente} estilo={{ marginTop: 28 }} />
        <Botao titulo="Digitar código manualmente" onPress={onDigitar} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { flex: 1, padding: 20, paddingTop: 40 },
  icone: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: cores.vermelho,
    backgroundColor: cores.vermelhoClaro,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconeTexto: { fontSize: 38, fontWeight: 'bold', color: cores.vermelho },
  titulo: { fontSize: 22, fontWeight: 'bold', color: cores.vermelho, textAlign: 'center', marginTop: 18 },
  texto: { fontSize: 15, color: cores.tinta, textAlign: 'center', marginTop: 10, lineHeight: 22 },
});
