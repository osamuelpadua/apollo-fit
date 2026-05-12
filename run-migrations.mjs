import { createRequire } from 'module'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const require = createRequire(import.meta.url)
const pg = require('pg')
const { Client } = pg

const __dirname = dirname(fileURLToPath(import.meta.url))

const PROJECT_REF = 'xkdoxyswcycwolagqtgj'
const PASSWORD = '8hpTqtLDX0r!U1i'

const REGIONS = [
  'us-east-1',
  'us-west-1',
  'eu-central-1',
  'eu-west-1',
  'ap-southeast-1',
  'sa-east-1',
  'ap-northeast-1',
]

async function tryConnect(host, port, user) {
  const client = new Client({
    host,
    port,
    database: 'postgres',
    user,
    password: PASSWORD,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  })
  try {
    await client.connect()
    return client
  } catch (e) {
    await client.end().catch(() => {})
    throw e
  }
}

async function findConnection() {
  // Try direct connection first
  console.log('Tentando conexão direta...')
  try {
    const c = await tryConnect(
      `db.${PROJECT_REF}.supabase.co`,
      5432,
      'postgres'
    )
    console.log('✓ Conexão direta funcionou!')
    return c
  } catch (e) {
    console.log('✗ Conexão direta falhou:', e.message)
  }

  // Try pooler in different regions
  for (const region of REGIONS) {
    const host = `aws-0-${region}.pooler.supabase.com`
    console.log(`Tentando pooler ${region} (porta 5432)...`)
    try {
      const c = await tryConnect(host, 5432, `postgres.${PROJECT_REF}`)
      console.log(`✓ Pooler ${region}:5432 funcionou!`)
      return c
    } catch (e) {
      console.log(`✗ Falhou: ${e.message}`)
    }

    console.log(`Tentando pooler ${region} (porta 6543)...`)
    try {
      const c = await tryConnect(host, 6543, `postgres.${PROJECT_REF}`)
      console.log(`✓ Pooler ${region}:6543 funcionou!`)
      return c
    } catch (e) {
      console.log(`✗ Falhou: ${e.message}`)
    }
  }

  return null
}

async function runMigrations() {
  const client = await findConnection()

  if (!client) {
    console.error('\n❌ Não consegui conectar ao banco de dados.')
    console.error('Por favor, execute os SQLs manualmente no Supabase Dashboard:')
    console.error('1. Acesse: https://supabase.com/dashboard/project/xkdoxyswcycwolagqtgj/sql')
    console.error('2. Execute supabase/migrations/001_schema.sql')
    console.error('3. Execute supabase/migrations/002_rls.sql')
    console.error('4. Execute supabase/migrations/003_storage.sql')
    console.error('5. Execute supabase/seed.sql')
    process.exit(1)
  }

  const files = [
    'supabase/migrations/001_schema.sql',
    'supabase/migrations/002_rls.sql',
    'supabase/migrations/003_storage.sql',
    'supabase/seed.sql',
  ]

  for (const file of files) {
    const sql = readFileSync(join(__dirname, file), 'utf-8')
    console.log(`\nExecutando ${file}...`)
    try {
      await client.query(sql)
      console.log(`✓ ${file} executado com sucesso!`)
    } catch (e) {
      if (e.message.includes('already exists') || e.message.includes('duplicate')) {
        console.log(`⚠ ${file}: alguns objetos já existem (normal se re-executando)`)
      } else {
        console.error(`✗ Erro em ${file}:`, e.message)
      }
    }
  }

  await client.end()
  console.log('\n✅ Migrations concluídas!')
}

runMigrations().catch(console.error)
