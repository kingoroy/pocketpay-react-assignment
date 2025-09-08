#!/usr/bin/env node
// Minimal JSON-backed mock API for the PocketPay app. No external deps.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const DB_PATH = path.join(__dirname, 'db.json');

function readDB() {
  try {
    const txt = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(txt || '{}');
  } catch (e) {
    return {};
  }
}

function isGroupedCollection(col) {
  return Array.isArray(col) && col.length > 0 && col[0] && Object.prototype.hasOwnProperty.call(col[0], 'userId') && Object.prototype.hasOwnProperty.call(col[0], 'items');
}

function findGroup(db, resource, userId) {
  db[resource] = db[resource] || [];
  if (isGroupedCollection(db[resource])) {
    return db[resource].find(g => String(g.userId) === String(userId)) || null;
  }
  // flat array fallback
  return null;
}

function createGroup(db, resource, userId) {
  db[resource] = db[resource] || [];
  const group = { userId: userId, items: [] };
  db[resource].push(group);
  return group;
}

function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

function sendJSON(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      if (!body) return resolve(null);
      try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean); // e.g. ['api','users']

  // Serve static files from /public if present
  if (url.pathname === '/' || url.pathname.startsWith('/public') || url.pathname === '/index.html') {
    const filePath = path.join(__dirname, 'public', url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const map = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.png':'image/png', '.ico':'image/x-icon' };
      res.writeHead(200, { 'Content-Type': map[ext] || 'application/octet-stream' });
      res.end(data);
      return;
    }
  }

  // Only serve /api/*
  if (parts[0] !== 'api') {
    sendJSON(res, 404, { error: 'Not found' });
    return;
  }

  const resource = parts[1] || '';
  const id = parts[2];
  const db = readDB();

  try {
    if (req.method === 'GET') {
      if (!resource) return sendJSON(res, 400, { error: 'Resource required' });
      const userId = url.searchParams.get('userId');
      // user-scoped collections
      if (resource === 'jewelry') {
        if (isGroupedCollection(db.jewelry)) {
          if (userId) {
            const group = findGroup(db, 'jewelry', userId);
            return sendJSON(res, 200, group ? group.items : []);
          }
          return sendJSON(res, 200, db.jewelry);
        }
        const list = (db.jewelry || []).filter(j => !userId || String(j.userId) === String(userId));
        if (id) {
          const item = list.find(i => String(i.id) === String(id));
          if (!item) return sendJSON(res, 404, { error: 'Not found' });
          return sendJSON(res, 200, item);
        }
        return sendJSON(res, 200, list);
      }
      if (resource === 'wallets') {
        if (isGroupedCollection(db.wallets)) {
          if (userId) {
            const group = findGroup(db, 'wallets', userId);
            return sendJSON(res, 200, group ? group.items : []);
          }
          return sendJSON(res, 200, db.wallets);
        }
        const list = (db.wallets || []).filter(w => !userId || String(w.userId) === String(userId));
        if (id) {
          const item = list.find(i => String(i.id) === String(id));
          if (!item) return sendJSON(res, 404, { error: 'Not found' });
          return sendJSON(res, 200, item);
        }
        return sendJSON(res, 200, list);
      }
      if (resource === 'transactions') {
        if (isGroupedCollection(db.transactions)) {
          if (userId) {
            const group = findGroup(db, 'transactions', userId);
            return sendJSON(res, 200, group ? group.items : []);
          }
          return sendJSON(res, 200, db.transactions);
        }
        const list = (db.transactions || []).filter(t => !userId || String(t.userId) === String(userId));
        if (id) {
          const item = list.find(i => String(i.id) === String(id));
          if (!item) return sendJSON(res, 404, { error: 'Not found' });
          return sendJSON(res, 200, item);
        }
        return sendJSON(res, 200, list);
      }
      const collection = db[resource] || [];
      if (id) {
        const item = collection.find((i) => String(i.id) === String(id));
        if (!item) return sendJSON(res, 404, { error: 'Not found' });
        return sendJSON(res, 200, item);
      }
      return sendJSON(res, 200, collection);
    }

    if (req.method === 'POST') {
      const body = await parseBody(req);
      // auth endpoints: accept /api/login and /api/signup (also keep /api/auth/* for compatibility)
      if ((resource === 'auth' && parts[2] === 'login') || resource === 'login') {
        const { email, password } = body || {};
        const users = db.users || [];
        // normalize emails for comparison (trim + lowercase) to avoid case/whitespace mismatches
        const normalized = String(email || '').trim().toLowerCase();
        const userByEmail = users.find(u => String(u.email || '').trim().toLowerCase() === normalized);
        // if email exists but password mismatch -> invalid password
        if (userByEmail && userByEmail.password !== password) return sendJSON(res, 401, { code: 'INVALID_PASSWORD', message: 'Invalid password' });
        // if email not found -> generic invalid credentials message
        if (!userByEmail) return sendJSON(res, 401, { code: 'AUTH_INVALID', message: 'Invalid credentials, try to login again' });
        const { password: pw, ...safe } = userByEmail;
        return sendJSON(res, 200, { user: safe });
      }
      if ((resource === 'auth' && parts[2] === 'signup') || resource === 'signup') {
        const { email } = body || {};
        // case-insensitive, trimmed email check to avoid duplicates due to casing/whitespace
        const exists = (db.users||[]).some(u => String(u.email||'').trim().toLowerCase() === String(email||'').trim().toLowerCase());
        if (exists) return sendJSON(res, 409, { code: 'AUTH_EXISTS', message: 'Email already exists' });
        const nextId = ((db.users || []).reduce((max, u) => Math.max(max, Number(u.id||0)), 0) + 1) || Date.now();
        const newUser = { id: nextId, ...body };
        // create wallet for new user
        const walletId = ((db.wallets || []).reduce((max, w) => Math.max(max, Number(w.id||0)), 0) + 1) || Date.now();
        const wallet = { id: walletId, userId: nextId, balance: '$0.00' };
        db.users = db.users || [];
        db.users.push(newUser);
        // wallets: add to grouped collection if present, otherwise flat
        if (isGroupedCollection(db.wallets)) {
          let group = findGroup(db, 'wallets', nextId);
          if (!group) group = createGroup(db, 'wallets', nextId);
          group.items.push({ id: walletId, balance: wallet.balance });
        } else {
          db.wallets = db.wallets || [];
          db.wallets.push(wallet);
        }
        // create default jewelry for user
        const newJ = { id: ((db.jewelry || []).reduce((max, j) => Math.max(max, Number(j.id||0)), 0) + 1) || Date.now(), userId: nextId, name: 'Starter Necklace', karat: '18K', value: '$100' };
        if (isGroupedCollection(db.jewelry)) {
          let group = findGroup(db, 'jewelry', nextId);
          if (!group) group = createGroup(db, 'jewelry', nextId);
          group.items.push(newJ);
        } else {
          db.jewelry = db.jewelry || [];
          db.jewelry.push(newJ);
        }
        // create initial transaction
        const initTx = { id: ((db.transactions || []).reduce((max, t) => Math.max(max, Number(t.id||0)), 0) + 1) || Date.now(), userId: nextId, date: new Date().toISOString().slice(0,10), description: 'Account created', amount: '+$0' };
        if (isGroupedCollection(db.transactions)) {
          let group = findGroup(db, 'transactions', nextId);
          if (!group) group = createGroup(db, 'transactions', nextId);
          group.items.push(initTx);
        } else {
          db.transactions = db.transactions || [];
          db.transactions.push(initTx);
        }
        writeDB(db);
  const { password: pw, ...safe } = newUser;
  return sendJSON(res, 201, { user: { ...safe, wallet, jewelry: [newJ], transactions: [initTx] } });
      }

      // transactions: support user-scoped creation and listing
      if (resource === 'transactions') {
        // listing with optional ?userId=123
        const userId = url.searchParams.get('userId');
        if (!id && req.method === 'GET') {
          if (isGroupedCollection(db.transactions)) {
            if (userId) {
              const group = findGroup(db, 'transactions', userId);
              return sendJSON(res, 200, group ? group.items : []);
            }
            return sendJSON(res, 200, db.transactions);
          }
          const list = (db.transactions || []).filter(t => !userId || String(t.userId) === String(userId));
          return sendJSON(res, 200, list);
        }
        if (req.method === 'POST') {
          if (isGroupedCollection(db.transactions)) {
            const userIdBody = (body && body.userId) ? String(body.userId) : null;
            if (!userIdBody) return sendJSON(res, 400, { error: 'userId required' });
            let group = findGroup(db, 'transactions', userIdBody);
            if (!group) group = createGroup(db, 'transactions', userIdBody);
            const txId = Date.now();
            const newTx = { id: txId, ...(body || {}) };
            group.items.push(newTx);
            writeDB(db);
            return sendJSON(res, 201, newTx);
          }
          db.transactions = db.transactions || [];
          const txId = ((db.transactions || []).reduce((max, i) => Math.max(max, Number(i.id||0)), 0) + 1) || Date.now();
          const newTx = { id: txId, ...(body || {}) };
          db.transactions.push(newTx);
          writeDB(db);
          return sendJSON(res, 201, newTx);
        }
      }

      // generic create for resource
      if (!resource) return sendJSON(res, 400, { error: 'Resource required' });
      // If collection is grouped, insert into group's items
      if (['jewelry','wallets','transactions'].includes(resource) && isGroupedCollection(db[resource])) {
        const userIdBody = (body && body.userId) ? String(body.userId) : null;
        if (!userIdBody) return sendJSON(res, 400, { error: 'userId required' });
        let group = findGroup(db, resource, userIdBody);
        if (!group) group = createGroup(db, resource, userIdBody);
        const nextId = Date.now();
        const newItem = { id: nextId, ...(body || {}) };
        group.items.push(newItem);
        writeDB(db);
        return sendJSON(res, 201, newItem);
      }
      db[resource] = db[resource] || [];
      const nextId = ((db[resource] || []).reduce((max, i) => Math.max(max, Number(i.id||0)), 0) + 1) || Date.now();
      const newItem = { id: nextId, ...(body || {}) };
      db[resource].push(newItem);
      writeDB(db);
      return sendJSON(res, 201, newItem);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = await parseBody(req);
      if (!resource || !id) return sendJSON(res, 400, { error: 'Resource and id required' });
      // If resource is grouped, find the group by userId and update inside group.items
      if (isGroupedCollection(db[resource])) {
        const userIdBody = (body && (body.userId || body.user)) ? String(body.userId || body.user) : null;
        const userIdQuery = url.searchParams.get('userId');
        const userId = userIdBody || userIdQuery;
        if (!userId) return sendJSON(res, 400, { error: 'userId required for grouped collection' });
        const group = findGroup(db, resource, userId);
        if (!group) return sendJSON(res, 404, { error: 'Not found' });
        const idx = group.items.findIndex((i) => String(i.id) === String(id));
        if (idx === -1) return sendJSON(res, 404, { error: 'Not found' });
        group.items[idx] = { ...group.items[idx], ...(body || {}) };
        writeDB(db);
        return sendJSON(res, 200, group.items[idx]);
      }
      db[resource] = db[resource] || [];
      const idx = db[resource].findIndex((i) => String(i.id) === String(id));
      if (idx === -1) return sendJSON(res, 404, { error: 'Not found' });
      db[resource][idx] = { ...db[resource][idx], ...(body || {}) };
      writeDB(db);
      return sendJSON(res, 200, db[resource][idx]);
    }

    if (req.method === 'DELETE') {
      if (!resource || !id) return sendJSON(res, 400, { error: 'Resource and id required' });
      // grouped collection delete
      if (isGroupedCollection(db[resource])) {
        const userIdQuery = url.searchParams.get('userId');
        // allow userId in body for delete too
        let body = null;
        try { body = await parseBody(req); } catch(e){}
        const userIdBody = (body && (body.userId || body.user)) ? String(body.userId || body.user) : null;
        const userId = userIdBody || userIdQuery;
        if (!userId) return sendJSON(res, 400, { error: 'userId required for grouped collection' });
        const group = findGroup(db, resource, userId);
        if (!group) return sendJSON(res, 404, { error: 'Not found' });
        const idx = group.items.findIndex((i) => String(i.id) === String(id));
        if (idx === -1) return sendJSON(res, 404, { error: 'Not found' });
        const removed = group.items.splice(idx, 1)[0];
        writeDB(db);
        return sendJSON(res, 200, removed);
      }
      db[resource] = db[resource] || [];
      const idx = db[resource].findIndex((i) => String(i.id) === String(id));
      if (idx === -1) return sendJSON(res, 404, { error: 'Not found' });
      const removed = db[resource].splice(idx, 1)[0];
      writeDB(db);
      return sendJSON(res, 200, removed);
    }

    sendJSON(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    sendJSON(res, 500, { error: 'Server error', detail: err.message });
  }
});

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`Mock API server running on http://localhost:${port}`));
