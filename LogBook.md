# 📖 Logbook de Desenvolvimento — VibeHunt

Registo cronológico de planeamento, decisões técnicas, desenvolvimento de ecrãs e correção de bugs do projeto VibeHunt.

---

## 🗓️ Dia 20 de Março
**Foco:** Planeamento de Arquitetura, Definição de Stack e Estrutura Inicial.

### ✅ Decisões e Definições Técnicas
* **Conceito do Projeto:** Aplicação móvel personalizada para divulgação de eventos.
* **Nível do Programador:** Iniciante (foco em velocidade de desenvolvimento e facilidade de aprendizagem).
* **Stack Tecnológica Recomendada:**
  * **Frontend Mobile:** React Native com Expo (Base de código única para iOS e Android).
  * **Backend & Base de Dados:** Supabase (PostgreSQL, Autenticação e Storage).
  * **Mapas:** Mapbox ou Google Maps API.
  * **Pagamentos:** Stripe.
  * **Notificações:** Expo Push Notifications.

### 🛠️ Tarefas e Funcionalidades Desenvolvidas
* **Configuração do Ambiente:** Identificação das ferramentas locais instaladas (VSCode e Git).
* **Desenho da Interface Base (Menu Expositivo):**
  * Criação da Página Principal (`HomeScreen`).
  * Implementação da barra de navegação inferior (`Tab Bar`) com 4 ícones: Início, Mapa, Alertas, Perfil.
  * Mapeamento do gesto de *Swipe* (deslizar da direita para a esquerda) na `HomeScreen` para aceder à caixa de mensagens.

---

## 🗓️ Dia 21 de Março
**Foco:** UI/UX Dinâmica, Sistema de Onboarding, Animações e Gamificação.

### 🛠️ Tarefas e Funcionalidades Desenvolvidas
* **Melhoria Visual e Dinâmica:** Transição de uma app estática para uma app com animações de Onboarding e transições fluidas.
* **Fluxo do utilizador por Ecrã:**
  * `WelcomeAnimationScreen`:
    * Substituição do nome estático "Caçador" pelo nome real introduzido pelo utilizador.
    * Criação da animação da barra de XP (de 0 a 100 XP).
    * Suavização da transição de saída ao clicar em "Explorar o VibeHunt" (maior duração).
  * `Fluxo de Bloqueio (Modal/Overlay)`:
    * Remoção do botão "Ir para o Perfil".
    * Criação de bloqueio de ecrã (`pointerEvents="box-only"`), obrigando o utilizador a clicar no ícone do Perfil para avançar.
  * `ProfileSetupScreen`:
    * Esconder a barra de navegação inferior (`Tab Bar`) para libertar espaço para o botão de submissão.
    * Lógica de persistência de dados (campos pré-preenchidos ao re-editar).
    * Submissão dinâmica e reencaminhamento para o `ProfileScreen`.
  * `ProfileScreen`:
    * Apresentação do nome dinâmico do utilizador.
    * Redirecionamento do botão "Editar" de volta para o Setup.
* **Melhoria de UI nos Componentes:**
    * Remoção da Bio no cabeçalho do `ProfileScreen` (apenas a Cidade é visível por baixo do nome).
    * Saudação dinâmica na `HomeScreen` no canto superior esquerdo: `"Olá, [Nome]"`.

### 🐛 Resolução de Bugs e Otimizações
* **Ajuste no `ProfileCoachOverlay`:** Correção do alinhamento do `TouchableOpacity` transparente sobre o ícone real do perfil na Tab Bar.
* **Correção no `EditButtonCoach`:** Correção de lógica para garantir que a navegação para o `ProfileScreen` ocorre antes de ativar o anel pulsante de "Editar".
* **Atalho de Debug:** Criação de um atalho no código para saltar o onboarding durante testes de desenvolvimento.

---

## 🗓️ Dia 23 de Março
**Foco:** Resolução de Bugs Críticos, Sistema de Temas e Padronização de Desenvolvimento (Git & Documentação).

### 📖 Padronização e Documentação (Novas Diretrizes)
* **Implementação das Diretrizes Oficiais de Commits Git:**
  * Criação de um padrão baseado em *Conventional Commits*: `tipo(escopo): [ID_Tarefa.SubTarefa] Descrição`.
  * Definição de regras para tarefas complexas multificheiros (uso de ponto decimal para micro-commits sequenciais).
* **Implementação do Logbook Oficial (`LOGBOOK.md`):**
  * Criação do documento de histórico de desenvolvimento para rastrear decisões e evolução diária do projeto VibeHunt.

### 🐛 Resolução de Bugs e Otimizações (Estabilidade e Plataformas)
* **Correção de Layout Thrashing / Infinite Re-render:**
  * Estabilização da `ProfileScreen` e da `HomeScreen` (resolvido o bug visual de a tela saltar de cima para baixo sem intervenção do utilizador).
* **Gesto de Swipe na `HomeScreen`:**
  * Correção da divisão de ecrã. A Home passa a ocupar 100% e as mensagens ficam escondidas à direita, acessíveis por gesto lateral.
* **Correção de Renderização Web (Comando "w"):**
  * Diagnóstico do bloqueio de scroll vertical estático. Adicionado `<ScrollView>` ou ajuste de `flex` para rolagem fluida.
* **Correção de Tela Preta no iOS (iPhone - Expo Go):**
  * Correção da leitura de variáveis de estado nulas/indefinidas no arranque que faziam o ecrã renderizar vazio.

### ✨ Novas Funcionalidades (Features)
* **Sistema de Pré-visualização com Confirmação para Temas (Claro/Escuro):**
  * Mudança imediata do tema em background ao clicar (Preview temporário).
  * Renderização condicional do botão "Confirmar" (apenas se o tema selecionado for diferente do atual).
  * Gravação definitiva na memória local (ex: `AsyncStorage`) apenas após a confirmação. Reversão do tema se o utilizador sair sem confirmar.

  ---

  ## 🗓️ Dia 25 de Março
**Foco:** Resolução de Erros de Compilação (Metro Bundler), Padronização de Ficheiros (*Case-Sensitivity*) e Arquitetura Multiplataforma (Mobile vs Web).

### 📖 Padronização e Arquitetura de Ficheiros
* **Separação de Código por Plataforma (Extensão `.web.js`):**
  * Criação do ficheiro `MapScreen.web.js` para renderizar um ecrã alternativo (*fallback*) no browser do PC.
  * Isolamento do código nativo do telemóvel no `MapScreen.js` tradicional, permitindo que a aplicação compile no PC sem erros do Webpack.
* **Configuração de Sensibilidade a Maiúsculas (*Case-Sensitivity* no Mac):**
  * Diagnóstico de conflitos entre o Git e o macOS no registo de ficheiros alterados (ex: `AuthScreen.js` vs `Authscreen.js`).
  * Utilização do comando `git add .` para forçar o rastreio correto de ficheiros modificados e recomendação do `git config core.ignorecase false`.

### 🐛 Resolução de Bugs e Otimizações (Estabilidade e Módulos)
* **Remoção de Módulos Nativos Incompatíveis:**
  * Remoção do plugin `react-native-maps` do `app.json` que estava a quebrar a inicialização global do Expo.
* **Correção de Erros de Módulos Não Resolvidos (*Unable to resolve module*):**
  * Correção de caminhos relativos de importação que apontavam para pastas erradas (níveis de pastas `../` a mais ou a menos).
  * Correção de nomes de ficheiros importados com letras maiúsculas/minúsculas inconsistentes (ex: `Eventservice.js` vs `EventService.js`).
* **Resolução de Erros de Sintaxe e Imports Duplicados:**
  * Limpeza de imports duplicados no topo do `MapScreen.js` que geravam o erro `Identifier 'View' has already been declared`.
  * Correção de erros de chavetas JSX `{}` duplicadas no bloco de renderização condicional do Mapa.