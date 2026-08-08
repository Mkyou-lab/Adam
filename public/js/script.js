const socket = io();
let menu = {};
let cart = [];
let currentOrderId = null;
let isAdmin = false;
let adminPassword = '';

// ---------- Init ----------
window.addEventListener('load', () => {
  loadMenu();
  loadComments();
  // Auto-open admin if ?admin=1
  const params = new URLSearchParams(window.location.search);
  if (params.get('admin') === '1') openAdminLogin();
});

// ---------- Tabs ----------
function showTab(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (name === 'cart') renderCart();
  if (name === 'comments') loadComments();
  window.scrollTo({top:0, behavior:'smooth'});
}
function showAdminTab(name, btn) {
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('admin-' + name).classList.add('active');
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (name === 'orders') loadAdminOrders();
  if (name === 'manage') renderManageMenu();
  if (name === 'comments') loadAdminComments();
  if (name === 'add') populateCategoryDropdown();
  if (name === 'chats') loadAdminChats();
}

// ---------- Menu ----------
async function loadMenu() {
  const res = await fetch('/api/menu');
  menu = await res.json();
  renderMenu();
}

function renderMenu() {
  const c = document.getElementById('menuContainer');
  c.innerHTML = '';
  Object.entries(menu).forEach(([cat, items]) => {
    const catDiv = document.createElement('div');
    catDiv.className = 'category';
    catDiv.innerHTML = `<h2>${cat}</h2><div class="menu-grid"></div>`;
    const grid = catDiv.querySelector('.menu-grid');
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'food-card';
      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/220x160?text=${encodeURIComponent(item.name)}'">
        <div class="info">
          <h4>${item.name}</h4>
          <div class="price">₦${item.price.toLocaleString()}</div>
          <button onclick="addToCart('${cat}','${item.id}')">Add to Cart</button>
        </div>`;
      grid.appendChild(card);
    });
    c.appendChild(catDiv);
  });
}

// ---------- Cart ----------
function addToCart(cat, id) {
  const item = menu[cat].find(i => i.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...item, qty: 1 });
  updateCartCount();
  alert(item.name + ' added to cart!');
}

function updateCartCount() {
  document.getElementById('cartCount').textContent = cart.reduce((s,i)=>s+i.qty,0);
}

function renderCart() {
  const c = document.getElementById('cartItems');
  const form = document.getElementById('checkoutForm');
  if (cart.length === 0) {
    c.innerHTML = '<p>Your cart is empty.</p>';
    document.getElementById('cartTotal').innerHTML = '';
    form.style.display = 'none';
    return;
  }
  c.innerHTML = '';
  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div><strong>${item.name}</strong><br>₦${item.price.toLocaleString()}</div>
      <div class="qty">
        <button onclick="changeQty(${idx},-1)">-</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${idx},1)">+</button>
        <button onclick="removeCart(${idx})" style="background:#e74c3c;margin-left:8px;">✕</button>
      </div>`;
    c.appendChild(div);
  });
  document.getElementById('cartTotal').innerHTML = `Total: ₦${total.toLocaleString()}`;
  form.style.display = 'block';
}
function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty < 1) cart.splice(idx, 1);
  renderCart(); updateCartCount();
}
function removeCart(idx) { cart.splice(idx,1); renderCart(); updateCartCount(); }

async function submitOrder() {
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const note = document.getElementById('custNote').value.trim();
  if (!name || !phone) return alert('Enter your name and phone.');
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const res = await fetch('/api/order', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ customer:name, phone, note, items:cart, total })
  });
  const data = await res.json();
  if (data.ok) {
    alert('Order placed! Your Order ID: ' + data.orderId + '\nUse it to track your order.');
    currentOrderId = data.orderId;
    localStorage.setItem('lastOrderId', data.orderId);
    cart = [];
    updateCartCount();
    document.getElementById('trackId').value = data.orderId;
    showTab('track');
    trackOrder();
  }
}

// ---------- Track ----------
async function trackOrder() {
  const id = document.getElementById('trackId').value.trim();
  if (!id) return;
  const res = await fetch('/api/order/' + id);
  const div = document.getElementById('trackResult');
  if (res.status === 404) { div.innerHTML='<p>Order not found.</p>'; document.getElementById('chatBox').style.display='none'; return; }
  const o = await res.json();
  currentOrderId = o.id;
  div.innerHTML = `
    <div class="order-info">
      <h3>Order ${o.id}</h3>
      <p><strong>Status:</strong> <span class="status-badge status-${o.status}">${o.status}</span></p>
      <p><strong>Customer:</strong> ${o.customer} (${o.phone})</p>
      <p><strong>Total:</strong> ₦${o.total.toLocaleString()}</p>
      <p><strong>Items:</strong></p>
      <ul>${o.items.map(i=>`<li>${i.name} × ${i.qty} = ₦${(i.price*i.qty).toLocaleString()}</li>`).join('')}</ul>
      ${o.note ? `<p><strong>Note:</strong> ${o.note}</p>` : ''}
      <p><small>Ordered: ${new Date(o.createdAt).toLocaleString()}</small></p>
    </div>`;
  document.getElementById('chatBox').style.display='block';
  socket.emit('joinOrder', o.id);
  loadChat(o.id);
}

async function loadChat(orderId) {
  const res = await fetch('/api/messages/' + orderId);
  const msgs = await res.json();
  const box = document.getElementById('chatMessages');
  box.innerHTML = '';
  msgs.forEach(m => appendChat(m));
}
function appendChat(m) {
  const box = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = 'chat-msg ' + m.from;
  div.innerHTML = `${m.text}<small>${m.name} • ${new Date(m.createdAt).toLocaleTimeString()}</small>`;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}
function sendChat() {
  const text = document.getElementById('chatText').value.trim();
  if (!text || !currentOrderId) return;
  socket.emit('chatMessage', { orderId: currentOrderId, from: isAdmin?'admin':'customer', text, name: isAdmin?'Kitchen':'Customer' });
  document.getElementById('chatText').value = '';
}

socket.on('chatMessage', m => {
  if (m.orderId === currentOrderId) appendChat(m);
  if (isAdmin) loadAdminChats();
});
socket.on('orderStatus', ({id,status}) => {
  if (id === currentOrderId) trackOrder();
});
socket.on('menuUpdated', m => { menu = m; renderMenu(); });
socket.on('newOrder', o => { if (isAdmin) loadAdminOrders(); });
socket.on('ordersUpdated', () => { if (isAdmin) loadAdminOrders(); });
socket.on('newComment', () => loadComments());
socket.on('commentsUpdated', () => { loadComments(); if(isAdmin) loadAdminComments(); });

// ---------- Comments ----------
async function loadComments() {
  const res = await fetch('/api/comments');
  const list = await res.json();
  const c = document.getElementById('commentsList');
  c.innerHTML = list.length===0 ? '<p>No comments yet. Be the first!</p>' :
    list.map(x=>`<div class="comment"><strong>${x.name}</strong><small>${new Date(x.createdAt).toLocaleString()}</small><p>${x.text}</p></div>`).join('');
}
async function postComment() {
  const name = document.getElementById('commentName').value.trim() || 'Anonymous';
  const text = document.getElementById('commentText').value.trim();
  if (!text) return alert('Write a comment.');
  await fetch('/api/comment', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,text})});
  document.getElementById('commentName').value='';
  document.getElementById('commentText').value='';
  loadComments();
}

// ---------- Admin ----------
function openAdminLogin() { document.getElementById('adminModal').classList.add('active'); }
function closeModal() { document.getElementById('adminModal').classList.remove('active'); }

async function adminLogin() {
  const pass = document.getElementById('adminPass').value;
  const res = await fetch('/api/admin/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pass})});
  if (res.ok) {
    isAdmin = true; adminPassword = pass;
    socket.emit('joinAdmin', pass);
    closeModal();
    showTab('admin');
    showAdminTab('orders');
  } else alert('Wrong password.');
}
function adminLogout() { isAdmin=false; adminPassword=''; showTab('menu'); }

async function loadAdminOrders() {
  const res = await fetch('/api/orders');
  const orders = await res.json();
  
  // Update stats
  document.getElementById('statOrders').textContent = orders.length;
  document.getElementById('statPending').textContent = orders.filter(o => o.status === 'Pending').length;
  document.getElementById('statDelivered').textContent = orders.filter(o => o.status === 'Delivered').length;
  const revenue = orders.filter(o => o.status === 'Delivered').reduce((s,o) => s + o.total, 0);
  document.getElementById('statRevenue').textContent = '₦' + revenue.toLocaleString();
  
  const c = document.getElementById('admin-orders');
  c.innerHTML = '<h3 style="color:#E85A0C;margin-bottom:15px;"><i class="fas fa-receipt"></i> All Orders</h3>' + (orders.length===0 ? '<p style="text-align:center;padding:30px;color:#888;">No orders yet.</p>' :
    orders.map(o => `
      <div class="admin-order">
        <h4><i class="fas fa-shopping-bag"></i> ${o.id} — ${o.customer} <small style="color:#888;">(${o.phone})</small></h4>
        <p><strong>Total:</strong> ₦${o.total.toLocaleString()} | <strong>Time:</strong> ${new Date(o.createdAt).toLocaleString()}</p>
        <p><strong>Items:</strong> ${o.items.map(i=>`${i.name} ×${i.qty}`).join(', ')}</p>
        ${o.note?`<p><strong>Note:</strong> ${o.note}</p>`:''}
        <p style="margin:10px 0;"><strong>Status:</strong> <span class="status-badge status-${o.status}">${o.status}</span></p>
        <select id="st_${o.id}">
          ${['Pending','Preparing','Ready','Delivered','Cancelled'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}
        </select>
        <button class="btn-primary" onclick="updateStatus('${o.id}')"><i class="fas fa-sync"></i> Update</button>
        <button class="btn-danger" onclick="deleteOrder('${o.id}')"><i class="fas fa-trash"></i> Delete</button>
        <button class="btn-secondary" onclick="openAdminChat('${o.id}')"><i class="fas fa-comment"></i> Chat</button>
      </div>`).join(''));
}

async function updateStatus(id) {
  const status = document.getElementById('st_'+id).value;
  await fetch('/api/order/status',{method:'POST',headers:{'Content-Type':'application/json','x-admin-password':adminPassword},body:JSON.stringify({id,status})});
  loadAdminOrders();
}
async function deleteOrder(id) {
  if (!confirm('Delete order?')) return;
  await fetch('/api/order/delete',{method:'POST',headers:{'Content-Type':'application/json','x-admin-password':adminPassword},body:JSON.stringify({id})});
  loadAdminOrders();
}
function openAdminChat(id) {
  currentOrderId = id;
  socket.emit('joinOrder', id);
  showTab('track');
  document.getElementById('trackId').value = id;
  trackOrder();
}

function renderManageMenu() {
  const c = document.getElementById('admin-manage');
  c.innerHTML = '<h3>Manage Menu</h3>';
  Object.entries(menu).forEach(([cat,items])=>{
    const div = document.createElement('div');
    div.innerHTML = `<h4 style="color:#8B0000;margin-top:15px;">${cat}</h4>`;
    items.forEach(i=>{
      const row = document.createElement('div');
      row.className='admin-order';
      row.innerHTML = `
        <img src="${i.image}" style="width:80px;height:60px;object-fit:cover;float:left;margin-right:10px;border-radius:6px;">
        <strong>${i.name}</strong> — ₦${i.price.toLocaleString()}
        <br><button class="btn-danger" style="margin-top:8px;" onclick="deleteMenuItem('${cat}','${i.id}')">Delete</button>`;
      div.appendChild(row);
    });
    c.appendChild(div);
  });
}
async function deleteMenuItem(cat,id) {
  if (!confirm('Delete this item?')) return;
  await fetch('/api/menu/delete',{method:'POST',headers:{'Content-Type':'application/json','x-admin-password':adminPassword},body:JSON.stringify({category:cat,id})});
  await loadMenu(); renderManageMenu();
}
function populateCategoryDropdown() {
  const sel = document.getElementById('newCat');
  sel.innerHTML = Object.keys(menu).map(c=>`<option>${c}</option>`).join('');
}
async function addMenuItem() {
  const cat = document.getElementById('newCatCustom').value.trim() || document.getElementById('newCat').value;
  const name = document.getElementById('newName').value.trim();
  const price = parseFloat(document.getElementById('newPrice').value);
  const image = document.getElementById('newImage').value.trim() || 'https://via.placeholder.com/220x160?text='+encodeURIComponent(name);
  if (!cat||!name||!price) return alert('Fill category, name and price.');
  await fetch('/api/menu/add',{method:'POST',headers:{'Content-Type':'application/json','x-admin-password':adminPassword},body:JSON.stringify({category:cat,item:{name,price,image}})});
  document.getElementById('newName').value=''; document.getElementById('newPrice').value=''; document.getElementById('newImage').value=''; document.getElementById('newCatCustom').value='';
  await loadMenu(); populateCategoryDropdown(); alert('Added!');
}
async function resetMenu() {
  if (!confirm('Reset menu to defaults? This deletes all custom items.')) return;
  await fetch('/api/menu/reset',{method:'POST',headers:{'Content-Type':'application/json','x-admin-password':adminPassword},body:JSON.stringify({})});
  await loadMenu(); renderManageMenu(); alert('Menu reset.');
}

async function loadAdminComments() {
  const res = await fetch('/api/comments');
  const list = await res.json();
  const c = document.getElementById('admin-comments');
  c.innerHTML = '<h3>Comments</h3>' + (list.length===0?'<p>No comments.</p>':
    list.map(x=>`<div class="comment"><strong>${x.name}</strong><small>${new Date(x.createdAt).toLocaleString()}</small><p>${x.text}</p><button class="btn-danger" onclick="deleteComment('${x.id}')">Delete</button></div>`).join(''));
}
async function deleteComment(id) {
  await fetch('/api/comment/delete',{method:'POST',headers:{'Content-Type':'application/json','x-admin-password':adminPassword},body:JSON.stringify({id})});
  loadAdminComments();
}

async function loadAdminChats() {
  const res = await fetch('/api/messages',{headers:{'x-admin-password':adminPassword}});
  const msgs = await res.json();
  const grouped = {};
  msgs.forEach(m=>{ if(!grouped[m.orderId]) grouped[m.orderId]=[]; grouped[m.orderId].push(m); });
  const c = document.getElementById('admin-chats');
  c.innerHTML = '<h3>All Chats</h3>' + (Object.keys(grouped).length===0?'<p>No chats yet.</p>':
    Object.entries(grouped).map(([oid,ms])=>`
      <div class="admin-order">
        <h4>Order ${oid}</h4>
        ${ms.map(m=>`<div class="chat-msg ${m.from}">${m.text}<small>${m.name} • ${new Date(m.createdAt).toLocaleTimeString()}</small></div>`).join('')}
        <button class="btn-primary" onclick="openAdminChat('${oid}')">Open Chat</button>
      </div>`).join(''));
}
