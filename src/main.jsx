import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const bundles = [
  { gb: 1, price: 1500, label: 'Quick start', detail: 'Perfect for a few essentials', tone: 'blue' },
  { gb: 2, price: 2500, label: 'Everyday', detail: 'Social, chats & light browsing', tone: 'violet' },
  { gb: 3, price: 3500, label: 'Stay connected', detail: 'Stream, scroll & share more', tone: 'purple' },
  { gb: 5, price: 6000, label: 'Best value', detail: 'Your week, covered', tone: 'green', popular: true },
  { gb: 6, price: 7000, label: 'Power user', detail: 'More data, less worry', tone: 'orange' },
  { gb: 10, price: 11000, label: 'Heavy hitter', detail: 'For work and entertainment', tone: 'pink' },
];

const initialOrders = [
  { id: 'HB-24091', phone: '0621  ***  482', gb: 5, amount: 6000, code: 'HP91K2', status: 'Pending', time: '2 min ago' },
  { id: 'HB-24090', phone: '0715  ***  109', gb: 1, amount: 1500, code: 'HP88F4', status: 'Completed', time: '8 min ago' },
  { id: 'HB-24089', phone: '0688  ***  734', gb: 10, amount: 11000, code: 'HP72Q9', status: 'Pending', time: '14 min ago' },
];

const money = (value) => new Intl.NumberFormat('en-TZ').format(value);
const maskPhone = (value) => value.length > 6 ? `${value.slice(0, 4)} *** ${value.slice(-3)}` : value;

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
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Header({ page, setPage }) {
  return <header className="topbar">
    <div className="container nav">
      <button className="brand" onClick={() => setPage('shop')}><span className="brand-mark"><Icon name="bolt" size={16} /></span><span>halo<span className="brand-accent">bundle</span></span></button>
      <nav className="desktop-nav">
        <button className={page === 'shop' ? 'active' : ''} onClick={() => setPage('shop')}>Buy bundles</button>
        <button className={page === 'how' ? 'active' : ''} onClick={() => setPage('how')}>How it works</button>
        <button className={page === 'admin' ? 'active' : ''} onClick={() => setPage('admin')}>Seller portal</button>
      </nav>
      <div className="nav-end"><span className="live-dot"></span><span className="live-label">Live & secure</span><button className="menu-btn"><Icon name="menu" /></button></div>
    </div>
  </header>;
}

function BundleCard({ bundle, selected, onSelect }) {
  return <button className={`bundle-card ${selected ? 'selected' : ''}`} onClick={() => onSelect(bundle)}>
    {bundle.popular && <span className="popular">MOST POPULAR</span>}
    <div className={`bundle-icon ${bundle.tone}`}><span>{bundle.gb}</span><small>GB</small></div>
    <div className="bundle-copy"><strong>{bundle.label}</strong><span>{bundle.detail}</span></div>
    <div className="bundle-price"><strong>TZS {money(bundle.price)}</strong><span>one-time</span></div>
    <span className={`radio ${selected ? 'checked' : ''}`}>{selected && <Icon name="check" size={12} />}</span>
  </button>;
}

function Shop({ setPage }) {
  const [selected, setSelected] = useState(bundles[3]);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const submitPhone = (event) => {
    event.preventDefault();
    if (!/^0\d{9}$/.test(phone.replace(/\s/g, ''))) return setError('Enter a valid 10-digit Halotel number.');
    setError(''); setStep(2);
  };
  const submitOrder = (event) => {
    event.preventDefault();
    if (code.trim().length < 4) return setError('Enter the confirmation code from your payment SMS.');
    const id = `HB-${Math.floor(10000 + Math.random() * 89999)}`;
    const next = { id, phone: maskPhone(phone), gb: selected.gb, amount: selected.price, code: code.toUpperCase(), status: 'Pending', time: 'just now' };
    const orders = JSON.parse(localStorage.getItem('halo-orders') || '[]');
    localStorage.setItem('halo-orders', JSON.stringify([next, ...orders]));
    setOrder(next); setError('');
  };
  return <main>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="spark">✦</span> The smarter way to stay connected</div>
          <h1>Data that moves<br /><em>with you.</em></h1>
          <p>Get affordable Halotel internet bundles instantly. No queues, no guesswork — just pick, pay and go.</p>
          <div className="hero-proof"><span className="avatars"><i>J</i><i>M</i><i>A</i><i>+</i></span><span><strong>10,000+</strong> bundles delivered</span></div>
        </div>
        <div className="order-panel">
          <div className="panel-head"><div><span className="step-label">STEP {step} OF 2</span><h2>{step === 1 ? 'Choose your bundle' : 'Complete payment'}</h2></div><span className="secure"><Icon name="shield" size={15} /> Secure</span></div>
          <div className="progress"><span className={step === 2 ? 'full' : ''}></span></div>
          {!order ? step === 1 ? <form onSubmit={submitPhone}>
            <div className="bundle-list">{bundles.map(bundle => <BundleCard key={bundle.gb} bundle={bundle} selected={selected.gb === bundle.gb} onSelect={setSelected} />)}</div>
            <div className="field"><label>Halotel number</label><div className="input-wrap"><span>+255</span><input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="07XX XXX XXX" inputMode="numeric" /></div><small>Bundle will be sent to this number</small></div>
            {error && <div className="error">{error}</div>}
            <button className="primary wide" type="submit">Continue to payment <Icon name="arrow" size={17} /></button>
          </form> : <form onSubmit={submitOrder}>
            <div className="payment-summary"><span>You're buying</span><strong>{selected.gb} GB <b>•</b> TZS {money(selected.price)}</strong><button type="button" onClick={() => { setStep(1); setError(''); }}>Change</button></div>
            <div className="payment-box"><div className="payment-title"><span className="halo-pesa">H</span><div><strong>Pay with HaloPesa</strong><small>Send money to the seller number below</small></div></div><div className="pay-number"><span>HaloPesa number</span><strong>0621 400 800</strong><button type="button" onClick={() => navigator.clipboard?.writeText('0621400800')}><Icon name="copy" size={15} /> Copy</button></div><p className="instruction">After payment, enter the <b>transaction code</b> from your HaloPesa SMS.</p></div>
            <div className="field"><label>Transaction code</label><input className="code-input" value={code} onChange={e => setCode(e.target.value.slice(0, 12))} placeholder="e.g. HP91K2" autoCapitalize="characters" /><small>Usually 6–10 characters</small></div>
            {error && <div className="error">{error}</div>}<button className="primary wide" type="submit">Submit order <Icon name="arrow" size={17} /></button><button className="back-link" type="button" onClick={() => setStep(1)}>← Back</button>
          </form> : <Success order={order} setPage={setPage} />}
        </div>
      </div>
    </section>
    <section className="trust-strip"><div className="container"><span><Icon name="bolt" size={17} /> Instant delivery</span><span><Icon name="shield" size={17} /> Trusted payments</span><span><Icon name="check" size={17} /> Support when you need it</span></div></section>
  </main>;
}

function Success({ order, setPage }) {
  return <div className="success"><div className="success-icon"><Icon name="check" size={30} /></div><h2>Order received!</h2><p>Your <strong>{order.gb} GB</strong> bundle is being processed. We'll send it to <strong>{order.phone}</strong> shortly.</p><div className="order-id"><span>ORDER ID</span><strong>{order.id}</strong></div><button className="primary wide" onClick={() => setPage('shop')}>Buy another bundle <Icon name="arrow" size={17} /></button><p className="help">Need help? <a href="mailto:hello@halobundle.co.tz">hello@halobundle.co.tz</a></p></div>;
}

function HowItWorks() {
  return <main className="simple-page"><div className="container narrow"><div className="eyebrow"><span className="spark">✦</span> Simple by design</div><h1>From zero to<br /><em>connected.</em></h1><p className="lead">Your next bundle is just three easy steps away.</p><div className="steps">{[['01', 'Pick your data', 'Choose the bundle size that fits your day. We show the full price upfront.'], ['02', 'Pay with HaloPesa', 'Send the exact amount to our HaloPesa number using your mobile phone.'], ['03', 'Share your code', 'Enter the transaction code and we’ll deliver your bundle to your Halotel line.']].map(([n, title, text]) => <div className="step" key={n}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>)}</div><div className="notice"><Icon name="shield" size={20} /><div><strong>Your payment is protected</strong><p>We never ask for your PIN. Only share the transaction code generated after a successful payment.</p></div></div></div></main>;
}

function Admin() {
  const [orders, setOrders] = useState(() => [...JSON.parse(localStorage.getItem('halo-orders') || '[]'), ...initialOrders]);
  const [filter, setFilter] = useState('All');
  const update = (id) => { const next = orders.map(item => item.id === id ? { ...item, status: 'Completed' } : item); setOrders(next); localStorage.setItem('halo-orders', JSON.stringify(next)); };
  const visible = filter === 'All' ? orders : orders.filter(item => item.status === filter);
  const pending = orders.filter(o => o.status === 'Pending').length;
  return <main className="admin-page"><div className="container"><div className="admin-head"><div><div className="eyebrow"><span className="spark">✦</span> Seller workspace</div><h1>Good afternoon, <em>seller.</em></h1><p>Keep an eye on incoming orders and fulfil them in a tap.</p></div><span className="admin-live"><i></i> Live updates on</span></div><div className="metrics"><div><span className="metric-icon blue"><Icon name="grid" /></span><small>TODAY'S ORDERS</small><strong>{orders.length}</strong><span className="up">↑ 12% vs yesterday</span></div><div><span className="metric-icon orange"><Icon name="clock" /></span><small>AWAITING ACTION</small><strong>{pending}</strong><span className="muted">Needs your attention</span></div><div><span className="metric-icon green"><Icon name="chart" /></span><small>TODAY'S REVENUE</small><strong>TZS {money(orders.reduce((sum, o) => sum + o.amount, 0))}</strong><span className="up">↑ 8% vs yesterday</span></div></div><div className="orders-card"><div className="orders-toolbar"><div><h2>Incoming orders</h2><p>Review payment codes and send bundles.</p></div><div className="filters">{['All', 'Pending', 'Completed'].map(item => <button className={filter === item ? 'selected' : ''} key={item} onClick={() => setFilter(item)}>{item}{item === 'Pending' && <b>{pending}</b>}</button>)}</div></div><div className="table-wrap"><table><thead><tr><th>ORDER</th><th>HALOTEL NUMBER</th><th>BUNDLE</th><th>TRANSACTION CODE</th><th>STATUS</th><th></th></tr></thead><tbody>{visible.map(item => <tr key={item.id}><td><strong>{item.id}</strong><small>{item.time}</small></td><td>{item.phone}</td><td><span className="table-bundle">{item.gb} GB</span><small>TZS {money(item.amount)}</small></td><td><code>{item.code}</code></td><td><span className={`status ${item.status.toLowerCase()}`}><i></i>{item.status}</span></td><td>{item.status === 'Pending' && <button className="complete" onClick={() => update(item.id)}>Mark completed <Icon name="check" size={14} /></button>}</td></tr>)}</tbody></table></div></div></div></main>;
}

function App() {
  const [page, setPage] = useState('shop');
  return <><Header page={page} setPage={setPage} />{page === 'shop' && <Shop setPage={setPage} />}{page === 'how' && <HowItWorks />}{page === 'admin' && <Admin />}<footer><div className="container"><span className="brand"><span className="brand-mark"><Icon name="bolt" size={14} /></span> halo<span className="brand-accent">bundle</span></span><span>Built for Tanzania <span className="flag">🇹🇿</span></span><span>© 2024 HaloBundle</span></div></footer></>;
}

createRoot(document.getElementById('root')).render(<App />);
