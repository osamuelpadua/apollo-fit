# Apolo Fit — design system mobile

## Princípios

- Mobile-first, com a ação principal alcançável pelo polegar.
- Preto quente como base, laranja apenas para marca, foco e ação.
- Listas edge-to-edge no celular; painéis com borda e elevação a partir de `sm`.
- Alvos interativos com no mínimo 44px e foco visível.
- Conteúdo continua legível com zoom; não bloquear escala do viewport.

## Tokens

Os tokens ficam em `src/app/globals.css` e alimentam Tailwind e os componentes:

- `background`: plano principal quase preto.
- `card`, `popover`, `surface`: superfícies em níveis progressivos.
- `primary`, `primary-hover`: laranja da marca.
- `muted-foreground`: texto secundário com contraste AA.
- `destructive`: remoções e erros.
- `ring`: foco visível laranja.
- `radius`: base para cantos consistentes.

## Padrões

- `.app-page`: largura e ritmo vertical de página.
- `.app-panel`: superfície elevada padrão.
- `.app-section-title`: título auxiliar em caixa alta.
- Navegação inferior: cinco destinos, 72px mais safe area.
- FAB: criação contextual no mobile; botão no cabeçalho no desktop.
- Formulários longos: grupos claros e ação fixa no rodapé.
- Diálogos de criação: bottom sheet no mobile e modal no desktop.

## Movimento e acessibilidade

- O estado ativo nunca depende apenas de animação.
- `prefers-reduced-motion` reduz animações e transições.
- Ícones decorativos usam `aria-hidden`; ações icon-only recebem `aria-label`.
- Estados vazio, offline, carregando e erro devem sempre explicar o próximo passo.

## Breakpoints de validação

- Celular: 360px, 390px e 412px.
- Tablet: 768px.
- Desktop: 1280px.
- Verificar teclado virtual, orientação retrato e modo PWA standalone.
