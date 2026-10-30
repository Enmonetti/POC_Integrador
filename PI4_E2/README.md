# PI4_E2 — Inventário de Computadores por QR Code (PoC com RA)

**Escola e Faculdade de Tecnologia SENAI "Roberto Mange"** — Projeto Integrador IV, 4º semestre
**Etapa:** Entrega E2 — Projeto técnico · **Prazo:** 24/09/2026

## 1. Projeto, integrantes e objetivo

| Integrante | Participação |
|---|---|
| Murilo Andrey Muloque Gama | _preencher_ |
| _nome_ | _preencher_ |
| _nome_ | _preencher_ |

**Objetivo da PoC:** um app de celular que lê o QR Code colado em um computador, identifica o ativo no inventário e mostra suas informações **sobre a imagem da câmera** (realidade aumentada). Quando a câmera não estiver disponível, o usuário pode digitar o código manualmente. O app também permite **registrar novos computadores**: o código `ATV-000` é gerado automaticamente e o app exibe o QR Code da etiqueta.

## 2. Tecnologias e versões

| Tecnologia | Versão | Uso |
|---|---|---|
| Node.js | 20 LTS ou mais novo | Executar as ferramentas do Expo no computador |
| Expo (React Native) | SDK mais recente (`expo@latest`) | Framework do app mobile |
| expo-camera | compatível com o SDK (instalada pelo `expo install`) | Câmera e leitura de QR Code |
| @react-native-async-storage/async-storage | compatível com o SDK | Salvar no celular os ativos registrados |
| react-native-svg + react-native-qrcode-svg | compatível com o SDK | Desenhar o QR Code do ativo registrado |
| Expo Go | versão atual da loja | App no celular para abrir o projeto |
| Python + Pillow + reportlab | opcional | Só para regerar os QR Codes |

> As versões exatas ficam registradas em `package.json` / `package-lock.json` depois da instalação.

## 3. Pré-requisitos e instalação (Windows)

1. Instale o **Node.js LTS**: <https://nodejs.org> (deixe marcadas as opções padrão).
2. No celular, instale o app **Expo Go** (Play Store ou App Store).
3. Baixe o repositório e abra a pasta no **Prompt de Comando (cmd)** ou no terminal do VS Code:
   ```
   git clone <link-do-repositorio>
   cd PI4_E2
   ```
4. Instale as dependências (um comando só):
   ```
   npm run setup
   ```
   Ele executa `npm install` e depois `npx expo install ...` com as bibliotecas do app (câmera, armazenamento e QR Code), escolhendo as versões compatíveis com o SDK instalado.

   > Já tinha rodado o setup numa versão anterior? Rode `npm run setup` **de novo** para instalar as bibliotecas novas.

> **PowerShell bloqueando o `npm`/`npx`** ("a execução de scripts foi desabilitada")? Use o **cmd** em vez do PowerShell, ou rode uma vez: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

## 4. Como executar

```
npm start
```

1. Vai aparecer um **QR Code no terminal** (esse é do Expo, não é o marcador do ativo).
2. **Android:** abra o Expo Go e toque em *Scan QR code*. **iPhone:** aponte a câmera nativa para o QR do terminal.
3. O app abre no celular na tela **1 — Início**. Na primeira leitura, permita o acesso à câmera.

Celular e computador precisam estar **na mesma rede Wi-Fi**. Se o Windows perguntar sobre o Firewall, permita o Node.js em redes privadas. Se mesmo assim não conectar (rede da faculdade costuma bloquear), use:
```
npm run start:tunnel
```

## 5. Como usar o marcador e o resultado esperado

Os QR Codes de teste estão em [`marcador/`](marcador/) (PNG de cada um e [`etiquetas.pdf`](marcador/etiquetas.pdf) para imprimir). Dá para abrir a imagem na tela do computador e apontar o celular para ela.

| Marcador | Conteúdo do QR | Resultado esperado |
|---|---|---|
| `ATV-001.png` | `ATV-001` | Cartão sobre a câmera: **Dell OptiPlex 3080**, patrimônio **1025**, **Lab. 3 - Sala 12**, status **Em uso**, configuração |
| `ATV-002.png` … `ATV-005.png` | `ATV-002` … `ATV-005` | Cartão com os dados do computador correspondente |
| `teste-nao-encontrado.png` | `ATV-999` | Tela 5: **Ativo não encontrado** |
| `teste-invalido.png` | `TESTE-INVALIDO` | Tela 5: **QR Code inválido** |

**Roteiro de teste (reproduz os critérios de aceite):**

1. Tela 1 → **Ler QR Code** → o app pede e abre a câmera (tela 2, "Aguardando QR Code...").
2. Aponte para `ATV-001.png` → aparece "Consultando..." e depois **"Ativo encontrado: ATV-001"**.
3. Tela 3 (RA): uma moldura verde marca o QR e o cartão com os dados aparece sobre a imagem, acompanhando o QR quando você move o celular.
4. **Nova consulta** → aponte para `teste-nao-encontrado.png` → tela de erro com as opções *Tentar ler novamente* e *Digitar código manualmente*.
5. **Digitar código manualmente** → digite `ATV-003` → **Consultar** → cartão do HP ProDesk (sem câmera). Digite `ABC` → aviso **"Formato inválido"**.

**Roteiro de teste do cadastro:**

1. Tela 1 → **Registrar ativo** (tela 6). O topo mostra o código que será gerado (ex.: `ATV-006`).
2. Toque em **Salvar ativo** com os campos vazios → os campos obrigatórios ficam em vermelho com a mensagem do erro.
3. Preencha nome, patrimônio (só números, ex.: `2001`) e localização → **Salvar ativo** → tela 7 com **"Ativo registrado: ATV-006"** e o QR Code da etiqueta.
4. Tente cadastrar outro com o patrimônio `1025` → erro **"Já existe um ativo com o patrimônio 1025"**.
5. Tire um print do QR da tela 7, abra no PC e leia pelo **Ler QR Code** → o ativo novo aparece em RA. (Ou consulte `ATV-006` pela consulta manual.)
6. **Ver ativos** (tela 8) lista os 5 simulados + os registrados; tocar em um item mostra o QR Code dele.

## 6. Dados simulados

Todos os dados são **fictícios**. Os 5 computadores de exemplo estão em [`dados/ativos.json`](dados/ativos.json); os computadores registrados pelo app ficam salvos **no próprio celular** (AsyncStorage) e podem ser apagados na tela 8. Não há banco de dados nem servidor: as funções de [`src/api/ativosApi.js`](src/api/ativosApi.js) **simulam** a API, inclusive o atraso de rede e as respostas HTTP:

| Função | Rota simulada | Respostas |
|---|---|---|
| `buscarAtivo(codigo)` | `GET /api/ativos/{codigo}` | 200, 400 (formato), 404 |
| `listarAtivos()` | `GET /api/ativos` | 200 |
| `cadastrarAtivo(dados)` | `POST /api/ativos` | 201, 400 (campos inválidos), 409 (patrimônio repetido) |

Nenhum dado pessoal real é usado.

## 7. Documentação técnica

| Item | Arquivo |
|---|---|
| 3.1 Arquitetura | `docs/arquitetura.png` / `docs/arquitetura.md` — _a fazer_ |
| 3.2 Modelo de dados | `docs/modelo-dados.md` — _a fazer_ |
| 3.3 Contrato da API | `docs/api.md` — _a fazer_ |
| 3.4 Wireframes e UX | [`docs/wireframes/wireframes.md`](docs/wireframes/wireframes.md) |
| 3.5 Segurança | `docs/seguranca.md` — _a fazer_ |

## 8. Estrutura do repositório

```
PI4_E2/
├── README.md
├── package.json, app.json, index.js   configuração do app Expo
├── src/                    código-fonte
│   ├── App.js              navegação entre as telas
│   ├── api/ativosApi.js    API simulada (consulta, listagem e cadastro)
│   ├── componentes/        botões, avisos e cartão do ativo
│   └── telas/              Início, Câmera/RA, Manual, Resultado, Erro,
│                           Registro, QR do ativo, Lista
├── dados/ativos.json       dados simulados
├── marcador/               QR Codes de teste + gerador
├── docs/wireframes/        wireframes (3.4)
└── evidencias/             capturas de tela / vídeo
```

## 9. O que funciona e limitações conhecidas

**Funciona:** abertura da câmera com pedido de permissão; leitura automática de QR Code; identificação do ativo; cartão com 6 informações sobre a imagem da câmera, acompanhando a posição do QR; consulta manual com validação de formato; telas de erro para código inexistente, QR fora do padrão e câmera negada; registro de novos computadores com validação dos campos, código gerado automaticamente, QR Code da etiqueta e lista de ativos.

**Limitações / ainda não integrado:**
- Os dados vêm de um arquivo JSON dentro do app e os registros ficam só no celular que os cadastrou; ainda não existe API nem banco reais.
- Não é possível editar ou excluir um ativo individualmente (só apagar todos os registrados no app).
- A RA é 2D: o cartão é posicionado pela caixa do QR detectada pela câmera. Em alguns aparelhos Android essa posição não é informada com precisão; nesse caso o cartão fica fixo na parte inferior da imagem.
- Sem login ou controle de acesso nesta versão.
- Feito para rodar pelo Expo Go; não foi gerado APK/IPA (publicação não é exigida nesta sprint).
