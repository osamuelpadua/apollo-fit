# Publicação e configuração

## Banco e segurança

O código do portal depende da migração:

`supabase/migrations/20260724191436_secure_roles_and_portal.sql`

Depois de vincular a CLI ao projeto correto:

```powershell
npx.cmd supabase link --project-ref xkdoxyswcycwolagqtgj
npx.cmd supabase db push
```

A migração remove a escolha de papel por `raw_user_meta_data`, impede alteração
de `role` e `portal_user_id` pelo cliente e reforça propriedade nas políticas RLS.

## Supabase Auth e SMTP

No painel do Supabase:

1. Em **Authentication > URL Configuration**, definir a URL pública em `Site URL`.
2. Adicionar `https://SEU-DOMINIO/api/auth/callback` às URLs de redirecionamento.
3. Em **Authentication > SMTP Settings**, ativar SMTP próprio e validar remetente.
4. Personalizar os e-mails de convite e recuperação com a identidade Apolo Fit.
5. Fazer um convite real e verificar recebimento, definição de senha e login.

O reenvio de acesso usa o fluxo seguro de recuperação de senha. A revogação
remove o vínculo imediatamente e exclui a conta de autenticação do aluno.

## Variáveis

Copiar as chaves descritas em `.env.local.example` para o provedor de hospedagem.
`SUPABASE_SERVICE_ROLE_KEY` e `CRON_SECRET` são segredos exclusivos do servidor.

O cron de keep-alive é mitigação do plano Free; garantia contra pausa exige plano
do Supabase que não pause projetos por inatividade.

## PWA

Após publicar em HTTPS:

1. Abrir no Chrome Android e autenticar.
2. Instalar pelo convite contextual ou pelo menu de perfil.
3. Confirmar abertura sem barra do navegador e orientação retrato.
4. Desativar a rede: uma navegação nova deve mostrar `/offline`.
5. Confirmar no DevTools que Cache Storage contém apenas shell público e ícones.
6. Executar Lighthouse para PWA e acessibilidade no endereço de produção.

O service worker nunca salva páginas autenticadas, `/api`, respostas Supabase ou
dados pessoais.
