import React, { useState, useEffect } from 'react';
import {
  Wallet, Award, ShoppingCart, Users, History, TrendingUp,
  Search, Copy, Check, Info,
  Lock, Key, Eye, EyeOff, AlertCircle, Activity, BarChart3,
  Coins, Shield, Globe, FileText, Menu, X,
  Clock, Zap, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

/* ======================================================
   UTILIDADES
====================================================== */

const generateEthAddress = () => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) address += chars[Math.floor(Math.random() * chars.length)];
  return address;
};

const generateTxHash = () => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * chars.length)];
  return hash;
};

const generateSeedPhrase = () => {
  const words = [
    'abandon','ability','able','about','above','absent','absorb','abstract',
    'absurd','abuse','access','accident','account','accuse','achieve','acid',
    'acoustic','acquire','across','act','action','actor','actual','adapt',
    'add','addict','address','adjust','admit','adult','advance','advice'
  ];
  return Array.from({ length: 12 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
};

const calculateGasFee = amount => Math.max(0.1, amount * 0.001);
const formatAddress = addr => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';
const formatDate = d => new Date(d).toLocaleString('es-ES');
const formatNumber = n => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

/* ======================================================
   COMPONENTE PRINCIPAL
====================================================== */

const BraiBitEcosystem = () => {

  const [view, setView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [storeItems, setStoreItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [notification, setNotification] = useState(null);

  const [btcPrice, setBtcPrice] = useState(90000);
  const [bbPrice, setBbPrice] = useState(0.93);
  const [priceHistory, setPriceHistory] = useState([]);

  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showCNMVWarning, setShowCNMVWarning] = useState(true);

  const CURRENCY_NAME = 'BraiBit';
  const CURRENCY_SYMBOL = 'BB';
  const BLOCK_TIME = 3000;
  const CONFIRMATIONS_REQUIRED = 3;
  const USD_TO_EUR = 0.92;

  /* ===================== INIT ====================== */

  useEffect(() => {
    initializeData();
    fetchBitcoinPrice();

    const btcInterval = setInterval(fetchBitcoinPrice, 30000);

    const priceInterval = setInterval(() => {
      setBbPrice(prev => {
        const change = (Math.random() - 0.5) * 0.05;
        const next = Math.max(0.8, Math.min(1.2, prev + change));
        setPriceHistory(h => [...h, { time: Date.now(), price: next }].slice(-60));
        return next;
      });
    }, 10000);

    let blockNumber = 1;
    const blockInterval = setInterval(() => {
      setBlocks(b => [{
        number: blockNumber++,
        timestamp: new Date().toISOString(),
        transactions: Math.floor(Math.random() * 5),
        miner: generateEthAddress(),
        reward: 2.5
      }, ...b].slice(0, 50));

      setTransactions(txs =>
        txs.map(tx => {
          if (tx.status === 'pending' && tx.confirmations < CONFIRMATIONS_REQUIRED) {
            const c = tx.confirmations + 1;
            return { ...tx, confirmations: c, status: c >= CONFIRMATIONS_REQUIRED ? 'confirmed' : 'pending' };
          }
          return tx;
        })
      );
    }, BLOCK_TIME);

    return () => {
      clearInterval(btcInterval);
      clearInterval(priceInterval);
      clearInterval(blockInterval);
    };
  }, []);

  /* ===================== DATA ====================== */

  const initializeData = () => {

    const tutorsInit = Array.from({ length: 4 }, (_, i) => ({
      id: i + 1,
      name: `Tutor/a ${i + 1}`,
      email: `tutor${i + 1}@iesluisbraille.edu`,
      role: 'tutor',
      tokens: 10000,
      ethAddress: generateEthAddress(),
      seedPhrase: generateSeedPhrase()
    }));

    const studentsInit = [
      { id: 101, nick: 'BRAILLE001', name: 'Juan Pérez', password: '1234', role: 'student', tokens: 250, class: '1º ESO A' },
      { id: 102, nick: 'BRAILLE002', name: 'María López', password: '5678', role: 'student', tokens: 180, class: '2º ESO A' },
      { id: 103, nick: 'BRAILLE003', name: 'Carlos Ruiz', password: '9012', role: 'student', tokens: 320, class: '3º ESO B' }
    ].map(s => ({ ...s, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() }));

    const tasksInit = [
      { id: 1, name: 'Ayuda en biblioteca', reward: 50, category: 'Servicio' },
      { id: 2, name: 'Tutoría a compañeros', reward: 100, category: 'Educativo' }
    ];

    const storeInit = [
      { id: 1, name: 'Punto extra examen', price: 150, stock: 999, icon: '🎓', description: 'Suma 1 punto', category: 'Académico' },
      { id: 2, name: 'Desayuno cafetería', price: 80, stock: 20, icon: '☕', description: 'Desayuno gratis', category: 'Cafetería' }
    ];

    setTutors(tutorsInit);
    setUsers(studentsInit);
    setTasks(tasksInit);
    setStoreItems(storeInit);

    setTransactions(studentsInit.map((s, i) => ({
      id: `init_${i}`,
      hash: generateTxHash(),
      from: tutorsInit[i % tutorsInit.length].ethAddress,
      to: s.ethAddress,
      amount: s.tokens,
      gasFee: calculateGasFee(s.tokens),
      description: 'Balance inicial',
      timestamp: new Date().toISOString(),
      blockNumber: 1,
      confirmations: 3,
      status: 'confirmed',
      fromName: tutorsInit[i % tutorsInit.length].name,
      toName: s.name
    })));
  };

  /* ===================== HELPERS ====================== */

  const fetchBitcoinPrice = async () => {
    try {
      const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const d = await r.json();
      if (d.bitcoin?.usd) setBtcPrice(d.bitcoin.usd);
    } catch {}
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const copyToClipboard = text => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ===================== LOGIN ====================== */

  const handleLogin = (type, data) => {
    if (type === 'tutor') {
      if (data.password !== 'Braibit2025') return showNotification('Contraseña incorrecta', 'error');
      const t = tutors.find(t => t.email === data.email);
      if (!t) return showNotification('Email no encontrado', 'error');
      setCurrentUser(t);
    } else {
      const s = users.find(u => u.nick === data.nick && u.password === data.password);
      if (!s) return showNotification('Credenciales incorrectas', 'error');
      setCurrentUser(s);
    }
    setView('wallet');
  };

  /* ===================== CALCS ====================== */

  const bbInBTC = currentUser ? (currentUser.tokens * bbPrice) / btcPrice : 0;
  const bbInEUR = currentUser ? currentUser.tokens * bbPrice * USD_TO_EUR : 0;
  const myTransactions = currentUser
    ? transactions.filter(t => t.from === currentUser.ethAddress || t.to === currentUser.ethAddress)
    : [];

  /* ===================== RENDER ====================== */

  if (view === 'login') return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {notification?.message && (
        <div className={`mb-4 p-4 rounded ${notification.type === 'error' ? 'bg-red-700' : 'bg-green-700'}`}>
          {notification.message}
        </div>
      )}

      <WalletView
        currentUser={currentUser}
        myTransactions={myTransactions}
        bbInBTC={bbInBTC}
        bbInEUR={bbInEUR}
        bbPrice={bbPrice}
        btcPrice={btcPrice}
        showSeedPhrase={showSeedPhrase}
        setShowSeedPhrase={setShowSeedPhrase}
        copied={copied}
        copyToClipboard={copyToClipboard}
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        CURRENCY_SYMBOL={CURRENCY_SYMBOL}
        formatNumber={formatNumber}
        formatAddress={formatAddress}
        formatDate={formatDate}
      />
    </div>
  );
};

/* ======================================================
   LOGIN
====================================================== */

const LoginScreen = ({ onLogin }) => {
  const [type, setType] = useState('student');
  const [data, setData] = useState({ email: '', nick: '', password: '' });

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={e => { e.preventDefault(); onLogin(type, data); }}
        className="bg-gray-900 p-6 rounded w-96 space-y-4"
      >
        <h1 className="text-2xl font-bold">BraiBit</h1>

        <select onChange={e => setType(e.target.value)} className="w-full p-2 bg-black">
          <option value="student">Alumno</option>
          <option value="tutor">Tutor</option>
        </select>

        {type === 'tutor' ? (
          <input placeholder="Email" onChange={e => setData({ ...data, email: e.target.value })} className="w-full p-2 bg-black" />
        ) : (
          <input placeholder="Nick" onChange={e => setData({ ...data, nick: e.target.value })} className="w-full p-2 bg-black" />
        )}

        <input type="password" placeholder="Contraseña" onChange={e => setData({ ...data, password: e.target.value })} className="w-full p-2 bg-black" />
        <button className="w-full bg-purple-700 p-2 rounded">Entrar</button>
      </form>
    </div>
  );
};

/* ======================================================
   WALLET VIEW
====================================================== */

const WalletView = ({
  currentUser,
  myTransactions,
  bbInBTC,
  bbInEUR,
  bbPrice,
  btcPrice,
  showSeedPhrase,
  setShowSeedPhrase,
  copied,
  copyToClipboard,
  selectedTab,
  setSelectedTab,
  CURRENCY_SYMBOL,
  formatNumber,
  formatAddress,
  formatDate
}) => (
  <div>
    <h2 className="text-3xl mb-2">{currentUser.name}</h2>
    <p className="mb-4">Balance: {formatNumber(currentUser.tokens)} {CURRENCY_SYMBOL}</p>

    <p>≈ {bbInBTC.toFixed(8)} BTC</p>
    <p>≈ {formatNumber(bbInEUR)} EUR</p>

    <div className="mt-4">
      <button onClick={() => setShowSeedPhrase(!showSeedPhrase)}>Seed Phrase</button>
      {showSeedPhrase && <p className="mt-2">{currentUser.seedPhrase}</p>}
    </div>

    <h3 className="mt-6 text-xl">Historial</h3>
    {myTransactions.map(tx => (
      <div key={tx.id} className="border-b py-2">
        {tx.description} — {formatNumber(tx.amount)} {CURRENCY_SYMBOL} — {formatDate(tx.timestamp)}
      </div>
    ))}
  </div>
);

export default BraiBitEcosystem;
