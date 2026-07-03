// ============================================================
//  Edge Function: admin-users
//  Gerencia usuários (listar/criar/editar/excluir) com segurança.
//  A service_role NUNCA vai para o front — fica só aqui, no servidor.
//  Autoriza apenas quem estiver na tabela public.admins.
//
//  Deploy (Supabase CLI):
//    supabase functions deploy admin-users
//  As variáveis SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
//  já são injetadas automaticamente no ambiente da função.
// ============================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') || '';

    // Identifica quem chamou (usando o token do próprio usuário)
    const caller = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: uerr } = await caller.auth.getUser();
    if (uerr || !user) return json({ error: 'Não autenticado.' }, 401);

    // Cliente admin (service_role) — bypassa RLS
    const admin = createClient(url, service, { auth: { autoRefreshToken: false, persistSession: false } });

    // Autoriza: e-mail precisa estar em public.admins
    const { data: adm } = await admin.from('admins').select('email').eq('email', user.email).maybeSingle();
    if (!adm) return json({ error: 'Acesso restrito a administradores.' }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body.action;

    if (action === 'list') {
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      if (error) throw error;
      const users = data.users.map((u) => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
      }));
      return json({ users });
    }

    if (action === 'create') {
      if (!body.email || !body.password) return json({ error: 'Informe e-mail e senha.' });
      if (String(body.password).length < 6) return json({ error: 'A senha deve ter ao menos 6 caracteres.' });
      const { data, error } = await admin.auth.admin.createUser({
        email: body.email, password: body.password, email_confirm: true,
      });
      if (error) return json({ error: error.message });
      return json({ ok: true, id: data.user?.id });
    }

    if (action === 'update') {
      if (!body.id) return json({ error: 'ID do usuário ausente.' });
      const attrs: Record<string, unknown> = {};
      if (body.email) attrs.email = body.email;
      if (body.password) {
        if (String(body.password).length < 6) return json({ error: 'A senha deve ter ao menos 6 caracteres.' });
        attrs.password = body.password;
      }
      if (Object.keys(attrs).length === 0) return json({ error: 'Nada para atualizar.' });
      const { error } = await admin.auth.admin.updateUserById(body.id, attrs);
      if (error) return json({ error: error.message });
      return json({ ok: true });
    }

    if (action === 'delete') {
      if (!body.id) return json({ error: 'ID do usuário ausente.' });
      if (body.id === user.id) return json({ error: 'Você não pode excluir o próprio usuário.' });
      const { error } = await admin.auth.admin.deleteUser(body.id);
      if (error) return json({ error: error.message });
      return json({ ok: true });
    }

    return json({ error: 'Ação inválida.' });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
