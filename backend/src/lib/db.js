import postgres from "postgres";
import { config } from "../config.js";

const sql = config.databaseUrl
  ? postgres(config.databaseUrl, {
      max: 1,
      prepare: false,
      ssl: "require"
    })
  : null;

let initialized = false;

export async function initializeDatabase() {
  if (!sql || initialized) return false;

  await sql`
    create table if not exists shopify_orders (
      order_id text primary key,
      paid boolean not null default false,
      product_matched boolean not null default false,
      email text not null default '',
      report_payload jsonb,
      session_token text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  await sql`alter table shopify_orders add column if not exists report_payload jsonb`;
  await sql`alter table shopify_orders add column if not exists session_token text`;

  await sql`
    create table if not exists purchase_sessions (
      token text primary key,
      report_payload jsonb not null,
      created_at timestamptz not null default now(),
      expires_at timestamptz not null
    )
  `;

  initialized = true;
  return true;
}

export async function createPurchaseSession(token, reportPayload, expiresAt) {
  if (!sql) return false;
  await initializeDatabase();
  await sql`
    insert into purchase_sessions (token, report_payload, expires_at)
    values (${token}, ${reportPayload}, ${expiresAt})
    on conflict (token) do update set
      report_payload = excluded.report_payload,
      expires_at = excluded.expires_at
  `;
  return true;
}

export async function findPurchaseSession(token) {
  if (!sql) return null;
  await initializeDatabase();
  const rows = await sql`
    select token, report_payload as "reportPayload", expires_at as "expiresAt"
    from purchase_sessions
    where token = ${token} and expires_at > now()
    limit 1
  `;
  return rows[0] || null;
}

export async function deletePurchaseSession(token) {
  if (!sql) return false;
  await initializeDatabase();
  await sql`delete from purchase_sessions where token = ${token}`;
  return true;
}

export async function savePaidOrder(order) {
  if (!sql) return false;

  await initializeDatabase();
  await sql`
    insert into shopify_orders (order_id, paid, product_matched, email, report_payload, session_token, created_at, updated_at)
    values (${order.orderId}, ${order.paid}, ${order.productMatched}, ${order.email || ""}, ${order.reportPayload || null}, ${order.sessionToken || null}, ${order.createdAt}, now())
    on conflict (order_id) do update set
      paid = excluded.paid,
      product_matched = excluded.product_matched,
      email = excluded.email,
      report_payload = coalesce(excluded.report_payload, shopify_orders.report_payload),
      session_token = coalesce(excluded.session_token, shopify_orders.session_token),
      updated_at = now()
  `;
  return true;
}

export async function findPaidOrder(orderId) {
  if (!sql) return null;

  await initializeDatabase();
  const rows = await sql`
    select
      order_id as "orderId",
      paid,
      product_matched as "productMatched",
      email,
      report_payload as "reportPayload",
      session_token as "sessionToken",
      created_at as "createdAt"
    from shopify_orders
    where order_id = ${orderId}
    limit 1
  `;

  return rows[0] || null;
}

export async function findPaidOrderBySessionToken(sessionToken) {
  if (!sql || !sessionToken) return null;
  await initializeDatabase();
  const rows = await sql`
    select
      order_id as "orderId",
      paid,
      product_matched as "productMatched",
      email,
      report_payload as "reportPayload",
      session_token as "sessionToken",
      created_at as "createdAt"
    from shopify_orders
    where session_token = ${sessionToken}
    order by created_at desc
    limit 1
  `;
  return rows[0] || null;
}

export function databaseConfigured() {
  return Boolean(sql);
}
