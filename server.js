const PORT = process.env.PORT || 3000;
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = 'Iyaadam2026';
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Default Menu ----------
const defaultMenu = {
  Swallows: [
    { id: 's1', name: 'Amala', price: 500, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400' },
    { id: 's2', name: 'Eba', price: 300, image: 'https://i.pinimg.com/originals/1e/4c/8d/1e4c8d5c8e2f9c4b8a3d5e6f7a8b9c0d.jpg' },
    { id: 's3', name: 'Semo', price: 300, image: 'https://i.pinimg.com/originals/2a/3b/4c/2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d.jpg' },
    { id: 's4', name: 'Plantain Swallow', price: 1000, image: 'https://i.pinimg.com/originals/3b/4c/5d/3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e.jpg' },
    { id: 's5', name: 'Pounded Yam', price: 500, image: 'https://i.pinimg.com/originals/4c/5d/6e/4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f.jpg' },
    { id: 's6', name: 'Tuwo', price: 600, image: 'https://i.pinimg.com/originals/5d/6e/7f/5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a.jpg' }
  ],
  Soups: [
    { id: 'sp1', name: 'Efo Riro (per spoon)', price: 500, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400' },
    { id: 'sp2', name: 'Egusi Soup', price: 800, image: 'https://i.pinimg.com/originals/6e/7f/8a/6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b.jpg' },
    { id: 'sp3', name: 'Ewedu', price: 500, image: 'https://i.pinimg.com/originals/7f/8a/9b/7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c.jpg' },
    { id: 'sp4', name: 'Gbegiri', price: 500, image: 'https://i.pinimg.com/originals/8a/9b/0c/8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d.jpg' },
    { id: 'sp5', name: 'Ogbono Soup', price: 800, image: 'https://i.pinimg.com/originals/9b/0c/1d/9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e.jpg' },
    { id: 'sp6', name: 'Egbo Stew', price: 600, image: 'https://i.pinimg.com/originals/0c/1d/2e/0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f.jpg' },
    { id: 'sp7', name: 'Beans Stew', price: 600, image: 'https://i.pinimg.com/originals/1d/2e/3f/1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a.jpg' }
  ],
  Rice: [
    { id: 'r1', name: 'White Rice (per spoon)', price: 500, image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400' },
    { id: 'r2', name: 'Fried Rice (per spoon)', price: 500, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400' },
    { id: 'r3', name: 'Jollof Rice (per spoon)', price: 500, image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=400' },
    { id: 'r4', name: 'Asun Rice', price: 1000, image: 'https://i.pinimg.com/originals/2e/3f/4a/2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b.jpg' },
    { id: 'r5', name: 'Pasta', price: 800, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400' }
  ],
  'Local Dishes': [
    { id: 'l1', name: 'Yam Porridge', price: 500, image: 'https://i.pinimg.com/originals/3f/4a/5b/3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c.jpg' },
    { id: 'l2', name: 'Ewa Agoyin & Beans (per spoon)', price: 500, image: 'https://i.pinimg.com/originals/4a/5b/6c/4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d.jpg' },
    { id: 'l3', name: 'Beans (per spoon)', price: 500, image: 'https://i.pinimg.com/originals/5b/6c/7d/5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e.jpg' },
    { id: 'l4', name: 'Beans & Potatoes', price: 700, image: 'https://i.pinimg.com/originals/6c/7d/8e/6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f.jpg' }
  ],
  'Proteins (Rice Meals)': [
    { id: 'pr1', name: 'Grilled Turkey', price: 6000, image: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=400' },
    { id: 'pr2', name: 'Chicken', price: 3700, image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400' },
    { id: 'pr3', name: 'Small Chicken', price: 2800, image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400' },
    { id: 'pr4', name: 'Drumstick', price: 1500, image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=400' },
    { id: 'pr5', name: 'Steak Meat', price: 2000, image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400' },
    { id: 'pr6', name: 'Chicken Gizzard', price: 2000, image: 'https://i.pinimg.com/originals/7d/8e/9f/7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a.jpg' },
    { id: 'pr7', name: 'Turkey Gizzard', price: 2000, image: 'https://i.pinimg.com/originals/8e/9f/0a/8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b.jpg' }
  ],
  'Proteins (Swallow Meals)': [
    { id: 'ps1', name: 'Goat Meat', price: 3000, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400' },
    { id: 'ps2', name: 'Titus Fish', price: 2500, image: 'https://images.unsplash.com/photo-1535140728325-a4d3707eee94?w=400' },
    { id: 'ps3', name: 'Assorted Meat', price: 600, image: 'https://i.pinimg.com/originals/9f/0a/1b/9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c.jpg' },
    { id: 'ps4', name: 'Catfish', price: 2500, image: 'https://images.unsplash.com/photo-1611599537845-1c7aca0091c0?w=400' },
    { id: 'ps5', name: 'Tilapia Fish', price: 3000, image: 'https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=400' },
    { id: 'ps6', name: 'Croaker Fish', price: 3000, image: 'https://i.pinimg.com/originals/0a/1b/2c/0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d.jpg' },
    { id: 'ps7', name: 'Smoked Catfish', price: 3000, image: 'https://i.pinimg.com/originals/1b/2c/3d/1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e.jpg' },
    { id: 'ps8', name: 'Hake Fish', price: 3000, image: 'https://i.pinimg.com/originals/2c/3d/4e/2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f.jpg' },
    { id: 'ps9', name: 'Ponmo', price: 600, image: 'https://i.pinimg.com/originals/3d/4e/5f/3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a.jpg' }
  ],
  'Sides/Extras': [
    { id: 'sd1', name: 'Moi Moi', price: 500, image: 'https://i.pinimg.com/originals/4e/5f/6a/4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b.jpg' },
    { id: 'sd2', name: 'Fried Plantain', price: 500, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400' },
    { id: 'sd3', name: 'Salad', price: 1000, image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400' }
  ],
  Drinks: [
    { id: 'd1', name: 'Water', price: 300, image: 'https://images.unsplash.com/photo-1560023907-5f339617ea30?w=400' },
    { id: 'd2', name: 'Natural Fruit Juice', price: 1500, image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400' },
    { id: 'd3', name: 'Smoothie', price: 2000, image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400' },
    { id: 'd4', name: 'Active', price: 2200, image: 'https://i.pinimg.com/originals/5f/6a/7b/5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c.jpg' },
    { id: 'd5', name: 'Exotic', price: 2200, image: 'https://i.pinimg.com/originals/6a/7b/8c/6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d.jpg' },
    { id: 'd6', name: 'V-Smart / V-Joy', price: 2200, image: 'https://i.pinimg.com/originals/7b/8c/9d/7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e.jpg' },
    { id: 'd7', name: 'Coke', price: 500, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400' },
    { id: 'd8', name: 'Fanta', price: 500, image: 'https://i.pinimg.com/originals/8c/9d/0e/8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f.jpg' },
    { id: 'd9', name: 'Sprite', price: 500, image: 'https://i.pinimg.com/originals/9d/0e/1f/9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a.jpg' },
    { id: 'd10', name: 'Pepsi', price: 500, image: 'https://i.pinimg.com/originals/0e/1f/2a/0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b.jpg' },
    { id: 'd11', name: 'Farouz', price: 800, image: 'https://i.pinimg.com/originals/1f/2a/3b/1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c.jpg' },
    { id: 'd12', name: 'Can Malt', price: 800, image: 'https://i.pinimg.com/originals/2a/3b/4c/2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d.jpg' },
    { id: 'd13', name: 'Plastic Malt', price: 800, image: 'https://i.pinimg.com/originals/3b/4c/5d/3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e.jpg' },
    { id: 'd14', name: 'Can Coke', price: 700, image: 'https://i.pinimg.com/originals/4c/5d/6e/4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f.jpg' },
    { id: 'd15', name: 'Five Alive Pulpy', price: 1700, image: 'https://i.pinimg.com/originals/5d/6e/7f/5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a.jpg' },
    { id: 'd16', name: 'Zobo', price: 1200, image: 'https://i.pinimg.com/originals/6e/7f/8a/6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b.jpg' },
    { id: 'd17', name: 'Tigernut Drink', price: 1500, image: 'https://i.pinimg.com/originals/7f/8a/9b/7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c.jpg' },
    { id: 'd18', name: 'Vita Milk', price: 2000, image: 'https://i.pinimg.com/originals/8a/9b/0c/8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d.jpg' },
    { id: 'd19', name: 'Wheat & Chocolate Drink', price: 1200, image: 'https://i.pinimg.com/originals/9b/0c/1d/9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e.jpg' }
  ],
  Packaging: [
    { id: 'pk1', name: 'Takeaway Pack', price: 500, image: 'https://i.pinimg.com/originals/0c/1d/2e/0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f.jpg' },
    { id: 'pk2', name: 'Small Takeaway Pack', price: 300, image: 'https://i.pinimg.com/originals/1d/2e/3f/1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a.jpg' }
  ]
};

// ---------- Data Persistence ----------
let store = { menu: defaultMenu, orders: [], comments: [], messages: [] };

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      store = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      if (!store.menu) store.menu = defaultMenu;
      if (!store.orders) store.orders = [];
      if (!store.comments) store.comments = [];
      if (!store.messages) store.messages = [];
    } else {
      saveData();
    }
  } catch (e) { console.error('Load error:', e); }
}
function saveData() {
  try { fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2)); }
  catch (e) { console.error('Save error:', e); }
}
loadData();

// ---------- Auth Middleware ----------
function checkAdmin(req, res, next) {
  const pass = req.headers['x-admin-password'] || req.body.password;
  if (pass === ADMIN_PASSWORD) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// ---------- API Routes ----------
app.post('/api/admin/login', (req, res) => {
  if (req.body.password === ADMIN_PASSWORD) return res.json({ ok: true });
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

app.post('/api/menu/update', checkAdmin, (req, res) => {
  const { category, id, item } = req.body;
  if (store.menu[category]) {
    const idx = store.menu[category].findIndex(i => i.id === id);
    if (idx >= 0) store.menu[category][idx] = { ...store.menu[category][idx], ...item };
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

// Orders
app.post('/api/order', (req, res) => {
  const order = {
    id: 'O' + Date.now(),
    customer: req.body.customer,
    phone: req.body.phone,
    items: req.body.items,
    total: req.body.total,
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

// Comments
app.get('/api/comments', (req, res) => res.json(store.comments));
app.post('/api/comment', (req, res) => {
  const c = {
    id: 'C' + Date.now(),
    name: req.body.name || 'Anonymous',
    text: req.body.text,
    createdAt: new Date().toISOString()
  };
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

// Messages (Chat)
app.get('/api/messages/:orderId', (req, res) => {
  res.json(store.messages.filter(m => m.orderId === req.params.orderId));
});
app.get('/api/messages', checkAdmin, (req, res) => res.json(store.messages));

// ---------- Socket.io Chat ----------
io.on('connection', socket => {
  socket.on('joinOrder', orderId => socket.join('order_' + orderId));
  socket.on('joinAdmin', pass => { if (pass === ADMIN_PASSWORD) socket.join('admin'); });

  socket.on('chatMessage', msg => {
    const message = {
      id: 'M' + Date.now(),
      orderId: msg.orderId,
      from: msg.from, // 'customer' or 'admin'
      name: msg.name || (msg.from === 'admin' ? 'Kitchen' : 'Customer'),
      text: msg.text,
      createdAt: new Date().toISOString()
    };
    store.messages.push(message);
    saveData();
    io.to('order_' + msg.orderId).emit('chatMessage', message);
    io.to('admin').emit('chatMessage', message);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🍲 Iya Adam Kitchen running on port ${PORT}`);
  console.log(`Public:  http://localhost:${PORT}/`);
  console.log(`Admin:   http://localhost:${PORT}/?admin=1`);
});
