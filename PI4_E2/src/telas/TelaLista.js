import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Aviso, Botao, Cabecalho } from '../componentes/Basicos';
import { apagarCadastrados, listarAtivos } from '../api/ativosApi';
import { cores } from '../tema';

/** Tela 8 — Ativos cadastrados (simula GET /api/ativos) */
export default function TelaLista({ onAbrir, onRegistrar, onVoltar }) {
  const [ativos, setAtivos] = useState(null);

  const carregar = useCallback(async () => {
    setAtivos(await listarAtivos());
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const qtdCadastrados = (ativos ?? []).filter((a) => a.origem === 'cadastrado').length;

  function confirmarApagar() {
    Alert.alert(
      'Apagar cadastros do app?',
      `Os ${qtdCadastrados} ativo(s) registrados neste celular serão apagados. Os 5 simulados continuam.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await apagarCadastrados();
            carregar();
          },
        },
      ],
    );
  }

  return (
    <View style={estilos.tela}>
      <Cabecalho numero={8} titulo="Ativos cadastrados" />
      <View style={estilos.conteudo}>
        {ativos === null ? (
          <Aviso tipo="espera" texto="Carregando..." />
        ) : (
          <FlatList
            style={{ flex: 1 }}
            data={ativos}
            keyExtractor={(a) => a.codigo}
            ListHeaderComponent={
              <Text style={estilos.resumo}>
                {ativos.length} computadores · {qtdCadastrados} registrado(s) no app
              </Text>
            }
            renderItem={({ item }) => (
              <Pressable style={({ pressed }) => [estilos.item, pressed && { opacity: 0.6 }]} onPress={() => onAbrir(item)}>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.itemCodigo}>{item.codigo}</Text>
                  <Text style={estilos.itemNome} numberOfLines={1}>{item.nome}</Text>
                  <Text style={estilos.itemLocal} numberOfLines={1}>{item.localizacao} · Pat. {item.patrimonio}</Text>
                </View>
                <View style={[estilos.selo, item.origem === 'cadastrado' ? estilos.seloNovo : null]}>
                  <Text style={[estilos.seloTexto, item.origem === 'cadastrado' && { color: cores.verde }]}>
                    {item.origem === 'cadastrado' ? 'registrado' : 'simulado'}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        )}
        <Botao titulo="Registrar novo ativo" primario onPress={onRegistrar} />
        {qtdCadastrados > 0 && <Botao titulo="Apagar ativos registrados no app" onPress={confirmarApagar} />}
        <Botao titulo="Voltar ao início" onPress={onVoltar} />
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { flex: 1, padding: 16 },
  resumo: { color: cores.apagado, fontSize: 13, marginBottom: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: cores.linha,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  itemCodigo: { fontSize: 13, fontWeight: 'bold', color: cores.azul },
  itemNome: { fontSize: 15, fontWeight: 'bold', color: cores.tinta, marginTop: 2 },
  itemLocal: { fontSize: 12, color: cores.apagado, marginTop: 2 },
  selo: { borderWidth: 1, borderColor: cores.linha, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  seloNovo: { borderColor: cores.verde, backgroundColor: cores.verdeClaro },
  seloTexto: { fontSize: 11, fontWeight: 'bold', color: cores.apagado },
});
