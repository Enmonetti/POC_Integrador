import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Aviso, Botao, Cabecalho } from '../componentes/Basicos';
import CartaoAtivo from '../componentes/CartaoAtivo';
import { buscarAtivo, normalizarCodigo } from '../api/ativosApi';
import { cores } from '../tema';

const ALTURA_CARTAO = 230; // altura aproximada do cartão, usada para posicioná-lo
const TEMPO_PERDIDO_MS = 1500; // sem ver o QR por esse tempo -> cartão vai para baixo

/**
 * Telas 2 e 3 — Leitura pela câmera e Resultado em RA.
 * Fases: 'lendo' -> 'consultando' -> 'ra'
 * Na fase 'ra' a câmera continua ligada e o cartão é desenhado SOBRE a imagem,
 * acompanhando a posição do QR Code enquanto ele estiver visível.
 */
export default function TelaCamera({ onErro, onDigitar, onVoltar }) {
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [fase, setFase] = useState('lendo');
  const [ativo, setAtivo] = useState(null);
  const [caixa, setCaixa] = useState(null); // posição do QR na imagem
  const [perdido, setPerdido] = useState(false);
  const [area, setArea] = useState({ w: 0, h: 0 });
  const travado = useRef(false);
  const ultimaVez = useRef(0);

  // Pede permissão da câmera; se for negada, vai para a tela de erro (tela 5)
  useEffect(() => {
    if (!permissao || permissao.granted) return;
    if (permissao.canAskAgain) {
      pedirPermissao().then((r) => {
        if (!r.granted) onErro({ tipo: 'camera' });
      });
    } else {
      onErro({ tipo: 'camera' });
    }
  }, [permissao?.granted]); // eslint-disable-line react-hooks/exhaustive-deps

  // Verifica se o QR saiu da imagem (para "soltar" o cartão na parte de baixo)
  useEffect(() => {
    if (fase !== 'ra') return undefined;
    const id = setInterval(() => {
      setPerdido(Date.now() - ultimaVez.current > TEMPO_PERDIDO_MS);
    }, 400);
    return () => clearInterval(id);
  }, [fase]);

  function lerCaixa(bounds) {
    const x = bounds?.origin?.x;
    const y = bounds?.origin?.y;
    const w = bounds?.size?.width;
    const h = bounds?.size?.height;
    const valido = [x, y, w, h].every((n) => typeof n === 'number' && isFinite(n));
    if (!valido || w < 10 || h < 10 || area.w === 0) return null;
    if (x < -20 || y < -20 || x + w > area.w + 20 || y + h > area.h + 20) return null;
    return { x, y, w, h };
  }

  async function aoLerCodigo({ data, bounds }) {
    // Fase RA: só atualiza a posição se for o mesmo QR do ativo exibido
    if (fase === 'ra') {
      if (ativo && normalizarCodigo(data) === ativo.codigo) {
        const agora = Date.now();
        if (agora - ultimaVez.current > 120) {
          ultimaVez.current = agora;
          setCaixa(lerCaixa(bounds));
          setPerdido(false);
        }
      }
      return;
    }

    if (travado.current) return; // evita consultar várias vezes o mesmo QR
    travado.current = true;
    // aparece no terminal do "npm start" — ajuda a ver exatamente o que foi lido
    console.log('[QR lido]', JSON.stringify(data));
    setFase('consultando');

    try {
      const resposta = await buscarAtivo(data);
      if (resposta.ok) {
        ultimaVez.current = Date.now();
        setAtivo(resposta.ativo);
        setCaixa(lerCaixa(bounds));
        setFase('ra');
      } else {
        onErro(resposta.erro);
      }
    } catch (e) {
      onErro({ tipo: 'falha' });
    }
  }

  function novaLeitura() {
    travado.current = false;
    setAtivo(null);
    setCaixa(null);
    setPerdido(false);
    setFase('lendo');
  }

  // Calcula onde o cartão aparece: logo abaixo do QR (ou acima, se não couber)
  function posicaoCartao() {
    if (!caixa || perdido) return { bottom: 12 };
    let topo = caixa.y + caixa.h + 24;
    if (topo + ALTURA_CARTAO > area.h - 8) topo = caixa.y - ALTURA_CARTAO - 24;
    topo = Math.max(8, Math.min(topo, area.h - ALTURA_CARTAO - 8));
    return { top: topo };
  }

  const aviso = {
    lendo: { tipo: 'espera', texto: 'Aguardando QR Code...' },
    consultando: { tipo: 'espera', texto: 'QR Code lido. Consultando...' },
    ra: { tipo: 'sucesso', texto: `Ativo encontrado: ${ativo?.codigo ?? ''}` },
  }[fase];

  const titulo = fase === 'ra' ? 'Resultado em RA' : 'Leitura pela câmera';

  return (
    <View style={estilos.tela}>
      <Cabecalho numero={fase === 'ra' ? 3 : 2} titulo={titulo} />
      <View style={estilos.conteudo}>
        <Aviso tipo={aviso.tipo} texto={aviso.texto} />

        <View
          style={estilos.areaCamera}
          onLayout={(e) => setArea({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        >
          {permissao?.granted ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={aoLerCodigo}
            />
          ) : (
            <View style={estilos.semCamera}>
              <Text style={estilos.semCameraTexto}>Aguardando permissão da câmera...</Text>
            </View>
          )}

          {/* Mira (fase de leitura) */}
          {fase !== 'ra' && (
            <View style={estilos.mira} pointerEvents="none">
              <View style={[estilos.cantoMira, { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5 }]} />
              <View style={[estilos.cantoMira, { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5 }]} />
              <View style={[estilos.cantoMira, { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5 }]} />
              <View style={[estilos.cantoMira, { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5 }]} />
            </View>
          )}
          {fase === 'lendo' && (
            <Text style={estilos.instrucao}>Centralize o QR Code na mira — a leitura é automática</Text>
          )}

          {/* Realidade aumentada: moldura no QR + cartão sobre a imagem */}
          {fase === 'ra' && ativo && (
            <>
              {caixa && !perdido && (
                <>
                  <View
                    pointerEvents="none"
                    style={[estilos.moldura, { left: caixa.x - 6, top: caixa.y - 6, width: caixa.w + 12, height: caixa.h + 12 }]}
                  />
                  <View pointerEvents="none" style={[estilos.ligacao, ligacaoEstilo(caixa, posicaoCartao())]} />
                </>
              )}
              <CartaoAtivo ativo={ativo} estilo={[estilos.cartaoRa, posicaoCartao()]} />
              {(perdido || !caixa) && (
                <Text style={estilos.instrucaoTopo}>
                  {perdido ? 'QR Code fora da imagem — aponte de novo para reposicionar' : 'Cartão fixo: posição do QR indisponível'}
                </Text>
              )}
            </>
          )}
        </View>

        {fase === 'ra' ? (
          <Botao titulo="Nova consulta" primario onPress={novaLeitura} />
        ) : (
          <>
            <Botao titulo="Digitar código manualmente" onPress={onDigitar} />
            <Botao titulo="Voltar" onPress={onVoltar} />
          </>
        )}
        {fase === 'ra' && <Botao titulo="Voltar ao início" onPress={onVoltar} />}
      </View>
    </View>
  );
}

/** Linha verde que liga o QR Code ao cartão. */
function ligacaoEstilo(caixa, pos) {
  const centroX = caixa.x + caixa.w / 2;
  if (pos.top === undefined) return { display: 'none' };
  const abaixo = pos.top > caixa.y;
  const inicio = abaixo ? caixa.y + caixa.h + 6 : pos.top + ALTURA_CARTAO;
  const fim = abaixo ? pos.top : caixa.y - 6;
  return { left: centroX - 1, top: Math.min(inicio, fim), height: Math.max(0, Math.abs(fim - inicio)) };
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.branco },
  conteudo: { flex: 1, padding: 16 },
  areaCamera: {
    flex: 1,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: cores.camera,
  },
  semCamera: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  semCameraTexto: { color: cores.branco },
  mira: {
    position: 'absolute',
    width: 220,
    height: 220,
    alignSelf: 'center',
    top: '50%',
    marginTop: -110,
  },
  cantoMira: { position: 'absolute', width: 40, height: 40, borderColor: cores.azulClaro },
  instrucao: {
    position: 'absolute',
    bottom: 14,
    left: 12,
    right: 12,
    textAlign: 'center',
    color: cores.branco,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 8,
    borderRadius: 8,
  },
  instrucaoTopo: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    textAlign: 'center',
    color: cores.branco,
    fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: 6,
    borderRadius: 8,
  },
  moldura: { position: 'absolute', borderWidth: 3, borderColor: '#22C55E', borderRadius: 6 },
  ligacao: { position: 'absolute', width: 2, backgroundColor: '#22C55E' },
  cartaoRa: { position: 'absolute', left: 12, right: 12 },
});
