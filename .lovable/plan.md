## Passos Fortes — App Real (React + Lovable Cloud)

Vou construir o app completo em React/TanStack, portando seu HTML e adicionando funcionalidades reais. Dado o tamanho, entrego em uma primeira versão sólida com o essencial funcionando de verdade.

### O que entrego nesta versão

**Base & Perfil**
- Porta todo o HTML para React com design system (tokens no `styles.css`, mesma paleta ink/volt/ember, fontes Barlow Condensed + Inter + JetBrains Mono)
- Splash → Quiz de avaliação → Setup de perfil (foto + nome) → Home
- **Sem login/cadastro**: perfil salvo no Lovable Cloud (tabela `profiles` com `device_id` gerado localmente, sem auth) + backup no localStorage
- Upload de avatar real para Lovable Storage

**Passos reais (acelerômetro)**
- Usa `DeviceMotionEvent` do celular para detectar passos reais (algoritmo de picos)
- Botão "Permitir sensor" pede permissão real (iOS/Android)
- Anel de progresso atualiza ao vivo
- Persiste histórico diário no Cloud
- Página com mapa (Leaflet + OpenStreetMap, sem chave) mostrando o percurso via `navigator.geolocation.watchPosition`
- Botão "Gerar imagem do dia" que renderiza um card resumo (canvas → PNG) para compartilhar

**Notificações reais**
- `Notification.requestPermission()` do navegador (real, não simulação)
- Service Worker que dispara lembretes diários (caminhada, treino, missão)

**Tutor IA (voz real + videochamada)**
- Chat de texto com Lovable AI (streaming, `google/gemini-3-flash-preview`)
- Envio de imagem ao tutor (analisa refeição, forma de exercício, etc.)
- Chamada de voz real: STT (`openai/gpt-4o-mini-transcribe`) + resposta streaming + TTS (`openai/gpt-4o-mini-tts`) — áudio bidirecional
- Tela de "videochamada": avatar animado do tutor + seu vídeo real (`getUserMedia`) com botões de mute mic, desligar câmera, encerrar
- Tutor sabe montar plano de treino, sugerir refeições e dar dicas
- Imagem/logo do tutor gerada com imagegen

**Academia (níveis)**
- Todos os níveis destravados por XP real (missões completas + passos + treinos)
- Categorias: Força, Cardio, Mobilidade, HIIT
- Cada treino tem lista de exercícios com timer

**Idiomas (10)**
- Nova aba: Inglês, Espanhol, Francês, Alemão, Italiano, Português, Japonês, Coreano, Mandarim, Árabe
- Lições geradas pela IA sob demanda (frases, tradução, quiz)
- TTS pronuncia as frases na língua alvo

**Perfil & Config**
- Badges reais destravados por conquistas
- Tema, unidades, som, notificações

### Stack técnica

- TanStack Start (já configurado)
- Lovable Cloud (Supabase) para: `profiles`, `daily_stats`, `chat_messages`, storage de avatares/imagens
- Lovable AI Gateway para chat, STT, TTS, análise de imagem
- Web APIs reais: DeviceMotion, Geolocation, Notification, MediaDevices (mic/câmera), Web Audio
- Leaflet para mapa (open source, sem chave)
- Framer Motion para animações

### Limitações honestas

- **Passos via web**: navegadores móveis não têm ped\u00f4metro dedicado; uso acelerômetro com detecção de picos — precisão ~85-90% comparado a apps nativos. Precisa do celular no bolso/mão em movimento.
- **Notificações em segundo plano**: só funcionam quando o navegador está aberto (PWA instalada melhora isso — configuro manifest).
- **iOS**: DeviceMotion exige gesto de usuário para pedir permissão (botão dedicado).
- **Videochamada**: o "tutor" é IA — não há rosto real; mostro avatar animado que reage ao áudio + seu vídeo. Lipsync realista precisaria de serviço pago externo.

Se aprovar, começo pela base + Cloud + Home + Passos reais, depois Tutor IA com voz, depois idiomas.