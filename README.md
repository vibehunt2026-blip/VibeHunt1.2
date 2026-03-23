# VibeHunt — Setup Guide

## Pré-requisitos

Antes de começar, instala o seguinte:

1. **Node.js** (versão 18 ou superior) → https://nodejs.org
2. **Expo Go** no teu telemóvel (App Store ou Google Play)
3. O VSCode que já tens ✓

---

## Instalação (5 minutos)

### 1. Abre o terminal no VSCode
`Terminal > New Terminal`

### 2. Vai à pasta do projeto
```bash
cd caminho/para/vibehunt
```

### 3. Instala as dependências
```bash
npm install
```

### 4. Corre a app
```bash
npx expo start
```

Vai aparecer um **QR code** no terminal.

### 5. Testa no telemóvel
- **Android**: Abre o Expo Go → Scan QR Code
- **iPhone**: Abre a câmara → aponta para o QR code

---

## Estrutura do Projeto

```
vibehunt/
├── App.js                        # Ponto de entrada
├── package.json                  # Dependências
├── src/
│   ├── theme/
│   │   └── colors.js             # Todas as cores e espaçamentos
│   ├── data/
│   │   └── mockData.js           # Dados de demonstração
│   ├── components/
│   │   └── EventCard.js          # Cartões de eventos (3 variantes)
│   ├── screens/
│   │   ├── HomeScreen.js         # Início + swipe → Mensagens
│   │   ├── MapScreen.js          # Mapa de eventos
│   │   ├── AlertsScreen.js       # Notificações e alertas
│   │   └── ProfileScreen.js      # Perfil do utilizador
│   └── navigation/
│       └── MainNavigator.js      # Bottom tab navigation
```

---

## Funcionalidades Implementadas

### 🏠 Início
- Saudação personalizada com XP
- Barra de pesquisa com filtros rápidos
- "Amigos a caçar" — avatares de amigos em eventos ao vivo
- Evento em destaque — cartão grande com imagem
- "Perto de Ti" — scroll horizontal de eventos
- "Sugerido para Ti" — lista vertical

### 💬 Mensagens (desliza da direita para a esquerda em "Início")
- Lista de conversas com badges de não lidos
- Grupos e conversas individuais
- Indicadores de online

### 🗺️ Mapa
- Mapa visual com pins de eventos
- Filtros por categoria
- Preview do evento selecionado

### 🔔 Alertas
- Tipos: eventos, amigos, badges, XP, sugestões
- Marcação de lidos / não lidos
- Filtros por categoria

### 👤 Perfil
- Avatar com ring de nível
- Barra de XP
- Estatísticas (eventos, amigos, badges)
- Galeria de badges
- Banner Premium+
- Histórico de atividade
- Definições

---

## Personalização Rápida

### Mudar cores
Edita `src/theme/colors.js`

### Mudar dados de demo
Edita `src/data/mockData.js` — os eventos, amigos, mensagens e alertas estão todos aqui

### Mudar o nome do utilizador
Em `mockData.js`, altera o objeto `mockUser`

---

## Próximos Passos

1. Substituir `mockData.js` por chamadas reais à API (Supabase)
2. Adicionar `react-native-maps` para o mapa real
3. Implementar autenticação com `supabase-js`
4. Adicionar animações com `react-native-reanimated`

---

## Problemas Comuns

**"Cannot find module..."**
→ Corre `npm install` novamente

**App não aparece no Expo Go**
→ Verifica que o telemóvel e o computador estão na mesma rede Wi-Fi

**Erro de versão do Node**
→ Instala Node.js 18+ de nodejs.org
