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
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `;

  initialized = true;
  return true;
}

export async function savePaidOrder(order) {
  if (!sql) return false;

  await initializeDatabase();
  await sql`
    insert into shopify_orders (order_id, paid, product_matched, email, created_at, updated_at)
    values (${order.orderId}, ${order.paid}, ${order.productMatched}, ${order.email || ""}, ${order.createdAt}, now())
    on conflict (order_id) do update set
      paid = excluded.paid,
      product_matched = excluded.product_matched,
      email = excluded.email,
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
      created_at as "createdAt"
    from shopify_orders
    where order_id = ${orderId}
    limit 1
  `;

  return rows[0] || null;
}

export function databaseConfigured() {
  return Boolean(sql);
}
