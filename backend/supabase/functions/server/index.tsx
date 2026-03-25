import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const app = new Hono();

app.use("*", logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Cliente con SERVICE ROLE (solo para backend)
const getDB = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

// Health check
app.get("/make-server-909f1384/health", (c) =>
  c.json({ status: "ok" }),
);

// ─── REGISTRO ─────────────────────────────────────────
app.post("/make-server-909f1384/auth/registrar", async (c) => {
  const { nombre, correo, password, tipo } = await c.req.json();
  const db = getDB();

  // 1. Crear usuario en Supabase Auth (envía email de verificación automáticamente)
  const { data: authData, error: authError } =
    await db.auth.admin.createUser({
      email: correo,
      password: password,
      email_confirm: false, // exige verificación
      user_metadata: { nombre, tipo },
    });

  if (authError)
    return c.json({ error: authError.message }, 400);

  // 2. Guardar datos extra en tabla usuarios
  const { error: dbError } = await db.from("usuarios").insert({
    id_usuario: authData.user.id,
    nombre,
    correo,
    password,
    tipo,
  });

  if (dbError) return c.json({ error: dbError.message }, 400);

  return c.json(
    {
      ok: true,
      mensaje: "Revisa tu correo para verificar tu cuenta",
    },
    201,
  );
});

// ─── LOGIN ────────────────────────────────────────────
app.post("/make-server-909f1384/auth/login", async (c) => {
  const { correo, password } = await c.req.json();

  // Usamos anon key para login
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50eHpwZWFyeXB4cnVkZHZzY2l2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3OTgyMjEsImV4cCI6MjA4OTM3NDIyMX0.oqxYSosdxvpa949h2CwpK_0GbbeP8jB6VYgzLTqsCv8",
  );

  const { data, error } = await db.auth.signInWithPassword({
    email: correo,
    password: password,
  });

  if (error) return c.json({ error: error.message }, 401);

  return c.json({
    ok: true,
    usuario: data.user,
    session: data.session,
  });
});

// ─── PUBLICACIONES ────────────────────────────────────
app.get("/make-server-909f1384/publicaciones", async (c) => {
  const { data, error } = await getDB()
    .from("publicaciones")
    .select(
      `*, usuarios(nombre), tipos_botella(nombre), ubicaciones(nombre)`,
    );

  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

app.post("/make-server-909f1384/publicaciones", async (c) => {
  const body = await c.req.json();
  const { data, error } = await getDB()
    .from("publicaciones")
    .insert(body)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 400);
  return c.json({ ok: true, publicacion: data }, 201);
});

// ─── TIPOS BOTELLA ────────────────────────────────────
app.get("/make-server-909f1384/tipos-botella", async (c) => {
  const { data, error } = await getDB()
    .from("tipos_botella")
    .select();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

// ─── UBICACIONES ──────────────────────────────────────
app.get("/make-server-909f1384/ubicaciones", async (c) => {
  const { data, error } = await getDB()
    .from("ubicaciones")
    .select();
  if (error) return c.json({ error: error.message }, 400);
  return c.json(data);
});

Deno.serve(app.fetch);