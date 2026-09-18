const app = require('./src/app');
const db = require('./src/db');
const http = require('http');

async function testApi() {
  await db.initDb();

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`Testing API on ${baseUrl}...`);

  // 1. Login
  const loginRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.token) throw new Error('Login failed: ' + JSON.stringify(loginData));
  console.log('✅ 1. Login exitoso. Token recibido.');
  const token = loginData.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // 2. Dashboard
  const dashRes = await fetch(`${baseUrl}/dashboard?period=month`, { headers: authHeaders });
  const dashData = await dashRes.json();
  console.log('✅ 2. Dashboard KPIs:', {
    totalCollected: dashData.totalCollected,
    totalPending: dashData.totalPending,
    activeClients: dashData.activeClients,
    todayDue: dashData.todayPayments,
    overdue: dashData.overdue,
  });

  // 3. List Clients
  const clientsRes = await fetch(`${baseUrl}/clients`, { headers: authHeaders });
  const clientsData = await clientsRes.json();
  console.log(`✅ 3. Clientes listados: ${clientsData.length} clientes encontrados.`);

  // 4. Create Client
  const createRes = await fetch(`${baseUrl}/clients`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Cliente Prueba Automatizada',
      phone: '77788990',
      amount: 120,
      frequency: 'WEEKLY',
      payment_day: 1,
      start_date: '2026-09-01',
      next_payment_date: '2026-09-18',
      notes: 'Creado en test de verificación',
    }),
  });
  const createdClient = await createRes.json();
  if (!createdClient.id) throw new Error('Client creation failed: ' + JSON.stringify(createdClient));
  console.log('✅ 4. Cliente creado:', createdClient.name, 'ID:', createdClient.id);

  // 5. Register Payment
  const payRes = await fetch(`${baseUrl}/payments`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      client_id: createdClient.id,
      amount: 120,
      payment_date: '2026-09-18',
      period_start: '2026-09-18',
      period_end: '2026-09-25',
      notes: 'Primer pago registrado',
    }),
  });
  const payData = await payRes.json();
  if (!payData.payment) throw new Error('Payment creation failed: ' + JSON.stringify(payData));
  console.log('✅ 5. Pago registrado. Próxima fecha calculada:', payData.client.next_payment_date);

  server.close();
  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE API PASARON SATISFACTORIAMENTE!');
  process.exit(0);
}

testApi().catch(err => {
  console.error('❌ Error en testApi:', err);
  process.exit(1);
});
