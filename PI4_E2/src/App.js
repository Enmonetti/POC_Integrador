import React, { useEffect, useState } from 'react';
import { BackHandler, StatusBar, View } from 'react-native';
import TelaInicio from './telas/TelaInicio';
import TelaCamera from './telas/TelaCamera';
import TelaManual from './telas/TelaManual';
import TelaResultado from './telas/TelaResultado';
import TelaErro from './telas/TelaErro';
import TelaRegistro from './telas/TelaRegistro';
import TelaAtivoQr from './telas/TelaAtivoQr';
import TelaLista from './telas/TelaLista';

/**
 * Navegação entre as telas:
 *   Consulta (docs/wireframes):
 *     1 inicio -> 2/3 camera (leitura + RA)
 *     1 inicio -> 4 manual -> 3 resultado
 *     2 / 4 -> 5 erro -> 2 ou 4
 *   Cadastro:
 *     1 inicio -> 6 registro -> 7 QR do ativo -> 8 lista
 *     1 inicio -> 8 lista -> 7 QR do ativo
 */
export default function App() {
  const [tela, setTela] = useState('inicio');
  const [ativo, setAtivo] = useState(null);
  const [ativoNovo, setAtivoNovo] = useState(false);
  const [erro, setErro] = useState(null);

  // Botão "voltar" do Android: QR do ativo volta para a lista; o resto vai ao início
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (tela === 'inicio') return false;
      setTela(tela === 'qr' && !ativoNovo ? 'lista' : 'inicio');
      return true;
    });
    return () => sub.remove();
  }, [tela, ativoNovo]);

  function mostrarErro(e) {
    setErro(e);
    setTela('erro');
  }

  function mostrarQr(a, novo) {
    setAtivo(a);
    setAtivoNovo(novo);
    setTela('qr');
  }

  const irPara = (t) => () => setTela(t);

  let conteudo;
  switch (tela) {
    case 'camera':
      conteudo = <TelaCamera onErro={mostrarErro} onDigitar={irPara('manual')} onVoltar={irPara('inicio')} />;
      break;
    case 'manual':
      conteudo = (
        <TelaManual
          onResultado={(a) => {
            setAtivo(a);
            setTela('resultado');
          }}
          onErro={mostrarErro}
          onVoltarCamera={irPara('camera')}
        />
      );
      break;
    case 'resultado':
      conteudo = <TelaResultado ativo={ativo} onNovaConsulta={irPara('inicio')} />;
      break;
    case 'erro':
      conteudo = <TelaErro erro={erro} onTentarNovamente={irPara('camera')} onDigitar={irPara('manual')} />;
      break;
    case 'registro':
      conteudo = <TelaRegistro onSalvo={(a) => mostrarQr(a, true)} onVoltar={irPara('inicio')} />;
      break;
    case 'qr':
      conteudo = (
        <TelaAtivoQr
          ativo={ativo}
          novo={ativoNovo}
          onRegistrarOutro={irPara('registro')}
          onLista={irPara('lista')}
          onInicio={irPara('inicio')}
        />
      );
      break;
    case 'lista':
      conteudo = (
        <TelaLista onAbrir={(a) => mostrarQr(a, false)} onRegistrar={irPara('registro')} onVoltar={irPara('inicio')} />
      );
      break;
    default:
      conteudo = (
        <TelaInicio
          onLerQr={irPara('camera')}
          onDigitar={irPara('manual')}
          onRegistrar={irPara('registro')}
          onLista={irPara('lista')}
        />
      );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {conteudo}
    </View>
  );
}
