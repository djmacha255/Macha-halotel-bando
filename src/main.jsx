import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const bundles = [
  { gb: 1, price: 1500, label: 'Mwanzo', detail: 'Kwa matumizi muhimu ya haraka', tone: 'blue' },
  { gb: 2, price: 2500, label: 'Kila siku', detail: 'Mitandao, mazungumzo na kuperuzi', tone: 'violet' },
  { gb: 3, price: 3500, label: 'Endelea kuunganishwa', detail: 'Tazama, tembelea na shiriki zaidi', tone: 'purple' },
  { gb: 5, price: 6000, label: 'Thamani bora', detail: 'Intaneti ya wiki yako', tone: 'green', popular: true },
  { gb: 6, price: 7000, label: 'Mtumiaji hodari', detail: 'Data zaidi, wasiwasi kidogo', tone: 'orange' },
  { gb: 10, price: 11000, label: 'Matumizi makubwa', detail: 'Kwa kazi na burudani', tone: 'pink' },
];

const money = (value) => new Intl.NumberFormat('en-TZ').format(value);
const maskPhone = (value) => value.length > 6 ? `${value.slice(0, 4)} *** ${value.slice(-3)}` : value;
const formatRecipientPhone = (value) => {
  const phone = normalizePhone(value || '');
  const intl = toInternationalFormat(phone);
  if (/^\+2556\d{7,8}$/.test(intl)) {
    return intl.slice(0, 6) + ' ' + intl.slice(6, 9) + ' ' + intl.slice(9);
  }
  return intl || 'Haijawekwa';
};
const paymentNumber = import.meta.env.VITE_HALOPESA_NUMBER || '0621400800';
const paymentName = import.meta.env.VITE_HALOPESA_NAME || 'AMANI MACHA';
const adminUsername = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'Macha255!';
const formatPaymentNumber = (value) => value.length === 10 ? `${value.slice(0, 4)} ${value.slice(4, 7)} ${value.slice(7)}` : value;
const defaultSettings = { businessName: 'MACHA 255 DATA HUB', tagline: 'Data inayokwenda na wewe.', paymentNumber, paymentName, minCustomGb: 1, maxCustomGb: 100, customEnabled: true, announcement: 'Vifurushi vya Halotel kwa haraka, bei nafuu na salama.', bundlePrices: { 1: 1500, 2: 2500, 3: 3500, 5: 6000, 6: 7000, 10: 11000 }, customFormula: { baseGb: 1, basePrice: 1500, step: 1000, midGb: 5, midPrice: 6000, midStep: 1000 } };
const readSettings = () => {
  try { return { ...defaultSettings, ...JSON.parse(localStorage.getItem('macha-settings') || '{}') }; } catch { return defaultSettings; }
};
const writeSettings = (settings) => localStorage.setItem('macha-settings', JSON.stringify(settings));
const customPrice = (gb, settings = defaultSettings) => {
  const f = settings.customFormula || defaultSettings.customFormula;
  if (gb <= f.baseGb) return f.basePrice;
  if (gb < f.midGb) return f.basePrice + ((gb - f.baseGb) * f.step);
  return f.midPrice + ((gb - f.midGb) * f.midStep);
};
const readOrders = () => {
  try {
    const value = JSON.parse(localStorage.getItem('halo-orders') || '[]');
    return Array.isArray(value) ? value.map(order => ({
      ...order,
      status: order.status === 'Inasubiri' ? 'Pending' : order.status === 'Imekamilika' ? 'Completed' : order.status,
    })) : [];
  } catch {
    return [];
  }
};
const writeOrders = (orders) => localStorage.setItem('halo-orders', JSON.stringify(orders));
const normalizePhone = (value) => value.replace(/\s/g, '');
const isHalotelNumber = (phone) => {
  const normalized = normalizePhone(phone);
  return /^(\+2556|2556|6)\d{7,8}$/.test(normalized);
};
const toInternationalFormat = (phone) => {
  const normalized = normalizePhone(phone);
  if (normalized.startsWith('+255')) return normalized;
  if (normalized.startsWith('255')) return '+' + normalized;
  if (normalized.startsWith('6')) return '+255' + normalized;
  if (normalized.startsWith('0')) return '+255' + normalized.slice(1);
  return '+255' + normalized;
};
const getCustomerOrders = (phone) => {
  const intl = toInternationalFormat(phone);
  return readOrders().filter(order => order.recipientPhone === intl);
};
const readCustomers = () => {
  try {
    const value = JSON.parse(localStorage.getItem('macha-customers') || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};
const writeCustomers = (customers) => localStorage.setItem('macha-customers', JSON.stringify(customers));
const currentCustomer = () => {
  try {
    const phone = sessionStorage.getItem('macha-customer-phone');
    return readCustomers().find(customer => customer.phone === phone) || null;
  } catch {
    return null;
  }
};
const copyText = async (value) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return true;
  }
  const input = document.createElement('textarea');
  input.value = value;
  input.setAttribute('readonly', '');
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  const copied = document.execCommand('copy');
  input.remove();
  return copied;
};

function Icon({ name, size = 20 }) {
  const paths = {
    bolt: <path d="m13 2-9 11h7l-1 9 9-12h-7l1-8Z" />,
    shield: <path d="M12 3 4 6v5c0 5.2 3.4 8.9 8 10 4.6-1.1 8-4.8 8-10V6l-8-3Zm-3 9 2 2 4-4" />,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    check: <path d="m5 12 4 4L19 6" />,
    copy: <><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    chart: <><path d="M4 19V5m0 14h16" /><path d="m7 15 3-4 3 2 5-7" /></>,
    clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    inbox: <><path d="M4 4h16v13H4z" /><path d="M4 13h4l1.5 2h5L16 13h4" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Header({ page, setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const goTo = (nextPage) => { setPage(nextPage); setMenuOpen(false); };
  return <header className="topbar">
    <div className="container nav">
      <button className="brand" onClick={() => goTo('shop')}><span className="brand-mark"><Icon name="bolt" size={16} /></span><span>MACHA <span className="brand-accent">255 DATA HUB</span></span></button>
      <nav className="desktop-nav">
        <button className={page === 'shop' ? 'active' : ''} onClick={() => goTo('shop')}>Nunua vifurushi</button>
        <button className={page === 'how' ? 'active' : ''} onClick={() => goTo('how')}>Jinsi inavyofanya kazi</button>
        <button className={page === 'track' ? 'active' : ''} onClick={() => goTo('track')}>Fuatilia oda</button>
        <button className={page === 'account' ? 'active' : ''} onClick={() => goTo('account')}>Akaunti yangu</button>
        <button className={page === 'admin' ? 'active' : ''} onClick={() => goTo('admin')}>Eneo la muuzaji</button>
      </nav>
      <div className="nav-end"><span className="live-dot"></span><span className="live-label">Moja kwa moja na salama</span><button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Fungua menyu"><Icon name="menu" /></button></div>
    </div>
    {menuOpen && <nav className="mobile-nav"><button onClick={() => goTo('shop')}>Nunua vifurushi</button><button onClick={() => goTo('how')}>Jinsi inavyofanya kazi</button><button onClick={() => goTo('track')}>Fuatilia oda</button><button onClick={() => goTo('account')}>Akaunti yangu</button><button onClick={() => goTo('admin')}>Eneo la muuzaji</button></nav>}
  </header>;
}

function BundleCard({ bundle, selected, onSelect }) {
  return <button className={`bundle-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(bundle)}>
    {bundle.popular && <span className="popular">INAYOPENDEKEZWA</span>}
    <div className={`bundle-icon ${bundle.tone}`}><span>{bundle.gb}</span><small>GB</small></div>
    <div className="bundle-copy"><strong>{bundle.label}</strong><span>{bundle.detail}</span></div>
    <div className="bundle-price"><strong>TZS {money(bundle.price)}</strong><span>malipo ya mara moja</span></div>
    <span className={`radio ${selected ? 'checked' : ''}`}>{selected && <Icon name="check" size={12} />}</span>
  </button>;
}

function Shop({ setPage }) {
  const settings = readSettings();
  const bundleList = bundles.map(bundle => ({ ...bundle, price: settings.bundlePrices?.[bundle.gb] ?? bundle.price }));
  const [selected, setSelected] = useState(bundleList[3]);
  const [customGb, setCustomGb] = useState(15);
  const [usingCustom, setUsingCustom] = useState(false);
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const submitPhone = (event) => {
    event.preventDefault();
    if (!customerName.trim()) return setError('Weka jina lako.');
    if (!isHalotelNumber(phone)) return setError('Namba ya Halotel lazima iwe 0612345678 au +2556XXXXXXXX.');
    setError(''); setStep(2);
  };
  const submitOrder = (event) => {
    event.preventDefault();
    if (code.trim().length < 4) return setError('Weka namba ya muamala kutoka kwenye SMS ya malipo.');
    const id = `HB-${Math.floor(10000 + Math.random() * 89999)}`;
    const chosen = usingCustom ? { gb: customGb, price: customPrice(customGb, settings) } : selected;
    const next = { id, customerName: customerName.trim(), recipientPhone: toInternationalFormat(phone), phone: maskPhone(phone), gb: chosen.gb, amount: chosen.price, code: code.toUpperCase(), status: 'Pending', time: 'sasa hivi', createdAt: new Date().toISOString(), comments: [], feedback: null };
    const orders = readOrders();
    writeOrders([next, ...orders]);
    const customers = readCustomers();
    const intlPhone = toInternationalFormat(phone);
    const customerIndex = customers.findIndex(customer => customer.phone === intlPhone);
    if (customerIndex >= 0) {
      customers[customerIndex] = { ...customers[customerIndex], points: (customers[customerIndex].points || 0) + 10, orderCount: (customers[customerIndex].orderCount || 0) + 1 };
      writeCustomers(customers);
    }
    setOrder(next); setError('');
  };
  return <main>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="spark">✦</span> Njia rahisi ya kuendelea kuunganishwa</div>
          <h1>{settings.tagline.split(' ').slice(0, 3).join(' ')}<br /><em>{settings.tagline.split(' ').slice(3).join(' ')}</em></h1>
          <p>{settings.announcement}</p>
          <div className="hero-proof"><span className="avatars"><i>J</i><i>M</i><i>A</i><i>+</i></span><span><strong>10,000+</strong> vifurushi vimesambazwa</span></div>
        </div>
        <div className="order-panel">
          <div className="panel-head"><div><span className="step-label">HATUA {step} YA 2</span><h2>{step === 1 ? 'Chagua kifurushi' : 'Kamilisha malipo'}</h2></div><span className="secure"><Icon name="shield" size={15} /> Salama</span></div>
          <div className="progress"><span className={step === 2 ? 'full' : ''}></span></div>
          {!order ? step === 1 ? <form onSubmit={submitPhone}>
            <div className="bundle-list">{bundleList.map(bundle => <BundleCard key={bundle.gb} bundle={bundle} selected={!usingCustom && selected.gb === bundle.gb} onSelect={bundle => { setSelected(bundle); setUsingCustom(false); }} />)}</div>
            {settings.customEnabled && <div className={`custom-bundle ${usingCustom ? 'selected' : ''}`}><div><span className="custom-kicker">CHAGUA KIASI CHAKO</span><strong>{customGb} GB · TZS {money(customPrice(customGb, settings))}</strong><small>Bei inahesabiwa kwa mpangilio wa MACHA</small></div><input type="number" min={settings.minCustomGb} max={settings.maxCustomGb} value={customGb} onChange={event => { setCustomGb(Math.max(settings.minCustomGb, Math.min(settings.maxCustomGb, Number(event.target.value) || settings.minCustomGb))); setUsingCustom(true); }} /><button type="button" className="complete" onClick={() => setUsingCustom(true)}>{usingCustom ? 'Imechaguliwa' : 'Chagua'}</button></div>}
            <div className="field"><label>Jina lako</label><input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Andika jina lako" autoComplete="name" /></div>
            <div className="field"><label>Namba ya Halotel</label><div className="input-wrap"><span>+255</span><input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="612345678" inputMode="numeric" /></div><small>Kifurushi kitatumwa kwenye namba hii</small></div>
            {error && <div className="error">{error}</div>}
            <button className="primary wide" type="submit">Endelea kulipa <Icon name="arrow" size={17} /></button>
          </form> : <form onSubmit={submitOrder}>
            <div className="payment-summary"><span>Unanunua</span><strong>{usingCustom ? customGb : selected.gb} GB <b>•</b> TZS {money(usingCustom ? customPrice(customGb, settings) : selected.price)}</strong><button type="button" onClick={() => { setStep(1); setError(''); }}>Badilisha</button></div>
            <div className="payment-box"><div className="payment-title"><span className="halo-pesa">H</span><div><strong>Lipa kwa HaloPesa</strong><small>Tuma pesa kwenye namba ya muuzaji hapa chini</small></div></div><div className="pay-number"><span>Namba ya HaloPesa</span><strong>{formatPaymentNumber(settings.paymentNumber)}</strong><button type="button" onClick={() => copyText(settings.paymentNumber)}><Icon name="copy" size={15} /> Nakili</button></div><div className="pay-number"><span>Jina la mpokeaji</span><strong>{settings.paymentName}</strong></div><p className="instruction">Fungua HaloPesa App au USSD ya HaloPesa, tuma kiasi kilichoonyeshwa na weka PIN yako ndani ya njia rasmi ya HaloPesa pekee. <b>Usiweke PIN kwenye tovuti hii.</b></p><p className="instruction">Baada ya malipo, weka <b>namba ya muamala</b> kutoka kwenye SMS ya HaloPesa.</p></div>
            <div className="field"><label>Namba ya muamala</label><input className="code-input" value={code} onChange={e => setCode(e.target.value.slice(0, 12))} placeholder="mfano HP91K2" autoCapitalize="characters" /><small>Mara nyingi huwa na herufi 6–10</small></div>
            {error && <div className="error">{error}</div>}<button className="primary wide" type="submit">Tuma oda <Icon name="arrow" size={17} /></button><button className="back-link" type="button" onClick={() => setStep(1)}>← Rudi</button>
          </form> : <Success order={order} setPage={setPage} />}
        </div>
      </div>
    </section>
    <section className="trust-strip"><div className="container"><span><Icon name="bolt" size={17} /> Kutumwa papo hapo</span><span><Icon name="shield" size={17} /> Malipo salama</span><span><Icon name="check" size={17} /> Msaada unapouhitaji</span></div></section>
  </main>;
}

function Success({ order, setPage }) {
  return <div className="success"><div className="success-icon"><Icon name="check" size={30} /></div><h2>Oda imepokelewa!</h2><p>Kifurushi chako cha <strong>{order.gb} GB</strong> kinashughulikiwa. Tutakituma kwenye <strong>{order.phone}</strong> muda mfupi.</p><div className="order-id"><span>NAMBA YA ODA</span><strong>{order.id}</strong></div><button className="primary wide" onClick={() => setPage('shop')}>Nunua kifurushi kingine <Icon name="arrow" size={17} /></button><p className="help">Unahitaji msaada? <a href="mailto:hello@halobundle.co.tz">hello@halobundle.co.tz</a></p></div>;
}

function HowItWorks() {
  return <main className="simple-page"><div className="container narrow"><div className="eyebrow"><span className="spark">✦</span> Rahisi kwa makusudi</div><h1>Kuanzia mwanzo hadi<br /><em>kuunganishwa.</em></h1><p className="lead">Kifurushi chako kijacho kinapatikana kwa hatua tatu rahisi.</p><div className="steps">{[['01', 'Chagua data yako', 'Chagua ukubwa wa kifurushi unaokufaa. Bei kamili inaonekana kabla ya kulipa.'], ['02', 'Lipa kwa HaloPesa', 'Tuma kiasi sahihi kwenye namba yetu ya HaloPesa kwa kutumia simu yako.'], ['03', 'Tuma namba yako', 'Weka namba ya muamala na tutatuma kifurushi kwenye laini yako ya Halotel.']].map(([n, title, text]) => <div className="step" key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div><div className="notice"><Icon name="shield" size={20} /><div><strong>Malipo yako yanalindwa</strong><p>Hatuombi PIN yako. Tuma tu namba ya muamala inayotolewa baada ya malipo kufanikiwa.</p></div></div></div></main>;
}

function TrackOrders() {
  const [phone, setPhone] = useState('');
  const [orderId, setOrderId] = useState('');
  const [orders, setOrders] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [message, setMessage] = useState('');
  const search = (event) => {
    event.preventDefault();
    const intl = toInternationalFormat(phone);
    const matches = readOrders().filter(order => (!phone || order.recipientPhone === intl) && (!orderId || order.id.toLowerCase() === orderId.trim().toLowerCase()));
    setOrders(matches);
    setMessage(matches.length ? '' : 'Hakuna oda iliyopatikana kwa taarifa ulizoingiza.');
  };
  const saveFeedback = (order) => {
    const next = readOrders().map(item => item.id === order.id ? { ...item, feedback: feedback[order.id] || item.feedback } : item);
    writeOrders(next); setOrders(next.filter(item => item.id === order.id)); setMessage('Maoni yako yamehifadhiwa. Asante!');
  };
  return <main className="simple-page"><div className="container track-page"><div className="eyebrow"><span className="spark">✦</span> Huduma kwa mteja</div><h1>Fuatilia oda<br /><em>yako.</em></h1><p className="lead">Weka namba ya Halotel au namba ya oda kuona historia na hali ya kifurushi chako.</p><form className="track-form" onSubmit={search}><div className="field"><label>Namba ya Halotel</label><input value={phone} onChange={event => setPhone(event.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="0612345678 au +2556XXXXXXXX" /></div><div className="track-or">au</div><div className="field"><label>Namba ya oda</label><input value={orderId} onChange={event => setOrderId(event.target.value)} placeholder="HB-12345" /></div><button className="primary" type="submit">Tafuta oda <Icon name="arrow" size={17} /></button></form>{message && <div className="notice track-message"><Icon name="check" size={20} /><div>{message}</div></div>}<div className="history-list">{orders.map(order => <article className="history-card" key={order.id}><div className="history-top"><div><span className="eyebrow">ODA {order.id}</span><h3>{order.gb} GB · TZS {money(order.amount)}</h3></div><span className={`status ${order.status === 'Completed' ? 'completed' : 'pending'}`}><i></i>{order.status === 'Completed' ? 'Imekamilika' : 'Inasubiri'}</span></div><p>Mpokeaji: <strong>{order.recipientPhone || order.phone}</strong> · Muamala: <code>{order.code}</code></p><div className="status-line"><span className="status-step done">Oda imepokelewa</span><span className={`status-step ${order.status === 'Completed' ? 'done' : ''}`}>Kifurushi kimetumwa</span></div><div className="feedback-row"><input value={feedback[order.id] ?? order.feedback ?? ''} onChange={event => setFeedback({ ...feedback, [order.id]: event.target.value })} placeholder="Andika maoni au feedback..." /><button className="complete" onClick={() => saveFeedback(order)}>Tuma maoni</button></div></article>)}</div></div></main>;
}

function Account() {
  const [customer, setCustomer] = useState(currentCustomer);
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referral, setReferral] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const submit = (event) => {
    event.preventDefault();
    const normalized = normalizePhone(phone);
    if (!isHalotelNumber(normalized)) return setError('Namba ya Halotel lazima iwe 0612345678 au +2556XXXXXXXX.');
    if (password.length < 6) return setError('Nenosiri liwe na angalau herufi 6.');
    const intlPhone = toInternationalFormat(normalized);
    const customers = readCustomers();
    if (mode === 'login') {
      const found = customers.find(item => item.phone === intlPhone && item.password === password);
      if (!found) return setError('Namba au nenosiri si sahihi.');
      sessionStorage.setItem('macha-customer-phone', intlPhone); setCustomer(found); setError(''); return;
    }
    if (!name.trim()) return setError('Weka jina lako.');
    if (customers.some(item => item.phone === intlPhone)) return setError('Akaunti ya namba hii tayari ipo.');
    const code = `MACHA${intlPhone.slice(-4)}`;
    const referrer = customers.find(item => item.referralCode && item.referralCode.toUpperCase() === referral.trim().toUpperCase());
    const newCustomer = { name: name.trim(), phone: intlPhone, password, referralCode: code, points: 0, orderCount: 0, createdAt: new Date().toISOString() };
    if (referrer) {
      referrer.points = (referrer.points || 0) + 100;
      writeCustomers([...customers.filter(item => item.phone !== referrer.phone), referrer, newCustomer]);
      setNotice('Akaunti imefunguliwa. Mwaliko umetambuliwa na zawadi imeongezwa kwa aliyekualika.');
    } else {
      writeCustomers([...customers, newCustomer]);
      setNotice('Akaunti imefunguliwa. Karibu kwenye MACHA 255 DATA HUB!');
    }
    sessionStorage.setItem('macha-customer-phone', intlPhone); setCustomer(newCustomer); setError('');
  };
  const logout = () => { sessionStorage.removeItem('macha-customer-phone'); setCustomer(null); setMode('login'); };
  if (customer) {
    const orders = getCustomerOrders(customer.phone);
    return <main className="simple-page account-page"><div className="container"><div className="account-head"><div><div className="eyebrow"><span className="spark">✦</span> Akaunti yangu</div><h1>Karibu, <em>{customer.name.split(' ')[0]}.</em></h1><p className="lead">Fuatilia oda zako, pointi na zawadi zako hapa.</p></div><button className="logout" onClick={logout}>Toka</button></div><div className="reward-card"><div><span className="eyebrow">POINTI ZAKO</span><strong>{customer.points || 0}</strong><small>pointi = TZS {money((customer.points || 0) * 10)} thamani ya zawadi</small></div><div className="referral-box"><span>KODI YAKO YA MWALIKO</span><strong>{customer.referralCode}</strong><small>Mwalike rafiki, upate pointi 100</small><button className="complete" onClick={() => copyText(customer.referralCode)}>Nakili kodi</button></div></div><div className="account-grid"><section className="orders-card"><div className="orders-toolbar"><div><h2>Historia ya oda</h2><p>Oda zako zote zitaonekana hapa.</p></div></div>{orders.length === 0 ? <div className="empty-orders"><h3>Hakuna oda bado</h3><p>Nunua kifurushi chako cha kwanza ili uanze historia yako.</p></div> : <div className="history-list">{orders.map(order => <div className="history-card" key={order.id}><div className="history-top"><div><span className="eyebrow">{order.id}</span><h3>{order.gb} GB · TZS {money(order.amount)}</h3></div><span className={`status ${order.status === 'Completed' ? 'completed' : 'pending'}`}><i></i>{order.status === 'Completed' ? 'Imekamilika' : 'Inasubiri'}</span></div><p>Namba inayopokea: <strong>{order.recipientPhone}</strong></p></div>)}</div>}</section><section className="benefit-card"><span className="metric-icon purple"><Icon name="bolt" /></span><h2>Jipatie zawadi</h2><p>Pata pointi 10 kila unapofanya oda. Mwalike rafiki kwa kodi yako, ukipata pointi 100 akifungua akaunti.</p><div className="benefit-list"><span>✓ Pointi kwa kila oda</span><span>✓ Pointi kwa kila rafiki</span><span>✓ Zawadi za data zinakuja</span></div></section></div></div></main>;
  }
  return <main className="simple-page account-page"><div className="container account-auth"><div className="login-card"><div className="login-brand"><span className="brand-mark"><Icon name="bolt" size={18} /></span><span>MACHA <b>255 DATA HUB</b></span></div><div className="eyebrow"><span className="spark">✦</span> Akaunti ya mteja</div><h1>{mode === 'login' ? 'Karibu tena.' : 'Anza kupata zawadi.'}</h1><p>{mode === 'login' ? 'Ingia kuona historia ya oda na pointi zako.' : 'Fungua akaunti bure, pata pointi na mwalike rafiki.'}</p>{mode === 'register' && <div className="field"><label>Jina kamili</label><input value={name} onChange={event => setName(event.target.value)} placeholder="Jina lako" /></div>}<div className="field"><label>Namba ya Halotel</label><input value={phone} onChange={event => setPhone(event.target.value.replace(/\D/g, '').slice(0, 12))} placeholder="0612345678 au +2556XXXXXXXX" /></div><div className="field"><label>Nenosiri</label><input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Angalau herufi 6" /></div>{mode === 'register' && <div className="field"><label>Kodi ya mwaliko (si lazima)</label><input value={referral} onChange={event => setReferral(event.target.value)} placeholder="MACHA1234" /></div>}{error && <div className="error">{error}</div>}{notice && <div className="notice">{notice}</div>}<button className="primary wide" onClick={submit}>{mode === 'login' ? 'Ingia' : 'Fungua akaunti'} <Icon name="arrow" size={17} /></button><button className="back-link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setNotice(''); }}>{mode === 'login' ? 'Sina akaunti — Jisajili' : 'Nina akaunti — Ingia'}</button></div></div></main>;
}

function Admin() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('macha-admin-auth') === 'true');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [orders, setOrders] = useState(() => readOrders());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [settings, setSettings] = useState(readSettings);
  const [adminTab, setAdminTab] = useState('orders');
  const [filter, setFilter] = useState('Zote');
  const update = (id) => { const next = orders.map(item => item.id === id ? { ...item, status: 'Completed', completedAt: new Date().toISOString() } : item); setOrders(next); writeOrders(next); setSelectedOrder(next.find(item => item.id === id) || null); };
  const visible = filter === 'Zote' ? orders : orders.filter(item => item.status === (filter === 'Inasubiri' ? 'Pending' : 'Completed'));
  const pending = orders.filter(o => o.status === 'Pending').length;
  const saveSettings = (event) => { event.preventDefault(); writeSettings(settings); setAdminTab('orders'); };
  const login = (event) => {
    event.preventDefault();
    if (username.trim() !== adminUsername || password !== adminPassword) {
      setLoginError('Jina la mtumiaji au nenosiri si sahihi.');
      return;
    }
    sessionStorage.setItem('macha-admin-auth', 'true');
    setAuthenticated(true);
    setLoginError('');
  };
  if (!authenticated) return <main className="admin-page"><div className="container login-container"><form className="login-card" onSubmit={login}><div className="login-brand"><span className="brand-mark"><Icon name="bolt" size={18} /></span><span>MACHA <b>255 DATA HUB</b></span></div><div className="eyebrow"><span className="spark">✦</span> Eneo la muuzaji</div><h1>Ingia kwenye<br /><em>dashboard.</em></h1><p>Weka taarifa zako ili kuona na kushughulikia oda za wateja.</p><div className="field"><label>Jina la mtumiaji</label><input value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" placeholder="admin" /></div><div className="field"><label>Nenosiri</label><input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" placeholder="••••••••" /></div>{loginError && <div className="error">{loginError}</div>}<button className="primary wide" type="submit">Ingia <Icon name="arrow" size={17} /></button><small className="login-note">Kwa preview ya sasa: admin / Macha255!</small></form></div></main>;
  if (adminTab === 'settings') return <main className="admin-page"><div className="container"><div className="admin-head"><div><div className="eyebrow"><span className="spark">✦</span> Direct control</div><h1>Customize <em>mfumo.</em></h1><p>Badili taarifa za biashara, malipo na chaguo za mteja bila kugusa code.</p></div><button className="logout" onClick={() => setAdminTab('orders')}>← Rudi kwenye oda</button></div><form className="settings-card" onSubmit={saveSettings}><div className="settings-section"><h2>Utambulisho wa biashara</h2><div className="settings-grid"><div className="field"><label>Jina la biashara</label><input value={settings.businessName} onChange={event => setSettings({ ...settings, businessName: event.target.value })} /></div><div className="field"><label>Ujumbe mkuu</label><input value={settings.tagline} onChange={event => setSettings({ ...settings, tagline: event.target.value })} /></div><div className="field full"><label>Announcement kwa wateja</label><textarea value={settings.announcement} onChange={event => setSettings({ ...settings, announcement: event.target.value })} /></div></div></div><div className="settings-section"><h2>Malipo ya HaloPesa</h2><div className="settings-grid"><div className="field"><label>Namba ya malipo</label><input value={settings.paymentNumber} onChange={event => setSettings({ ...settings, paymentNumber: event.target.value.replace(/\D/g, '').slice(0, 10) })} /></div><div className="field"><label>Jina la mpokeaji</label><input value={settings.paymentName} onChange={event => setSettings({ ...settings, paymentName: event.target.value })} /></div></div></div><div className="settings-section"><h2>Kifurushi custom</h2><div className="settings-grid"><div className="field"><label>GB ya chini</label><input type="number" min="1" value={settings.minCustomGb} onChange={event => setSettings({ ...settings, minCustomGb: Number(event.target.value) })} /></div><div className="field"><label>GB ya juu</label><input type="number" min="1" value={settings.maxCustomGb} onChange={event => setSettings({ ...settings, maxCustomGb: Number(event.target.value) })} /></div></div><label className="toggle-row"><input type="checkbox" checked={settings.customEnabled} onChange={event => setSettings({ ...settings, customEnabled: event.target.checked })} /><span>Ruhusu wateja kuweka ukubwa wao wa GB</span></label></div><div className="settings-section"><h2>Bei za vifurushi</h2><div className="settings-grid">{bundles.map(bundle => <div className="field" key={bundle.gb}><label>{bundle.gb} GB (TZS)</label><input type="number" min="0" value={settings.bundlePrices?.[bundle.gb] ?? bundle.price} onChange={event => setSettings({ ...settings, bundlePrices: { ...settings.bundlePrices, [bundle.gb]: Number(event.target.value) } })} /></div>)}</div></div><div className="settings-section"><h2>Mpangilio wa bei ya custom</h2><div className="settings-grid"><div className="field"><label>GB ya msingi</label><input type="number" min="0" value={settings.customFormula?.baseGb ?? 1} onChange={event => setSettings({ ...settings, customFormula: { ...settings.customFormula, baseGb: Number(event.target.value) } })} /></div><div className="field"><label>Bei ya msingi (TZS)</label><input type="number" min="0" value={settings.customFormula?.basePrice ?? 1500} onChange={event => setSettings({ ...settings, customFormula: { ...settings.customFormula, basePrice: Number(event.target.value) } })} /></div><div className="field"><label>Ongezeko kwa GB (TZS)</label><input type="number" min="0" value={settings.customFormula?.step ?? 1000} onChange={event => setSettings({ ...settings, customFormula: { ...settings.customFormula, step: Number(event.target.value) } })} /></div><div className="field"><label>GB ya kati</label><input type="number" min="1" value={settings.customFormula?.midGb ?? 5} onChange={event => setSettings({ ...settings, customFormula: { ...settings.customFormula, midGb: Number(event.target.value) } })} /></div><div className="field"><label>Bei ya kati (TZS)</label><input type="number" min="0" value={settings.customFormula?.midPrice ?? 6000} onChange={event => setSettings({ ...settings, customFormula: { ...settings.customFormula, midPrice: Number(event.target.value) } })} /></div><div className="field"><label>Ongezeko juu ya kati (TZS)</label><input type="number" min="0" value={settings.customFormula?.midStep ?? 1000} onChange={event => setSettings({ ...settings, customFormula: { ...settings.customFormula, midStep: Number(event.target.value) } })} /></div></div></div><button className="primary wide" type="submit">Hifadhi settings <Icon name="check" size={16} /></button></form></div></main>;
  return <main className="admin-page"><div className="container"><div className="admin-head"><div><div className="eyebrow"><span className="spark">✦</span> Eneo la muuzaji</div><h1>Habari za mchana, <em>muuzaji.</em></h1><p>Fuatilia oda halisi zinazoingia na zikamilishe kwa kugusa mara moja.</p></div><div className="admin-actions"><button className="settings-button" onClick={() => setAdminTab('settings')}>⚙ Settings</button><span className="admin-live"><i></i> Taarifa za moja kwa moja</span><button className="logout" onClick={() => { sessionStorage.removeItem('macha-admin-auth'); setAuthenticated(false); }}>Toka</button></div></div><div className="metrics"><div><span className="metric-icon blue"><Icon name="grid" /></span><small>ODA HALISI</small><strong>{orders.length}</strong><span className="muted">Zilizohifadhiwa kwenye kifaa hiki</span></div><div><span className="metric-icon orange"><Icon name="clock" /></span><small>ZINAZOSUBIRI</small><strong>{pending}</strong><span className="muted">Zinahitaji hatua yako</span></div><div><span className="metric-icon green"><Icon name="chart" /></span><small>JUMLA YA THAMANI</small><strong>TZS {money(orders.reduce((sum, o) => sum + o.amount, 0))}</strong><span className="muted">Kutoka kwenye oda halisi</span></div></div><div className="orders-card"><div className="orders-toolbar"><div><h2>Oda halisi zinazoingia</h2><p>Bonyeza oda yoyote kuifungua na kuona maelezo yote.</p></div><div className="filters">{['Zote', 'Inasubiri', 'Imekamilika'].map(item => <button className={filter === item ? 'selected' : ''} key={item} onClick={() => setFilter(item)}>{item}{item === 'Inasubiri' && <b>{pending}</b>}</button>)}</div></div>{visible.length === 0 ? <div className="empty-orders"><span className="empty-icon"><Icon name="inbox" size={25} /></span><h3>Hakuna oda bado</h3><p>Oda mpya itaonekana hapa baada ya mteja kutuma oda kupitia ukurasa wa ununuzi.</p></div> : <div className="table-wrap"><table><thead><tr><th>ODA</th><th>MHUSIKA / NAMBA YA KUPokea</th><th>KIFURUSHI</th><th>NAMBA YA MUAMALA</th><th>HALI</th><th></th></tr></thead><tbody>{visible.map(item => <tr className="order-row" key={item.id} onClick={() => setSelectedOrder(item)}><td><strong>{item.id}</strong><small>{item.time}</small></td><td><strong>{item.customerName || 'Mteja'}</strong><small className="full-recipient-phone">{formatRecipientPhone(item.recipientPhone || item.phone)}</small></td><td><span className="table-bundle">{item.gb} GB</span><small>TZS {money(item.amount)}</small></td><td><code>{item.code}</code></td><td><span className={`status ${item.status === 'Completed' ? 'completed' : 'pending'}`}><i></i>{item.status === 'Completed' ? 'Imekamilika' : 'Inasubiri'}</span></td><td>{item.status === 'Pending' && <button className="complete" onClick={(event) => { event.stopPropagation(); update(item.id); }}>Kamilisha <Icon name="check" size={14} /></button>}</td></tr>)}</tbody></table></div>}</div></div>{selectedOrder && <div className="order-modal-backdrop" onClick={() => setSelectedOrder(null)}><section className="order-modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={() => setSelectedOrder(null)}>×</button><div className="eyebrow"><span className="spark">✦</span> Maelezo ya oda</div><h2>{selectedOrder.id}</h2><div className="detail-grid"><div><small>JINA LA MTEJA</small><strong>{selectedOrder.customerName || 'Mteja'}</strong></div><div><small>NAMBA KAMILI INAYOPOKEA</small><strong className="modal-phone">{formatRecipientPhone(selectedOrder.recipientPhone || selectedOrder.phone)}</strong><button className="copy-phone" onClick={() => copyText(normalizePhone(selectedOrder.recipientPhone || selectedOrder.phone))}>Nakili namba</button></div><div><small>KIFURUSHI / KIASI</small><strong>{selectedOrder.gb} GB · TZS {money(selectedOrder.amount)}</strong></div><div><small>MUAMALA</small><strong>{selectedOrder.code}</strong></div></div><div className="customer-comment"><small>MAONI YA MTEJA</small><p>{selectedOrder.feedback || 'Hakuna maoni bado.'}</p></div><div className="modal-status"><span className={`status ${selectedOrder.status === 'Completed' ? 'completed' : 'pending'}`}><i></i>{selectedOrder.status === 'Completed' ? 'Imekamilika' : 'Inasubiri'}</span><span>{selectedOrder.time}</span></div>{selectedOrder.status === 'Pending' && <button className="primary wide" onClick={() => update(selectedOrder.id)}>Kamilisha oda <Icon name="check" size={16} /></button>}</section></div>}</main>;
}

function App() {
  const [page, setPage] = useState('shop');
  return <><Header page={page} setPage={setPage} />{page === 'shop' && <Shop setPage={setPage} />}{page === 'how' && <HowItWorks />}{page === 'track' && <TrackOrders />}{page === 'account' && <Account />}{page === 'admin' && <Admin />}<footer><div className="container"><span className="brand"><span className="brand-mark"><Icon name="bolt" size={14} /></span> MACHA <span className="brand-accent">255 DATA HUB</span></span><span>Imejengwa kwa Tanzania <span className="flag">🇹🇿</span></span><span>© 2026 MACHA 255 DATA HUB</span></div></footer></>;
}

createRoot(document.getElementById('root')).render(<App />);
