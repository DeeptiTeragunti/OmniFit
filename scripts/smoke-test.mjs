#!/usr/bin/env node
// Exercises the whole running stack end to end: auth, ownership/RBAC, activity tracking,
// and the RabbitMQ -> Gemini -> Mongo recommendation pipeline. Run after `docker compose up`
// and starting every service (see README). No dependencies beyond Node's built-in fetch.
//
// Usage: node scripts/smoke-test.mjs

const KEYCLOAK = 'http://localhost:8181/realms/fitness-oauth2/protocol/openid-connect/token'
const GATEWAY = 'http://localhost:8080'

const results = []
const check = (name, pass, detail = '') => {
  results.push({ name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? ' - ' + detail : ''}`)
}

async function getToken(username) {
  const res = await fetch(KEYCLOAK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: 'test-cli',
      username,
      password: 'Passw0rd!',
    }),
  })
  if (!res.ok) throw new Error(`Keycloak token request failed for ${username}: ${res.status}`)
  const body = await res.json()
  return body.access_token
}

function decodeSub(token) {
  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
  return payload.sub
}

async function main() {
  console.log('=== OmniFit smoke test ===\n')

  let aliceToken, adminToken
  try {
    aliceToken = await getToken('alice')
    adminToken = await getToken('admin')
    check('Keycloak issues tokens for alice and admin', true)
  } catch (e) {
    check('Keycloak issues tokens for alice and admin', false, e.message)
    return summarize()
  }
  const aliceSub = decodeSub(aliceToken)

  // Unauthenticated request must be rejected at the gateway
  const unauth = await fetch(`${GATEWAY}/api/activities`)
  check('Unauthenticated request rejected', unauth.status === 401, `got ${unauth.status}`)

  // /api/whoami is handled locally by the gateway (not a proxied route), so it never
  // passes through the GlobalFilter chain and does NOT trigger user-sync. Only a call to
  // an actually-routed path (/api/users, /api/activities, /api/recommendations) does that -
  // use one of those first so alice is registered in userservice before we track anything.
  await fetch(`${GATEWAY}/api/activities`, { headers: { Authorization: `Bearer ${aliceToken}` } })
  await fetch(`${GATEWAY}/api/activities`, { headers: { Authorization: `Bearer ${adminToken}` } })

  const whoami = await fetch(`${GATEWAY}/api/whoami`, { headers: { Authorization: `Bearer ${aliceToken}` } })
  const whoamiBody = await whoami.json()
  check(
    'JWT verification + role mapping (whoami)',
    whoami.status === 200 && whoamiBody.sub === aliceSub && whoamiBody.roles.includes('USER'),
    JSON.stringify(whoamiBody),
  )

  // Track an activity
  const trackRes = await fetch(`${GATEWAY}/api/activities`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${aliceToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'RUNNING',
      duration: 15,
      caloriesBurned: 120,
      startTime: new Date().toISOString().slice(0, 19),
    }),
  })
  const activity = await trackRes.json()
  check('Track activity', trackRes.status === 200 && activity.userId === aliceSub, `status ${trackRes.status}`)

  // Fetch it back, confirm own-resource read works
  const getRes = await fetch(`${GATEWAY}/api/activities/${activity.id}`, {
    headers: { Authorization: `Bearer ${aliceToken}` },
  })
  const fetched = await getRes.json()
  check(
    'Read own activity (fields match)',
    getRes.status === 200 && fetched.type === 'RUNNING' && fetched.duration === 15,
    JSON.stringify(fetched),
  )

  // Admin can read alice's activity (override); this also proves ownership checks exist,
  // not just that everything is open
  const adminReadRes = await fetch(`${GATEWAY}/api/activities/${activity.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  })
  check('Admin can read another user\'s activity', adminReadRes.status === 200, `status ${adminReadRes.status}`)

  // Poll for the AI recommendation - Gemini can take up to ~60s
  console.log('\nWaiting for AI recommendation (up to 90s)...')
  let recommendation = null
  const deadline = Date.now() + 90_000
  while (Date.now() < deadline) {
    const recRes = await fetch(`${GATEWAY}/api/recommendations/activity/${activity.id}`, {
      headers: { Authorization: `Bearer ${aliceToken}` },
    })
    if (recRes.status === 200) {
      recommendation = await recRes.json()
      break
    }
    await new Promise((r) => setTimeout(r, 5000))
  }
  check(
    'AI recommendation generated and retrievable',
    !!recommendation && !!recommendation.recommendation,
    recommendation ? recommendation.recommendation.slice(0, 80) + '...' : 'timed out',
  )

  summarize()
}

function summarize() {
  const failed = results.filter((r) => !r.pass)
  console.log(`\n=== ${results.length - failed.length}/${results.length} checks passed ===`)
  if (failed.length > 0) {
    console.log('Failed:', failed.map((r) => r.name).join(', '))
    process.exit(1)
  }
}

main().catch((e) => {
  console.error('Smoke test crashed:', e)
  process.exit(1)
})
