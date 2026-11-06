/* HUYEN MOBILE • Đối chiếu Excel/Firebase & tách lệnh tại thiết bị, không cần PC/API AI.
 * No credentials, no network and no dynamic code. Usable from offline and automated tests.
 */
(function (root) {
  'use strict';
  function plain(v) { return String(v == null ? '' : v).trim(); }
  function fold(v) { return plain(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim(); }
  function field(v) { return fold(v).replace(/\s/g, ''); }
  function arr(v) { return Array.isArray(v) ? v : (v && typeof v === 'object' ? Object.keys(v).filter(function (k) { return v[k] && typeof v[k] === 'object'; }).map(function (k) { return v[k]; }) : []); }
  function first(o, keys) { for (var i = 0; i < keys.length; i++) if (o[keys[i]] != null && plain(o[keys[i]])) return o[keys[i]]; return ''; }
  function get(o, names) {
    if (!o || typeof o !== 'object') return '';
    var keys = Object.keys(o), f = names.map(field);
    for (var i = 0; i < keys.length; i++) if (f.indexOf(field(keys[i])) >= 0 && o[keys[i]] != null && plain(o[keys[i]])) return o[keys[i]];
    return '';
  }
  function numeric(v) { if (typeof v === 'number') return isFinite(v) ? v : 0; var s = plain(v).replace(/[^0-9,.-]/g, ''); if (!s) return 0; var pos = Math.max(s.lastIndexOf('.'), s.lastIndexOf(',')); if (pos >= 0 && s.length - pos - 1 <= 2) s = s.slice(0, pos).replace(/[.,]/g, '') + '.' + s.slice(pos + 1); else s = s.replace(/[.,]/g, ''); return Number(s) || 0; }
  var names = {
    products: { code: ['ma sp', 'ma san pham', 'ma hang', 'ma thuoc', 'sku', 'productcode', 'code', 'ma hh', 'masp'], name: ['ten sp', 'ten san pham', 'ten thuoc', 'ten hang', 'san pham', 'hang hoa', 'productname', 'name', 'ten'], unit: ['don vi', 'dvt', 'don vi tinh', 'unit'], price: ['gia ban', 'don gia', 'gia niem yet', 'gia', 'price', 'giabanle'], grp: ['nhom', 'nhom hang', 'nhom san pham', 'nganh hang', 'group'] },
    customers: { code: ['ma kh', 'ma khach hang', 'ma dai ly', 'customer code', 'customerid', 'code', 'ma'], name: ['ten kh', 'ten khach hang', 'ten dai ly', 'ten nha thuoc', 'khach hang', 'customername', 'name', 'ten'], address: ['dia chi', 'address', 'dc'], phone: ['sdt', 'so dien thoai', 'dien thoai', 'phone', 'mobile', 'tel'], alias: ['ten khac', 'ten goi khac', 'alias', 'biet danh', 'ten viet tat'] }
  };
  function normRow(what, r) {
    if (Array.isArray(r)) {
      if (what === 'products') return [plain(r[0]), plain(r[1]), plain(r[2]), numeric(r[3]), plain(r[4])];
      return [plain(r[0]), plain(r[1]), plain(r[2]), plain(r[3]), plain(r[4])];
    }
    if (!r || typeof r !== 'object') return null;
    var k = names[what];
    if (what === 'customers') {
      // IDECO existing /ideco_customer_directory → rows: {c,n,d,p,a,t}.
      if (r.n != null || r.c != null) return [plain(r.c), plain(r.n || r.c), plain(r.d), plain(r.p), plain(r.a)];
      return [plain(get(r, k.code)), plain(get(r, k.name)), plain(get(r, k.address)), plain(get(r, k.phone)), plain(get(r, k.alias))];
    }
    if (r.Code != null || r.Name != null) return [plain(r.Code), plain(r.Name), plain(r.UnitName || r.Unit), numeric(r.Price || r.PriceDefault), plain(r.GroupName || r.Group)];
    return [plain(get(r, k.code)), plain(get(r, k.name)), plain(get(r, k.unit)), numeric(get(r, k.price)), plain(get(r, k.grp))];
  }
  function normAoa(what, grid) {
    if (!grid || !grid.length) return [];
    var k = names[what], header = -1, col = {};
    for (var i = 0; i < Math.min(15, grid.length); i++) {
      if (!Array.isArray(grid[i])) continue;
      var tmp = {};
      grid[i].forEach(function (h, j) { Object.keys(k).forEach(function (f) { if (k[f].map(field).indexOf(field(h)) >= 0 && tmp[f] == null) tmp[f] = j; }); });
      if (tmp.name != null && tmp.code != null) { header = i; col = tmp; break; }
    }
    if (header === -1) return grid.map(function (r) { return normRow(what, r); }).filter(Boolean);
    return grid.slice(header + 1).map(function (r) {
      if (!Array.isArray(r)) return null;
      function at(f) { return col[f] == null ? '' : r[col[f]]; }
      if (what === 'products') return [plain(at('code')), plain(at('name')), plain(at('unit')), numeric(at('price')), plain(at('grp'))];
      return [plain(at('code')), plain(at('name')), plain(at('address')), plain(at('phone')), plain(at('alias'))];
    }).filter(Boolean);
  }
  function extract(what, payload) {
    if (payload == null) return [];
    var grids = [];
    if (payload && typeof payload === 'object' && payload.files) {
      arr(payload.files).forEach(function (file) { if (file && file.data) grids.push(arr(file.data)); else if (file && file.rows) grids.push(arr(file.rows)); });
    } else if (Array.isArray(payload)) grids.push(payload);
    else if (payload && typeof payload === 'object') {
      var candidates = [payload.rows, payload.data, payload.items, payload[what], payload.list, payload.records];
      var existing = candidates.find(function (x) { return x && typeof x === 'object'; });
      if (existing) grids.push(arr(existing));
      else grids.push(arr(payload));
    }
    var out = [], map = Object.create(null);
    grids.forEach(function (g) {
      var formatted = g.length && Array.isArray(g[0]) ? normAoa(what, g) : g.map(function (r) { return normRow(what, r); });
      formatted.forEach(function (r) {
        if (!r || !r[0] || !r[1] || /^(stt|tong cong|tong|ma sp|ma kh)$/.test(fold(r[0]))) return;
        var key = field(r[0]); if (map[key] == null) { map[key] = out.length; out.push(r); } else out[map[key]] = r;
      });
    });
    return out;
  }
  var UNIT = '(?:h[oộ]p|hop|chai|l[oọ]|lo|tu[yý]p|t[uú]yp|g[oó]i|goi|th[uù]ng|thung|c[aá]i|cai|v[iỉ]|vi|[ôo]ng|ong|b[iị]ch|bich|b[oộ]|bo|thanh|kg)';
  var QUANTITY = new RegExp('(\\d+(?:[.,]\\d+)?)\\s*(' + UNIT + ')(?![a-zA-Z\\u00c0-\\u1ef9])', 'gi');
  function exactInText(raw, rows, kind) {
    var t = ' ' + fold(raw) + ' ', found = [], nameMin = kind === 'customers' ? 5 : 6;
    (rows || []).forEach(function (row) {
      var code = fold(row[0]), n = fold(row[1]);
      if (code.length >= 3 && t.indexOf(' ' + code + ' ') >= 0) found.push({ name: row[1], code: row[0], score: code.length + 200 });
      else if (n.length >= nameMin && t.indexOf(' ' + n + ' ') >= 0) found.push({ name: row[1], code: row[0], score: n.length });
    });
    found.sort(function (a, b) { return b.score - a.score; });
    return found[0] || null;
  }
  function customerFromText(text, rows) {
    var exact = exactInText(text, rows, 'customers');
    if (exact) return { customer: exact.name, code: exact.code };
    var code = /(?:m[aã]\s*kh|ma\s*kh|customer\s*code)\s*[:#-]?\s*([a-z0-9_.-]{3,40})/i.exec(text);
    if (code) return { customer: '', code: code[1] };
    var re = /(?:kh[aá]ch\s*h[aà]ng|kh[aá]ch|nh[aà]\s*thu[oố]c|qu[aầ]y\s*thu[oố]c|[dđ][aạ]i\s*l[yý]|giao\s*cho|cho\s*kh[aá]ch)\s*[:\-]?\s*([^\n,;:]{3,90})/i;
    var m = re.exec(text);
    if (!m) return { customer: '', code: '' };
    // Stops before either quantity style: "Bạch Liên 12 sản phẩm Wamlox", "Bạch Liên 12 hộp Wamlox".
    var candidate = m[1].replace(/\s+\d+(?:[.,]\d+)?(?:\s|$).*$/i, '')
      .replace(/\s+(?:mua|l[aấ]y|c[aầ]n|s[oố]\s*l[uượ]ng|thanh\s*to[aá]n|tr[aả]\s*ti[eề]n\s*m[aặ]t)\b.*$/i, '')
      .replace(/\s+[dđ][aặ]t\s+(?:h[aà]ng|ti[eề]n|mua).*$/i, '').trim();
    return { customer: candidate.slice(0, 70), code: '' };
  }
  function bareProductFragment(fragment, customer) {
    var s = fold(fragment);
    if (customer && customer.customer) {
      var n = fold(customer.customer);
      if (n.length >= 3) s = (' ' + s + ' ').replace(' ' + n + ' ', ' ').trim();
    }
    s = s.replace(/\b(?:thanh toan|tra tien|dat tien mat|tien mat|chuyen khoan|ck ngan hang|ghi chu|xuat hoa don|giao hang|giao ngay)\b.*$/, ' ');
    s = s.replace(/^(?:(?:len|tao|lap) don(?: hang)?(?: cho)?\s+|(?:don hang cho|cho|cua|khach hang|khach|nha thuoc|quay thuoc|dai ly|tiem thuoc|san pham|mat hang|thuoc|loai|sp|la|gom|mua|dat|lay|can|ban|so luong|sl)\s+)+/, '');
    s = s.replace(/\b(?:cho nha thuoc|cho khach hang|cho dai ly)\b/g, ' ');
    s = s.replace(/^(?:(?:khach hang|khach|nha thuoc|quay thuoc|dai ly|tiem thuoc|san pham|mat hang|thuoc|loai|sp|la|gom|mua|dat|lay|can|ban|so luong|sl)\s+)+/, '');
    return s.replace(/\s+/g, ' ').trim();
  }
  function productHint(fragment, rows) {
    var t = ' ' + fold(fragment) + ' ', strongest = 0;
    if (t.trim().length < 3) return 0;
    (rows || []).forEach(function (r) {
      var n = fold(r[1]), code = fold(r[0]);
      if (code.length >= 3 && t.indexOf(' ' + code + ' ') >= 0) strongest = Math.max(strongest, 100);
      if (n.length >= 4 && t.indexOf(' ' + n + ' ') >= 0) strongest = Math.max(strongest, 80);
      // Product names from Excel may include strength/packaging absent from spoken text.
      var parts = n.split(' ').filter(function (x) { return x.length >= 4 && !/^(thuoc|hang|chai|goi|san|pham|hop|vien|loai)$/.test(x); });
      for (var i = 0; i < parts.length; i++) if (t.indexOf(' ' + parts[i] + ' ') >= 0) strongest = Math.max(strongest, 25);
    });
    return strongest;
  }
  function productNameFromFragment(fragment, rows, customer) {
    var f = bareProductFragment(fragment, customer);
    var exact = exactInText(f, rows, 'products');
    if (exact) return exact.name;
    return f.slice(-100);
  }
  function parse(text, products, customers) {
    text = plain(text); if (!text) throw new Error('Chưa có nội dung đơn hàng để chuẩn hóa.');
    var lines = [], c = customerFromText(text, customers), chunks = text.split(/\n|[;]+/).map(plain).filter(Boolean);
    chunks.forEach(function (chunk) {
      var all = [], m;
      function addMatch(index, end, qty, unit, kind) {
        if (!(qty > 0 && qty < 1000000)) return;
        if (all.some(function (x) { return index < x.end && end > x.index; })) return;
        all.push({ index: index, end: end, qty: qty, unit: unit || '', kind: kind });
      }
      // 1. Quantities explicitly followed by physical units: 12 hộp, 32 chai, etc.
      var q = new RegExp(QUANTITY.source, 'gi');
      while ((m = q.exec(chunk))) addMatch(m.index, q.lastIndex, Number(m[1].replace(',', '.')), m[2], 'unit');
      // 2. Natural speech without units: "12 sản phẩm Wamlox", "3 loại Hamifa".
      var count = /(\d+(?:[.,]\d+)?)\s*(?:s[aả]n\s*ph[aẩ]m|s[ảa]n\s*ph[ẩa]m|m[aặ]t\s*h[aà]ng|sp|thu[oố]c|lo[aạ]i|[dđ][oơ]n\s*v[iị])\b/gi;
      while ((m = count.exec(chunk))) addMatch(m.index, count.lastIndex, Number(m[1].replace(',', '.')), '', 'count');
      // 3. "số lượng 12", "SL:12", "lấy 12" (unit optional).
      var labelled = /(?:s[oố]\s*l[uượ]ng|\bsl\b|\bqty\b|l[aấ]y|mua|c[aầ]n)\s*[:=\-]?\s*(\d+(?:[.,]\d+)?)/gi;
      while ((m = labelled.exec(chunk))) {
        var at = m.index + m[0].lastIndexOf(m[1]);
        addMatch(at, m.index + m[0].length, Number(m[1].replace(',', '.')), '', 'label');
      }
      // 4. "12 Wamlox" / "Wamlox 12" if clearly matched to a catalog product.
      if (!all.length && Array.isArray(products) && products.length) {
        var bare = /\b(\d{1,6})(?![\d.,])\b/g, candidate = [];
        while ((m = bare.exec(chunk))) {
          var after = fold(chunk.slice(bare.lastIndex, bare.lastIndex + 14));
          if (/^(?:mg|mcg|ml|g|gr|kg|iu|ui|%|nam|thang|ngay|vnd|dong)\b/.test(after)) continue;
          var before = chunk.slice(0, m.index), aft = chunk.slice(bare.lastIndex);
          var a = bareProductFragment(before, c), b = bareProductFragment(aft, c);
          var score = Math.max(productHint(a, products), productHint(b, products));
          if (score >= 25) candidate.push({ index: m.index, end: bare.lastIndex, qty: Number(m[1]), unit: '', kind: 'bare' });
        }
        // Avoid guessing where multiple numbers remain plausible.
        if (candidate.length === 1) addMatch(candidate[0].index, candidate[0].end, candidate[0].qty, '', 'bare');
      }
      all.sort(function (a, b) { return a.index - b.index; });
      all.forEach(function (x, i) {
        var prev = i ? all[i-1].end : 0, next = i + 1 < all.length ? all[i+1].index : chunk.length;
        var before = chunk.slice(prev, x.index), after = chunk.slice(x.end, next);
        var pref = productNameFromFragment(before, products, c), aft = productNameFromFragment(after, products, c);
        var bp = productHint(pref, products), ap = productHint(aft, products);
        // With "12 sản phẩm Wamlox" the product is AFTER the quantity.
        var prod = x.kind === 'count' && aft ? aft : (ap > bp ? aft : (bp > ap ? pref : (pref || aft)));
        if (!prod || (x.kind === 'count' && ap >= bp)) prod = aft || pref;
        if (!prod || prod.length < 2) prod = pref || aft;
        if (!prod || prod.length < 2) return; // don't invent a product.
        lines.push({ product: prod, raw: chunk.slice(Math.max(0, x.index - 100), Math.min(chunk.length, x.end + 95)), qty: x.qty, unit: x.unit, note: x.unit ? '' : 'Chưa nêu đơn vị — đối chiếu đơn vị Excel trước khi gửi ERP.' });
      });
      if (!all.length) {
        // Explicit "MÃ SP ... SL 32" without a physical unit.
        var re = /(?:m[aã]\s*sp|m[aã]\s*s[aả]n\s*ph[aẩ]m)\s*[:#-]?\s*([a-z0-9_.-]{3,40})[^\n]*?\b(?:sl|s[oố]\s*l[uượ]ng)\s*[:#-]?\s*(\d+(?:[.,]\d+)?)/ig;
        while ((m = re.exec(chunk))) lines.push({ product: m[1], raw: m[0], qty: Number(m[2].replace(',', '.')), unit: '', note: '' });
      }
    });
    if (!lines.length) throw new Error('Chưa xác định được dòng sản phẩm và số lượng. Ví dụ: “12 sản phẩm Wamlox”, “Wamlox 12 hộp” hoặc chọn tại 🧾 Đơn nhanh.');
    return { customer: c.customer, code: c.code, phone: '', address: '', lines: lines, note: '', cash: /\b(tien mat|tra tien mat|thanh toan tien mat)\b/.test(fold(text)) };
  }
  /* Nhập Excel XLSX không phụ thuộc CDN: đọc ZIP central directory và XML bảng tính.
   * XLS cũ (BIFF) không được hỗ trợ; yêu cầu lưu thành .xlsx hoặc .csv. */
  function csvRows(text, comma) {
    text = String(text || '').replace(/^\ufeff/, '');
    if (!comma) {
      var first = text.split(/\r?\n/, 1)[0] || '';
      comma = first.split('\t').length > first.split(';').length && first.split('\t').length > first.split(',').length ? '\t' : (first.split(';').length > first.split(',').length ? ';' : ',');
    }
    var out = [], row = [], cell = '', quoted = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (c === '"') {
        if (quoted && text[i + 1] === '"') { cell += '"'; i++; }
        else quoted = !quoted;
      } else if (c === comma && !quoted) { row.push(cell); cell = ''; }
      else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); out.push(row); row = []; cell = ''; }
      else cell += c;
    }
    if (cell || row.length) { row.push(cell); out.push(row); }
    return out;
  }
  function zipDirectory(bytes) {
    var dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), end = -1;
    for (var i = bytes.length - 22; i >= Math.max(0, bytes.length - 66000); i--)
      if (dv.getUint32(i, true) === 0x06054b50) { end = i; break; }
    if (end < 0) throw new Error('Tệp Excel XLSX không hợp lệ (thiếu ZIP directory).');
    var count = dv.getUint16(end + 10, true), off = dv.getUint32(end + 16, true), files = {};
    for (i = 0; i < count; i++) {
      if (dv.getUint32(off, true) !== 0x02014b50) throw new Error('Lỗi cấu trúc ZIP của Excel.');
      var method = dv.getUint16(off + 10, true), size = dv.getUint32(off + 20, true), fl = dv.getUint16(off + 28, true), ex = dv.getUint16(off + 30, true), cl = dv.getUint16(off + 32, true), local = dv.getUint32(off + 42, true);
      var name = new TextDecoder().decode(bytes.slice(off + 46, off + 46 + fl));
      files[name] = { method: method, size: size, local: local };
      off += 46 + fl + ex + cl;
    }
    return { files: files, dv: dv, bytes: bytes };
  }
  async function zipText(zip, name) {
    var f = zip.files[name]; if (!f) return '';
    if (f.size > 30 * 1024 * 1024) throw new Error('Bảng tính quá lớn; nên chia thành file Excel nhỏ hơn.');
    var dv = zip.dv, o = f.local;
    if (dv.getUint32(o, true) !== 0x04034b50) throw new Error('Lỗi dữ liệu trong ZIP.');
    var start = o + 30 + dv.getUint16(o + 26, true) + dv.getUint16(o + 28, true);
    var part = zip.bytes.slice(start, start + f.size), buf;
    if (f.method === 0) buf = part;
    else if (f.method === 8 && typeof DecompressionStream !== 'undefined') {
      try { buf = new Uint8Array(await new Response(new Blob([part]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer()); }
      catch (e) { throw new Error('Không giải nén được XLSX trên trình duyệt này; dùng Chrome mới hoặc xuất CSV.'); }
    } else throw new Error('Trình duyệt không hỗ trợ nén Excel; hãy xuất file CSV.');
    return new TextDecoder('utf-8').decode(buf);
  }
  function xmlDoc(t) {
    var x = new DOMParser().parseFromString(t, 'application/xml');
    if (x.querySelector('parsererror')) throw new Error('XML Excel không hợp lệ.');
    return x;
  }
  function childText(node, tag) {
    var a = node.getElementsByTagName(tag), v = a.length ? a[0] : null;
    return v ? v.textContent : '';
  }
  async function xlsxRows(file) {
    var bytes = new Uint8Array(await file.arrayBuffer()), zip = zipDirectory(bytes);
    var ss = await zipText(zip, 'xl/sharedStrings.xml'), shared = [];
    if (ss) {
      var doc = xmlDoc(ss); Array.from(doc.getElementsByTagName('si')).forEach(function (si) {
        shared.push(Array.from(si.getElementsByTagName('t')).map(function (x) { return x.textContent; }).join(''));
      });
    }
    var sheets = Object.keys(zip.files).filter(function (k) { return /^xl\/worksheets\/sheet\d+\.xml$/.test(k); }).sort(function (a, b) { return Number(a.match(/\d+(?=\.xml)/)[0]) - Number(b.match(/\d+(?=\.xml)/)[0]); }).slice(0, 10);
    if (!sheets.length) throw new Error('Excel không có trang tính nào.');
    var groups = [];
    for (var i = 0; i < sheets.length; i++) {
      var doc = xmlDoc(await zipText(zip, sheets[i])), rows = [];
      Array.from(doc.getElementsByTagName('row')).forEach(function (r) {
        var line = [];
        Array.from(r.getElementsByTagName('c')).forEach(function (c) {
          var ref = c.getAttribute('r') || '', letters = (ref.match(/^[A-Z]+/) || [''])[0], col = 0;
          for (var j = 0; j < letters.length; j++) col = col * 26 + (letters.charCodeAt(j) - 64);
          col = Math.max(0, col - 1);
          var v = childText(c, 'v');
          if (c.getAttribute('t') === 's') v = shared[Number(v)] || '';
          else if (c.getAttribute('t') === 'inlineStr') v = Array.from(c.getElementsByTagName('t')).map(function (t) { return t.textContent; }).join('');
          line[col] = v;
        });
        if (line.some(function (x) { return plain(x); })) rows.push(line);
      });
      if (rows.length) groups.push(rows);
    }
    return groups;
  }
  async function readExcel(file, what) {
    var name = plain(file && file.name).toLowerCase(); if (!name) throw new Error('Chưa chọn file Excel.');
    if (file.size > 8 * 1024 * 1024) throw new Error('Excel trên 8 MB dễ làm chậm điện thoại. Hãy chia file hoặc chỉ giữ cột Mã/Tên/ĐVT cần thiết.');
    var sheets;
    if (/\.xlsx$/.test(name)) sheets = await xlsxRows(file);
    else if (/\.(csv|tsv|txt)$/.test(name)) sheets = [csvRows(await file.text())];
    else throw new Error('Hãy chọn Excel .xlsx hoặc CSV, TSV, TXT (.xls cũ cần lưu lại thành .xlsx).');
    var files = sheets.map(function (r) { return { data: r }; });
    var rows = extract(what, { files: files });
    if (!rows.length) throw new Error('Không có danh sách hợp lệ: phải có cột Mã và Tên trong Excel.');
    return rows;
  }
  /* Đọc tệp khách gửi ngay trên Mobile; chỉ giữ văn bản rút gọn, không ghi vào Firebase. */
  async function readChatFile(file) {
    var name=String(file&&file.name||'').toLowerCase();
    if(!file||file.size>8*1024*1024)throw new Error('File lớn hơn 8 MB; vui lòng chia nhỏ.');
    var text='';
    if(/\.(csv|tsv|txt|md|json)$/.test(name)) text=(await file.text()).slice(0,60000);
    else if(/\.xlsx$/.test(name)) {
      var books=await xlsxRows(file);
      text=books.slice(0,3).map(function(rows,i){return 'BẢNG '+(i+1)+'\n'+rows.slice(0,100).map(function(c){return (c||[]).slice(0,20).map(function(v){return String(v||'').slice(0,160);}).join(' | ');}).join('\n');}).join('\n\n');
    } else if(/\.docx$/.test(name)) {
      var zip=zipDirectory(new Uint8Array(await file.arrayBuffer()));
      var xml=await zipText(zip,'word/document.xml');
      if(!xml) throw new Error('Word DOCX không có nội dung văn bản.');
      var doc=xmlDoc(xml);
      text=Array.from(doc.getElementsByTagName('w:p')).map(function(p){return Array.from(p.getElementsByTagName('w:t')).map(function(t){return t.textContent;}).join('');}).filter(Boolean).join('\n');
    } else if(/\.pdf$/.test(name)) {
      // Thư viện được nạp khi thật sự có PDF; không tăng thời gian khởi động Mobile.
      var pdf;
      try{pdf=await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs');}
      catch(e){throw new Error('Không tải được bộ đọc PDF. Hãy kiểm tra Internet hoặc dùng ảnh/JPG/Excel.');}
      pdf.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
      var doc=await pdf.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
      var parts=[];
      for(var i=1;i<=Math.min(doc.numPages,10);i++){
        var page=await doc.getPage(i),tc=await page.getTextContent();
        parts.push('TRANG '+i+'\n'+tc.items.map(function(x){return x.str||'';}).join(' '));
      }
      text=parts.join('\n');
      try{await doc.destroy();}catch(_){ }
      if(!text.trim()) throw new Error('PDF ảnh quét không có văn bản. Hãy gửi ảnh JPG/PNG của trang đơn hàng.');
    } else if(/\.xls$/.test(name)) throw new Error('Excel .xls cũ: vui lòng lưu lại dạng .xlsx hoặc .csv.');
    else throw new Error('Hỗ trợ Excel .xlsx, PDF, Word .docx, CSV, TXT, JSON.');
    return text.slice(0,15000);
  }
  var api = { extract: extract, parse: parse, readExcel: readExcel, readChatFile:readChatFile, csvRows: csvRows, fold: fold };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HuyenMobileCatalog = api;
})(typeof window === 'undefined' ? (typeof globalThis === 'undefined' ? this : globalThis) : window);
