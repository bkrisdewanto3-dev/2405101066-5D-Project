/* KegiatanKampus - front-end demo. Data tersimpan di localStorage browser (tanpa server). */
const KEY = 'kegiatan_kampus_db', SES = 'kegiatan_kampus_user';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const fmt = iso => new Date(iso + 'T00:00').toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'});
const CATS = ['Seminar', 'Lomba', 'Workshop', 'Pelatihan', 'Organisasi'];

function seed() {
  return {
    n: 100,
    users: [
      {id:1, nama:'Admin Kampus', nim:'-', email:'admin@kampus.ac.id', pass:'admin123', prodi:'-', peran:'admin', aktif:true},
      {id:2, nama:'Panitia BEM', nim:'-', email:'panitia@kampus.ac.id', pass:'panitia123', prodi:'-', peran:'panitia', aktif:true},
      {id:3, nama:'Rani Mahasiswa', nim:'22010001', email:'mahasiswa@kampus.ac.id', pass:'mhs123', prodi:'Teknik Informatika', peran:'mahasiswa', aktif:true}
    ],
    events: [
      {id:1, owner:2, title:'Seminar Karier di Dunia Teknologi', cat:'Seminar', date:day(7), place:'Aula Utama', quota:100, deadline:day(5), open:true, desc:'Praktisi industri berbagi cara menyiapkan diri sebelum lulus: portofolio, magang, dan wawancara kerja.'},
      {id:2, owner:2, title:'Workshop Dasar UI/UX dengan Figma', cat:'Workshop', date:day(12), place:'Lab Komputer 2', quota:30, deadline:day(10), open:true, desc:'Belajar membuat wireframe dan prototipe aplikasi dari nol. Bawa laptop sendiri.'},
      {id:3, owner:2, title:'Lomba Debat Antarjurusan', cat:'Lomba', date:day(20), place:'Gedung Serbaguna', quota:16, deadline:day(15), open:true, desc:'Satu tim terdiri dari tiga orang. Mosi diumumkan 30 menit sebelum babak dimulai.'}
    ],
    regs: [] // {id, user, event, tgl, status:'terdaftar'|'dibatalkan', hadir:bool}
  };
}
let db = JSON.parse(localStorage.getItem(KEY) || 'null') || seed();
const save = () => localStorage.setItem(KEY, JSON.stringify(db));
const me = () => db.users.find(u => u.id == localStorage.getItem(SES) && u.aktif);
const ev = id => db.events.find(e => e.id == id);
const usr = id => db.users.find(u => u.id == id);
const taken = e => db.regs.filter(r => r.event == e.id && r.status == 'terdaftar').length;
const status = e => !e.open ? 'Pendaftaran ditutup' : day(0) > e.deadline ? 'Batas daftar lewat' : taken(e) >= e.quota ? 'Kuota penuh' : null;
const myReg = (e, u) => db.regs.find(r => r.event == e.id && r.user == u.id && r.status == 'terdaftar');

let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}
const go = h => { location.hash = h; };

/* ---------- Tampilan ---------- */
function nav() {
  const u = me(), h = location.hash || '#/';
  const a = (href, t) => `<a href="${href}" class="${h === href ? 'on' : ''}">${t}</a>`;
  let s = a('#/', 'Kegiatan');
  if (!u) s += a('#/login', 'Masuk') + a('#/daftar-akun', 'Buat akun');
  else {
    if (u.peran == 'mahasiswa') s += a('#/riwayat', 'Riwayat saya');
    if (u.peran == 'panitia') s += a('#/panitia', 'Kelola kegiatan');
    if (u.peran == 'admin') s += a('#/admin', 'Dashboard admin');
    s += a('#/profil', u.nama.split(' ')[0]) + '<button onclick="logout()">Keluar</button>';
  }
  $('#nav').innerHTML = s;
}

function ticket(e) {
  const d = new Date(e.date + 'T00:00'), st = status(e), left = e.quota - taken(e);
  return `<article class="ticket">
    <div class="date"><b>${d.getDate()}</b><span>${d.toLocaleDateString('id-ID', {month:'short'})}</span></div>
    <div class="info"><h3>${esc(e.title)}</h3><p>${esc(e.cat)} di ${esc(e.place)}</p><p>Daftar sebelum ${fmt(e.deadline)}</p></div>
    <div class="side"><span class="badge ${st ? 'off' : ''}">${st || 'Sisa ' + left + ' dari ' + e.quota + ' kursi'}</span>
    <a class="btn sm" href="#/kegiatan/${e.id}">Lihat detail</a></div></article>`;
}

function viewHome() {
  $('#app').innerHTML = `<section class="hero"><h1>Cari kegiatan, daftar dari mana saja.</h1>
    <p>Seminar, lomba, dan workshop kampus ada di satu tempat. Pilih kegiatan, daftar, lalu pantau statusnya.</p></section>
    <div class="filters"><input id="q" type="search" placeholder="Cari nama kegiatan" aria-label="Cari kegiatan">
    <select id="cat" aria-label="Kategori"><option value="">Semua kategori</option>${CATS.map(c => `<option>${c}</option>`).join('')}</select>
    <input id="tgl" type="date" aria-label="Tanggal" style="width:auto"></div><div id="list" class="list"></div>`;
  const draw = () => {
    const q = $('#q').value.toLowerCase(), c = $('#cat').value, t = $('#tgl').value;
    const r = db.events.filter(e => e.title.toLowerCase().includes(q) && (!c || e.cat == c) && (!t || e.date == t))
      .sort((a, b) => a.date.localeCompare(b.date));
    $('#list').innerHTML = r.map(ticket).join('') || '<p class="empty">Tidak ada kegiatan yang cocok. Coba ubah kata kunci atau filter.</p>';
  };
  ['q', 'cat', 'tgl'].forEach(i => $('#' + i).addEventListener('input', draw)); draw();
}

function viewDetail(id) {
  const e = ev(id); if (!e) return go('#/');
  const u = me(), st = status(e), mine = u && myReg(e, u);
  let act;
  if (!u) act = `<a class="btn" href="#/login">Masuk untuk mendaftar</a>`;
  else if (u.peran != 'mahasiswa') act = `<p class="badge">Hanya mahasiswa yang dapat mendaftar.</p>`;
  else if (mine) act = `<span class="badge ok">Anda sudah terdaftar</span> <button class="btn alt" onclick="cancelReg(${mine.id})">Batalkan pendaftaran</button>`;
  else act = `<button class="btn" onclick="register(${e.id})" ${st ? 'disabled' : ''}>${st || 'Daftar sekarang'}</button>`;
  $('#app').innerHTML = `<a href="#/">Kembali ke daftar kegiatan</a><div class="panel" style="margin-top:1rem">
    <span class="badge">${esc(e.cat)}</span><h1 style="margin-top:.5rem">${esc(e.title)}</h1><p>${esc(e.desc)}</p>
    <div class="grid"><div class="stat"><span>Tanggal</span><b style="font-size:1.1rem">${fmt(e.date)}</b></div>
    <div class="stat"><span>Lokasi</span><b style="font-size:1.1rem">${esc(e.place)}</b></div>
    <div class="stat"><span>Sisa kuota</span><b>${e.quota - taken(e)}/${e.quota}</b></div>
    <div class="stat"><span>Batas daftar</span><b style="font-size:1.1rem">${fmt(e.deadline)}</b></div></div>
    <p>Penyelenggara: ${esc(usr(e.owner)?.nama)}</p>${act}</div>`;
}

function viewAuth(mode) {
  const reg = mode == 'register';
  $('#app').innerHTML = `<div class="panel narrow"><h2>${reg ? 'Buat akun mahasiswa' : 'Masuk ke akun'}</h2>
    <form id="f" novalidate>${reg ? `<label for="nama">Nama lengkap</label><input id="nama" required>
    <label for="nim">NIM</label><input id="nim" required inputmode="numeric">
    <label for="prodi">Program studi</label><input id="prodi" required>` : ''}
    <label for="email">Email</label><input id="email" type="email" required>
    <label for="pass">Kata sandi</label><input id="pass" type="password" required minlength="6">
    <p style="margin:1.2rem 0 0"><button class="btn" style="width:100%">${reg ? 'Buat akun' : 'Masuk'}</button></p></form>
    ${reg ? '' : '<p style="color:var(--muted);font-size:.9rem">Akun contoh: mahasiswa@kampus.ac.id / mhs123, panitia@kampus.ac.id / panitia123, admin@kampus.ac.id / admin123</p>'}</div>`;
  $('#f').onsubmit = ev2 => { ev2.preventDefault(); reg ? doRegister() : doLogin(); };
}

function viewHistory(u) {
  const rows = db.regs.filter(r => r.user == u.id).sort((a, b) => b.id - a.id).map(r => {
    const e = ev(r.event), can = r.status == 'terdaftar' && day(0) <= e.deadline;
    return `<tr><td><a href="#/kegiatan/${e.id}">${esc(e.title)}</a></td><td>${fmt(e.date)}</td><td>${esc(e.place)}</td>
    <td><span class="badge ${r.status == 'terdaftar' ? 'ok' : 'off'}">${r.status}${r.hadir ? ', hadir' : ''}</span></td>
    <td>${can ? `<button class="btn sm alt" onclick="cancelReg(${r.id})">Batalkan</button>` : ''}</td></tr>`;
  }).join('');
  $('#app').innerHTML = `<h2>Riwayat pendaftaran</h2>` + (rows ? `<div class="panel"><table class="tbl"><tr><th>Kegiatan</th><th>Tanggal</th><th>Lokasi</th><th>Status</th><th></th></tr>${rows}</table></div>`
    : '<p class="empty">Anda belum mendaftar kegiatan apa pun. <a href="#/">Lihat kegiatan yang tersedia</a>.</p>');
}

function viewProfile(u) {
  $('#app').innerHTML = `<div class="panel narrow"><h2>Profil</h2><p>${esc(u.nama)}<br>${esc(u.email)}<br>Peran: ${u.peran}${u.nim != '-' ? '<br>NIM: ' + esc(u.nim) : ''}</p>
    <form id="f"><label for="np">Kata sandi baru</label><input id="np" type="password" minlength="6" required>
    <p><button class="btn">Simpan kata sandi</button></p></form></div>`;
  $('#f').onsubmit = e => { e.preventDefault(); u.pass = $('#np').value; save(); toast('Kata sandi disimpan'); e.target.reset(); };
}

function viewOrganizer(u) {
  const mine = db.events.filter(e => e.owner == u.id);
  $('#app').innerHTML = `<h2>Kelola kegiatan</h2><div class="panel"><h3>Tambah kegiatan</h3><form id="f">
    <label for="t">Nama kegiatan</label><input id="t" required>
    <div class="row"><div style="flex:1 1 160px"><label for="c">Kategori</label><select id="c">${CATS.map(c => `<option>${c}</option>`).join('')}</select></div>
    <div style="flex:1 1 160px"><label for="d">Tanggal kegiatan</label><input id="d" type="date" required></div>
    <div style="flex:1 1 160px"><label for="dl">Batas pendaftaran</label><input id="dl" type="date" required></div>
    <div style="flex:1 1 100px"><label for="k">Kuota</label><input id="k" type="number" min="1" required></div></div>
    <label for="p">Lokasi</label><input id="p" required><label for="ds">Deskripsi</label><textarea id="ds" rows="3" required></textarea>
    <p><button class="btn">Simpan kegiatan</button></p></form></div>
    <div class="panel"><h3>Kegiatan saya</h3>${mine.length ? `<table class="tbl"><tr><th>Kegiatan</th><th>Tanggal</th><th>Pendaftar</th><th>Status</th><th></th></tr>${mine.map(e => `<tr>
    <td>${esc(e.title)}</td><td>${fmt(e.date)}</td><td>${taken(e)}/${e.quota}</td><td>${e.open ? 'Dibuka' : 'Ditutup'}</td>
    <td class="row"><a class="btn sm" href="#/peserta/${e.id}">Peserta</a><button class="btn sm alt" onclick="toggleOpen(${e.id})">${e.open ? 'Tutup' : 'Buka'} pendaftaran</button></td></tr>`).join('')}</table>` : '<p class="empty">Belum ada kegiatan. Isi formulir di atas untuk membuat yang pertama.</p>'}</div>`;
  $('#f').onsubmit = e => {
    e.preventDefault();
    if ($('#dl').value > $('#d').value) return toast('Batas pendaftaran harus sebelum tanggal kegiatan');
    db.events.push({id: ++db.n, owner: u.id, title: $('#t').value.trim(), cat: $('#c').value, date: $('#d').value, deadline: $('#dl').value,
      quota: +$('#k').value, place: $('#p').value.trim(), desc: $('#ds').value.trim(), open: true});
    save(); toast('Kegiatan disimpan'); viewOrganizer(u);
  };
}

function viewParticipants(id, u) {
  const e = ev(id); if (!e || (u.peran == 'panitia' && e.owner != u.id)) return go('#/panitia');
  const rows = db.regs.filter(r => r.event == e.id && r.status == 'terdaftar').map(r => { const m = usr(r.user);
    return `<tr><td>${esc(m.nama)}</td><td>${esc(m.nim)}</td><td>${esc(m.prodi)}</td><td>${fmt(r.tgl)}</td>
    <td><label style="margin:0;font-weight:400"><input type="checkbox" style="width:auto" ${r.hadir ? 'checked' : ''} onchange="setPresent(${r.id}, this.checked)"> Hadir</label></td></tr>`; }).join('');
  $('#app').innerHTML = `<a href="#/${u.peran == 'admin' ? 'admin' : 'panitia'}">Kembali</a><h2 style="margin-top:1rem">Peserta: ${esc(e.title)}</h2>
    <p>${taken(e)} dari ${e.quota} kursi terisi. <button class="btn sm alt" onclick="exportCsv(${e.id})">Unduh CSV</button></p>` +
    (rows ? `<div class="panel"><table class="tbl"><tr><th>Nama</th><th>NIM</th><th>Program studi</th><th>Tanggal daftar</th><th>Kehadiran</th></tr>${rows}</table></div>` : '<p class="empty">Belum ada peserta yang mendaftar.</p>');
}

function viewAdmin() {
  const regs = db.regs.filter(r => r.status == 'terdaftar'), hadir = regs.filter(r => r.hadir).length;
  const top = db.events.map(e => [e, taken(e)]).sort((a, b) => b[1] - a[1])[0];
  $('#app').innerHTML = `<h2>Dashboard admin</h2><div class="grid">
    <div class="stat"><span>Pengguna</span><b>${db.users.length}</b></div><div class="stat"><span>Kegiatan</span><b>${db.events.length}</b></div>
    <div class="stat"><span>Pendaftaran aktif</span><b>${regs.length}</b></div><div class="stat"><span>Tingkat kehadiran</span><b>${regs.length ? Math.round(hadir / regs.length * 100) : 0}%</b></div></div>
    ${top && top[1] ? `<p>Kegiatan terpopuler: <strong>${esc(top[0].title)}</strong> (${top[1]} pendaftar)</p>` : ''}
    <div class="panel"><h3>Semua kegiatan</h3><table class="tbl"><tr><th>Kegiatan</th><th>Penyelenggara</th><th>Pendaftar</th><th></th></tr>${db.events.map(e => `<tr>
    <td>${esc(e.title)}</td><td>${esc(usr(e.owner)?.nama)}</td><td>${taken(e)}/${e.quota}</td><td class="row"><a class="btn sm" href="#/peserta/${e.id}">Peserta</a>
    <button class="btn sm alt" onclick="toggleOpen(${e.id})">${e.open ? 'Tutup' : 'Buka'}</button></td></tr>`).join('')}</table></div>
    <div class="panel"><h3>Pengguna</h3><table class="tbl"><tr><th>Nama</th><th>Email</th><th>Peran</th><th>Status</th><th></th></tr>${db.users.map(x => `<tr>
    <td>${esc(x.nama)}</td><td>${esc(x.email)}</td><td><select style="width:auto" onchange="setRole(${x.id}, this.value)" ${x.id == 1 ? 'disabled' : ''}>
    ${['mahasiswa', 'panitia', 'admin'].map(p => `<option ${p == x.peran ? 'selected' : ''}>${p}</option>`).join('')}</select></td>
    <td><span class="badge ${x.aktif ? 'ok' : 'off'}">${x.aktif ? 'Aktif' : 'Nonaktif'}</span></td>
    <td>${x.id == 1 ? '' : `<button class="btn sm alt" onclick="toggleUser(${x.id})">${x.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>`}</td></tr>`).join('')}</table></div>`;
}

/* ---------- Aksi ---------- */
function doLogin() {
  const u = db.users.find(x => x.email == $('#email').value.trim().toLowerCase() && x.pass == $('#pass').value);
  if (!u) return toast('Email atau kata sandi salah');
  if (!u.aktif) return toast('Akun Anda dinonaktifkan. Hubungi admin.');
  localStorage.setItem(SES, u.id); go(u.peran == 'admin' ? '#/admin' : u.peran == 'panitia' ? '#/panitia' : '#/');
}
function doRegister() {
  const email = $('#email').value.trim().toLowerCase();
  if (!email.includes('@') || $('#pass').value.length < 6) return toast('Isi email yang valid dan kata sandi minimal 6 karakter');
  if (db.users.some(x => x.email == email)) return toast('Email sudah terdaftar. Silakan masuk.');
  if (db.users.some(x => x.nim == $('#nim').value.trim())) return toast('NIM sudah terdaftar');
  if (!$('#nama').value.trim() || !$('#nim').value.trim() || !$('#prodi').value.trim()) return toast('Lengkapi semua kolom');
  const u = {id: ++db.n, nama: $('#nama').value.trim(), nim: $('#nim').value.trim(), email, pass: $('#pass').value, prodi: $('#prodi').value.trim(), peran: 'mahasiswa', aktif: true};
  db.users.push(u); save(); localStorage.setItem(SES, u.id); toast('Akun dibuat'); go('#/');
}
function logout() { localStorage.removeItem(SES); go('#/'); route(); }
function register(id) {
  const e = ev(id), u = me();
  if (!u || status(e) || myReg(e, u)) return toast(status(e) || 'Anda sudah terdaftar');
  db.regs.push({id: ++db.n, user: u.id, event: e.id, tgl: day(0), status: 'terdaftar', hadir: false});
  save(); toast('Pendaftaran berhasil. Sampai jumpa di ' + e.place + '!'); viewDetail(id);
}
function cancelReg(id) {
  const r = db.regs.find(x => x.id == id), e = ev(r.event);
  if (day(0) > e.deadline) return toast('Batas pembatalan sudah lewat');
  r.status = 'dibatalkan'; save(); toast('Pendaftaran dibatalkan'); route();
}
function toggleOpen(id) { const e = ev(id); e.open = !e.open; save(); route(); }
function setPresent(id, v) { db.regs.find(r => r.id == id).hadir = v; save(); }
function setRole(id, p) { usr(id).peran = p; save(); toast('Peran diubah'); }
function toggleUser(id) { const x = usr(id); x.aktif = !x.aktif; save(); route(); }
function exportCsv(id) {
  const e = ev(id), rows = [['Nama', 'NIM', 'Program studi', 'Tanggal daftar', 'Hadir']];
  db.regs.filter(r => r.event == id && r.status == 'terdaftar').forEach(r => { const m = usr(r.user); rows.push([m.nama, m.nim, m.prodi, r.tgl, r.hadir ? 'Ya' : 'Tidak']); });
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type: 'text/csv'})); a.download = 'peserta-' + e.id + '.csv'; a.click();
}

/* ---------- Router ---------- */
function route() {
  const [, p, id] = (location.hash || '#/').split('/'), u = me();
  const need = (...roles) => { if (!u) { go('#/login'); return false; } if (!roles.includes(u.peran)) { go('#/'); return false; } return true; };
  nav(); window.scrollTo(0, 0);
  if (!p) return viewHome();
  if (p == 'kegiatan') return viewDetail(id);
  if (p == 'login') return viewAuth('login');
  if (p == 'daftar-akun') return viewAuth('register');
  if (p == 'riwayat') return need('mahasiswa') && viewHistory(u);
  if (p == 'profil') return need('mahasiswa', 'panitia', 'admin') && viewProfile(u);
  if (p == 'panitia') return need('panitia') && viewOrganizer(u);
  if (p == 'peserta') return need('panitia', 'admin') && viewParticipants(id, u);
  if (p == 'admin') return need('admin') && viewAdmin();
  viewHome();
}
window.addEventListener('hashchange', route);
route();
