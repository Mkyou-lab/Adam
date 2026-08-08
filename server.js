const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// CRITICAL: Use Railway's PORT
const PORT = process.env.PORT || 3000;

const ADMIN_PASSWORD = 'Iyaadam2026';
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Log all requests (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Default menu
const defaultMenu = {
  Swallows: [
    { id: 's1', name: 'Amala', price: 500, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400' },
    { id: 's2', name: 'Eba', price: 300, image: 'https://images.unsplash.com/photo-1567337710282-00832b415979?w=400' },
    { id: 's3', name: 'Semo', price: 300, image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400' },
    { id: 's4', name: 'Plantain Swallow', price: 1000, image: 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400' },
    { id: 's5', name: 'Pounded Yam', price: 500, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400' },
    { id: 's6', name: 'Tuwo', price: 600, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400' }
  ],
  Soups: [
    { id: 'sp1', name: 'Efo Riro (per spoon)', price: 500, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400' },
    { id: 'sp2', name: 'Egusi Soup', price: 800, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
    { id: 'sp3', name: 'Ewedu', price: 500, image: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=400' },
    { id: 'sp4', name: 'Gbegiri', price: 500, image: 'https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400' },
    { id: 'sp5', name: 'Ogbono Soup', price: 800, image: 'https://images.unsplash.com/photo-1626200925465-c8e9c1e1a3f7?w=400' }
  ],
  Rice: [
    { id: 'r1', name: 'White Rice (per spoon)', price: 500, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400' },
    { id: 'r2', name: 'Fried Rice (per spoon)', price: 500, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
    { id: 'r3', name: 'Jollof Rice (per spoon)', price: 500, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400' },
    { id: 'r4', name: 'Asun Rice', price: 1000, image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400' },
    { id: 'r5', name: 'Pasta', price: 800, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400' }
  ],
  'Local Dishes': [
    { id: 'l1', name: 'Yam Porridge', price: 500, image: 'https://images.unsplash.com/photo-1604908812836-3a90ce4b0e97?w=400' },
    { id: 'l2', name: 'Ewa Agoyin & Beans', price: 500, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400' },
    { id: 'l3', name: 'Beans (per spoon)', price: 500, image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400' },
    { id: 'l4', name: 'Beans & Potatoes', price: 700, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' }
  ],
  'Proteins (Rice)': [
    { id: 'pr1', name: 'Grilled Turkey', price: 6000, image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400' },
    { id: 'pr2', name: 'Chicken', price: 3700, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400' },
    { id: 'pr3', name: 'Small Chicken', price: 2800, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400' },
    { id: 'pr4', name: 'Drumstick', price: 1500, image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400' },
    { id: 'pr5', name: 'Steak Meat', price: 2000, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400' },
    { id: 'pr6', name: 'Chicken Gizzard', price: 2000, image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400' },
    { id: 'pr7', name: 'Turkey Gizzard', price: 2000, image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400' }
  ],
  'Proteins (Swallow)': [
    { id: 'ps1', name: 'Goat Meat', price: 3000, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
    { id: 'ps2', name: 'Titus Fish', price: 2500, image: 'https://images.unsplash.com/photo-1535140728325-a4d3707eee94?w=400' },
    { id: 'ps3', name: 'Assorted Meat', price: 600, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
    { id: 'ps4', name: 'Catfish', price: 2500, image: 'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?w=400' },
    { id: 'ps5', name: 'Tilapia Fish', price: 3000, image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400' },
    { id: 'ps6', name: 'Croaker Fish', price: 3000, image: 'https://images.unsplash.com/photo-1535140728325-a4d3707eee94?w=400' },
    { id: 'ps7', name: 'Ponmo', price: 600, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' }
  ],
  'Sides/Extras': [
    { id: 'sd1', name: 'Moi Moi', price: 500, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400' },
    { id: 'sd2', name: 'Fried Plantain', price: 500, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
    { id: 'sd3', name: 'Salad', price: 1000, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' }
  ],
  Drinks: [
    { id: 'd1', name: 'Water', price: 300, image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400' },
    { id: 'd2', name: 'Natural Fruit Juice', price: 1500, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
    { id: 'd3', name: 'Smoothie', price: 2000, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400' },
    { id: 'd4', name: 'Coke', price: 500, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' },
    { id: 'd5', name: 'Fanta', price: 500, image: 'https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400' },
    { id: 'd6', name: 'Sprite', price: 500, image: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400' },
    { id: 'd7', name: 'Pepsi', price: 500, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400' },
    { id: 'd8', name: 'Zobo', price: 1200, image: 'https://images.unsplash.com/photo-1622597467836-f3e6047cc116?w=400' },
    { id: 'd9', name: 'Tigernut Drink', price: 1500, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400' },
    { id: 'd10', name: 'Vita Milk', price: 2000, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' }
  ],
  Packaging: [
    { id: 'pk1', name: 'Takeaway Pack', price: 500, image: 'https://images.unsplash.com/photo-1620146344904-097a0002d6d6?w=400' },
    { id: 'pk2', name: 'Small Takeaway Pack', price: 300, image: 'https://images.unsplash.com/photo-1620146344904-097a0002d6d6?w=400' }
  ]
};

let store = { menu: defaultMenu, orders: [], comments: [], messages: [] };

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if (!store.menu) store.menu = defaultMenu;
      if (!store.orders) store.orders = [];
      if (!store.comments) store.comments = [];
      if (!store.messages) store.messages = [];
    }
  } catch (e) { console.error('Load error:', e.message); }
}
function saveData() {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2)); }
  catch (e) { console.error('Save error:', e.message); }
}
loadData();

function checkAdmin(req, res, next) {
  const pass = req.headers['x-admin-password'] || (req.body && req.body.password);
  if (pass === ADMIN_PASSWORD) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/admin/login', (req, res) => {
  if (req.body && req.body.password === ADMIN_PASSWORD) return res.json({ ok: true });
  res.status(401).json({ ok: false });
});

app.get('/api/menu', (req, res) => res.json(store.menu));

app.post('/api/menu/add', checkAdmin, (req, res) => {
  const { category, item } = req.body;
  if (!store.menu[category]) store.menu[category] = [];
  item.id = 'x' + Date.now();
  store.menu[category].push(item);
  saveData();
  io.emit('menuUpdated', store.menu);
  res.json({ ok: true });
});

app.post('/api/menu/delete', checkAdmin, (req, res) => {
  const { category, id } = req.body;
  if (store.menu[category]) {
    store.menu[category] = store.menu[category].filter(i => i.id !== id);
    saveData();
    io.emit('menuUpdated', store.menu);
  }
  res.json({ ok: true });
});

app.post('/api/menu/reset', checkAdmin, (req, res) => {
  store.menu = JSON.parse(JSON.stringify(defaultMenu));
  saveData();
  io.emit('menuUpdated', store.menu);
  res.json({ ok: true });
});

app.post('/api/order', (req, res) => {
  const order = {
    id: 'O' + Date.now(),
    customer: req.body.customer || 'Guest',
    phone: req.body.phone || '',
    items: req.body.items || [],
    total: req.body.total || 0,
    note: req.body.note || '',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  store.orders.unshift(order);
  saveData();
  io.emit('newOrder', order);
  io.emit('ordersUpdated', store.orders);
  res.json({ ok: true, orderId: order.id });
});

app.get('/api/orders', (req, res) => res.json(store.orders));

app.get('/api/order/:id', (req, res) => {
  const o = store.orders.find(x => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: 'Not found' });
  res.json(o);
});

app.post('/api/order/status', checkAdmin, (req, res) => {
  const { id, status } = req.body;
  const o = store.orders.find(x => x.id === id);
  if (o) {
    o.status = status;
    saveData();
    io.emit('orderStatus', { id, status });
    io.emit('ordersUpdated', store.orders);
  }
  res.json({ ok: true });
});

app.post('/api/order/delete', checkAdmin, (req, res) => {
  store.orders = store.orders.filter(o => o.id !== req.body.id);
  saveData();
  io.emit('ordersUpdated', store.orders);
  res.json({ ok: true });
});

app.get('/api/comments', (req, res) => res.json(store.comments));

app.post('/api/comment', (req, res) => {
  const c = {
    id: 'C' + Date.now(),
    name: (req.body.name || 'Anonymous').substring(0, 50),
    text: (req.body.text || '').substring(0, 500),
    createdAt: new Date().toISOString()
  };
  if (!c.text) return res.status(400).json({ error: 'Empty' });
  store.comments.unshift(c);
  saveData();
  io.emit('newComment', c);
  res.json({ ok: true });
});

app.post('/api/comment/delete', checkAdmin, (req, res) => {
  store.comments = store.comments.filter(c => c.id !== req.body.id);
  saveData();
  io.emit('commentsUpdated', store.comments);
  res.json({ ok: true });
});

app.get('/api/messages/:orderId', (req, res) => {
  res.json(store.messages.filter(m => m.orderId === req.params.orderId));
});

app.get('/api/messages', checkAdmin, (req, res) => res.json(store.messages));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('joinOrder', (orderId) => { if (orderId) socket.join('order_' + orderId); });
  socket.on('joinAdmin', (pass) => { if (pass === ADMIN_PASSWORD) socket.join('admin'); });
  socket.on('chatMessage', (msg) => {
    if (!msg || !msg.orderId || !msg.text) return;
    const message = {
      id: 'M' + Date.now(),
      orderId: msg.orderId,
      from: msg.from === 'admin' ? 'admin' : 'customer',
      name: msg.name || (msg.from === 'admin' ? 'Kitchen' : 'Customer'),
      text: String(msg.text).substring(0, 500),
      createdAt: new Date().toISOString()
    };
    store.messages.push(message);
    saveData();
    io.to('order_' + msg.orderId).emit('chatMessage', message);
    io.to('admin').emit('chatMessage', message);
  });
});

// Start server - bind to 0.0.0.0 for Railway
server.listen(PORT, '0.0.0.0', () => {
  console.log('========================================');
  console.log('🍲 IYA ADAM KITCHEN SERVER STARTED');
  console.log('========================================');
  console.log('Port:', PORT);
  console.log('Time:', new Date().toISOString());
  console.log('========================================');
});

process.on('uncaughtException', (err) => console.error('Uncaught:', err));
process.on('unhandledRejection', (reason) => console.error('Rejection:', reason));
