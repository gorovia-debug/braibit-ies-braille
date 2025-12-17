import React, { useState, useEffect } from 'react';
import { 
  Wallet, Award, ShoppingCart, Users, History, TrendingUp, 
  Search, Copy, Check, ExternalLink, Info, BookOpen, 
  Lock, Key, Eye, EyeOff, AlertCircle, Activity, BarChart3,
  Coins, Shield, Globe, FileText, ChevronRight, Menu, X,
  TrendingDown, Clock, Zap, Star, Gift, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { saveUsers, getUsers, saveBlockchain, getBlockchain, saveTasks, getTasks, saveProducts, getProducts, subscribeToUsers, subscribeToBlockchain } from './firebaseOperations';

// ============================================
// UTILIDADES Y HELPERS
// ============================================

const generateEthAddress = () => {
  const chars = '0123456789abcdef';
  let address = '0x';
  for (let i = 0; i < 40; i++) {
    address += chars[Math.floor(Math.random() * chars.length)];
  }
  return address;
};

const generateTxHash = () => {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

const generateSeedPhrase = () => {
  const words = [
    'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
    'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
    'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
    'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
    'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent',
    'agree', 'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album'
  ];
  
  const phrase = [];
  for (let i = 0; i < 12; i++) {
    phrase.push(words[Math.floor(Math.random() * words.length)]);
  }
  return phrase.join(' ');
};

const calculateGasFee = (amount) => Math.max(0.1, amount * 0.001);
const formatAddress = (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
const formatDate = (date) => new Date(date).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatNumber = (num) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const BraiBitEcosystem = () => {
  const [view, setView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [storeItems, setStoreItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [notification, setNotification] = useState('');
  const [btcPrice, setBtcPrice] = useState(92340); // Precio BTC en USD (se actualizará con API)
  const [bbPrice, setBbPrice] = useState(0.93); // Precio BB en USD (referencia)
  const [priceHistory, setPriceHistory] = useState([]);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showCNMVWarning, setShowCNMVWarning] = useState(true);

  const CURRENCY_NAME = "BraiBit";
  const CURRENCY_SYMBOL = "BB";
  const BLOCK_TIME = 3000;
  const CONFIRMATIONS_REQUIRED = 3;
  const EUR_USD_RATE = 0.92; // 1 USD = 0.92 EUR (aprox)

  useEffect(() => {
    // Cargar datos desde Firebase
    const loadData = async () => {
      try {
        // Intentar cargar usuarios desde Firebase
        const firebaseUsers = await getUsers();
        
        if (firebaseUsers && firebaseUsers.length > 0) {
          // Si hay datos en Firebase, usarlos
          setUsers(firebaseUsers);
        } else {
          // Primera vez - inicializar con datos por defecto
          await initializeData();
        }

        // Cargar blockchain
        const firebaseBlockchain = await getBlockchain();
        if (firebaseBlockchain && firebaseBlockchain.length > 0) {
          setBlocks(firebaseBlockchain);
        }

        // Cargar tareas
        const firebaseTasks = await getTasks();
        if (firebaseTasks && firebaseTasks.length > 0) {
          setTasks(firebaseTasks);
        }

        // Cargar productos
        const firebaseProducts = await getProducts();
        if (firebaseProducts && firebaseProducts.length > 0) {
          setStoreItems(firebaseProducts);
        }
      } catch (error) {
        console.error('Error loading data from Firebase:', error);
        // Si hay error, inicializar con datos por defecto
        await initializeData();
      }
    };

    loadData();
    fetchBitcoinPrice();
    startPriceSimulation();
    startBlockMining();
    
    // Suscribirse a cambios en tiempo real
    const unsubscribeUsers = subscribeToUsers((updatedUsers) => {
      setUsers(updatedUsers);
    });

    const unsubscribeBlockchain = subscribeToBlockchain((updatedBlockchain) => {
      setBlocks(updatedBlockchain);
    });
    
    // Actualizar precio Bitcoin cada 30 segundos
    const btcInterval = setInterval(fetchBitcoinPrice, 30000);
    
    return () => {
      clearInterval(btcInterval);
      unsubscribeUsers();
      unsubscribeBlockchain();
    };
  }, []);

  // Obtener precio real de Bitcoin
  const fetchBitcoinPrice = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await response.json();
      if (data.bitcoin && data.bitcoin.usd) {
        setBtcPrice(data.bitcoin.usd);
      }
    } catch (error) {
      console.log('Error fetching Bitcoin price, using default');
    }
  };

  const initializeData = async () => {
    const initialTutors = [
      { id: 1, name: "Tutor/a 1", email: "tutor1@iesluisbraille.edu", role: "tutor", tokens: 10000, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 2, name: "Tutor/a 2", email: "tutor2@iesluisbraille.edu", role: "tutor", tokens: 10000, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 3, name: "Tutor/a 3", email: "tutor3@iesluisbraille.edu", role: "tutor", tokens: 10000, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 4, name: "Tutor/a 4", email: "tutor4@iesluisbraille.edu", role: "tutor", tokens: 10000, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() }
    ];

    const initialStudents = [
      // USUARIO DEMO (para aprender a usar la aplicación)
      { id: 1, nick: "DEMO", name: "Usuario Demo", password: "demo", role: "student", tokens: 100, class: "DEMO", group: "DEMO", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      
      // GRUPO AD-1 (17 alumnos) - Tutor/a 1
      { id: 101, nick: "AD1-001", name: "Alumno AD1-01", password: "AC5910", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 102, nick: "AD1-002", name: "Alumno AD1-02", password: "AD0630", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 103, nick: "AD1-003", name: "Alumno AD1-03", password: "AF2038", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 104, nick: "AD1-004", name: "Alumno AD1-04", password: "BZ6329", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 105, nick: "AD1-005", name: "Alumno AD1-05", password: "CW1313", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 106, nick: "AD1-006", name: "Alumno AD1-06", password: "DI7288", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 107, nick: "AD1-007", name: "Alumno AD1-07", password: "EA5327", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 108, nick: "AD1-008", name: "Alumno AD1-08", password: "EU9023", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 109, nick: "AD1-009", name: "Alumno AD1-09", password: "GD8393", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 110, nick: "AD1-010", name: "Alumno AD1-10", password: "HG0361", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 111, nick: "AD1-011", name: "Alumno AD1-11", password: "HM4225", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 112, nick: "AD1-012", name: "Alumno AD1-12", password: "KG7188", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 113, nick: "AD1-013", name: "Alumno AD1-13", password: "LR7750", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 114, nick: "AD1-014", name: "Alumno AD1-14", password: "LV0207", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 115, nick: "AD1-015", name: "Alumno AD1-15", password: "MD7843", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 116, nick: "AD1-016", name: "Alumno AD1-16", password: "MI4782", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 117, nick: "AD1-017", name: "Alumno AD1-17", password: "MI9157", role: "student", tokens: 0, class: "AD-1", group: "AD-1", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      
      // GRUPO AD-2 (14 alumnos) - Tutor/a 1
      { id: 201, nick: "AD2-001", name: "Alumno AD2-01", password: "MJ0140", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 202, nick: "AD2-002", name: "Alumno AD2-02", password: "ND0532", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 203, nick: "AD2-003", name: "Alumno AD2-03", password: "NZ0049", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 204, nick: "AD2-004", name: "Alumno AD2-04", password: "PX1021", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 205, nick: "AD2-005", name: "Alumno AD2-05", password: "SI0445", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 206, nick: "AD2-006", name: "Alumno AD2-06", password: "TT0380", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 207, nick: "AD2-007", name: "Alumno AD2-07", password: "UK5457", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 208, nick: "AD2-008", name: "Alumno AD2-08", password: "VK8612", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 209, nick: "AD2-009", name: "Alumno AD2-09", password: "WI1158", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 210, nick: "AD2-010", name: "Alumno AD2-10", password: "YA5958", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 211, nick: "AD2-011", name: "Alumno AD2-11", password: "YR2620", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 212, nick: "AD2-012", name: "Alumno AD2-12", password: "YV9005", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 213, nick: "AD2-013", name: "Alumno AD2-13", password: "ZD5481", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
      { id: 214, nick: "AD2-014", name: "Alumno AD2-14", password: "ZJ6302", role: "student", tokens: 0, class: "AD-2", group: "AD-2", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() }
    ];

    const initialTasks = [
      { id: 1, name: "Apoyo en tarea", reward: 50, category: "Educativo" },
      { id: 2, name: "Tutoría a compañeros", reward: 100, category: "Educativo" },
      { id: 3, name: "Limpieza de espacios comunes", reward: 30, category: "Servicio" },
      { id: 4, name: "Organizar evento escolar", reward: 150, category: "Organización" },
      { id: 5, name: "Proyecto de reciclaje", reward: 200, category: "Medioambiental" },
      { id: 6, name: "Apoyo en actividades deportivas", reward: 75, category: "Deportivo" },
      { id: 7, name: "Creación de material educativo", reward: 120, category: "Educativo" },
      { id: 8, name: "Mediación entre compañeros", reward: 80, category: "Social" }
    ];

    // RECOMPENSAS REALES IES LUIS BRAILLE
    const initialStore = [
      { id: 1, name: "1 punto extra en examen", price: 150, category: "Académico", stock: 999, icon: "🎓", description: "Suma 1 punto a cualquier examen" },
      { id: 2, name: "Elegir entre 3 preguntas", price: 100, category: "Académico", stock: 999, icon: "📝", description: "Elige qué pregunta contestar" },
      { id: 3, name: "Desayuno en cafetería", price: 80, category: "Cafetería", stock: 50, icon: "☕", description: "Desayuno completo gratis" },
      { id: 4, name: "Fotocopias gratis (50 hojas)", price: 50, category: "Material", stock: 100, icon: "📄", description: "50 fotocopias sin coste" },
      { id: 5, name: "Fast-track secretaría", price: 120, category: "Privilegios", stock: 999, icon: "⚡", description: "Atención prioritaria" },
      { id: 6, name: "Salir 5 min antes", price: 50, category: "Privilegios", stock: 999, icon: "⏰", description: "Sal antes de clase" },
      { id: 7, name: "Elegir asiento 1 semana", price: 75, category: "Privilegios", stock: 999, icon: "💺", description: "Elige dónde sentarte" },
      { id: 8, name: "Día sin deberes", price: 150, category: "Académico", stock: 999, icon: "📚", description: "Un día libre de tareas" },
      { id: 9, name: "Uso de móvil en recreo", price: 100, category: "Privilegios", stock: 999, icon: "📱", description: "Usa el móvil libremente" },
      { id: 10, name: "Pase biblioteca VIP", price: 200, category: "Privilegios", stock: 999, icon: "📖", description: "Acceso prioritario" },
      { id: 11, name: "Bebida en cafetería", price: 50, category: "Cafetería", stock: 50, icon: "🥤", description: "Bebida fría o caliente" },
      { id: 12, name: "Material escolar", price: 120, category: "Material", stock: 30, icon: "✏️", description: "Pack de material" },
      { id: 13, name: "Actividad extraescolar", price: 300, category: "Eventos", stock: 20, icon: "🎯", description: "Entrada a actividad" },
      { id: 14, name: "Camiseta IES Braille", price: 250, category: "Merchandising", stock: 25, icon: "👕", description: "Camiseta oficial" }
    ];

    setTutors(initialTutors);
    setUsers(initialStudents);
    setTasks(initialTasks);
    setStoreItems(initialStore);

    // Transacciones iniciales
    const initialTxs = initialStudents.map((student, index) => ({
      id: `tx_init_${index}`,
      hash: generateTxHash(),
      from: initialTutors[index % initialTutors.length].ethAddress,
      to: student.ethAddress,
      amount: student.tokens,
      gasFee: calculateGasFee(student.tokens),
      type: 'task_reward',
      description: 'Balance inicial',
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      blockNumber: Math.floor(Math.random() * 100) + 1,
      confirmations: CONFIRMATIONS_REQUIRED + 1,
      status: 'confirmed',
      fromName: initialTutors[index % initialTutors.length].name,
      toName: student.name
    }));

    setTransactions(initialTxs);

    // Guardar datos iniciales en Firebase
    const allUsers = [...initialTutors, ...initialStudents];
    saveUsers(allUsers);
    saveTasks(initialTasks);
    saveProducts(initialStore);
    saveBlockchain([]);
  };

  const startPriceSimulation = () => {
    // Simular pequeñas variaciones en el precio BB (±5%)
    setInterval(() => {
      setBbPrice(prev => {
        const change = (Math.random() - 0.5) * 0.05; // ±2.5% cambio
        const newPrice = Math.max(0.8, Math.min(1.2, prev + change));
        setPriceHistory(prevHistory => [...prevHistory, { time: Date.now(), price: newPrice }].slice(-60));
        return newPrice;
      });
    }, 10000); // Cada 10 segundos
  };

  const startBlockMining = () => {
    let blockNumber = 1;
    setInterval(() => {
      const newBlock = {
        number: blockNumber++,
        timestamp: new Date().toISOString(),
        transactions: Math.floor(Math.random() * 5),
        miner: generateEthAddress(),
        reward: 2.5
      };
      setBlocks(prev => [newBlock, ...prev].slice(0, 50));
      
      // Actualizar confirmaciones
      setTransactions(prevTxs => prevTxs.map(tx => {
        if (tx.status === 'pending' && tx.confirmations < CONFIRMATIONS_REQUIRED) {
          return {
            ...tx,
            confirmations: tx.confirmations + 1,
            status: tx.confirmations + 1 >= CONFIRMATIONS_REQUIRED ? 'confirmed' : 'pending'
          };
        }
        return tx;
      }));
    }, BLOCK_TIME);
  };

  const handleLogin = (userType, userData) => {
    if (userType === 'tutor') {
      if (userData.password !== 'Braibit2025') {
        showNotification('❌ Contraseña incorrecta', 'error');
        return;
      }
      const tutor = tutors.find(t => t.email === userData.email);
      if (tutor) {
        setCurrentUser(tutor);
        setView('wallet');
        showNotification(`✅ Bienvenido/a ${tutor.name}`, 'success');
      } else {
        showNotification('❌ Email no encontrado', 'error');
      }
    } else {
      const student = users.find(u => u.nick === userData.nick && u.role === 'student');
      if (!student) {
        showNotification('❌ Nick no encontrado', 'error');
        return;
      }
      if (student.password !== userData.password) {
        showNotification('❌ Contraseña incorrecta', 'error');
        return;
      }
      setCurrentUser(student);
      setView('wallet');
      showNotification(`✅ Bienvenido/a ${student.name}`, 'success');
    }
  };

  const assignTaskReward = (studentId, taskId) => {
    const task = tasks.find(t => t.id === taskId);
    const student = users.find(u => u.id === studentId);
    if (!task || !student) return;

    const gasFee = calculateGasFee(task.reward);
    const netAmount = task.reward - gasFee;
    const updatedUsers = users.map(u => u.id === studentId ? { ...u, tokens: u.tokens + netAmount } : u);

    const transaction = {
      id: `tx_${Date.now()}`,
      hash: generateTxHash(),
      from: currentUser.ethAddress,
      to: student.ethAddress,
      amount: task.reward,
      gasFee: gasFee,
      type: 'task_reward',
      description: task.name,
      timestamp: new Date().toISOString(),
      blockNumber: blocks.length > 0 ? blocks[0].number : 1,
      confirmations: 0,
      status: 'pending',
      fromName: currentUser.name,
      toName: student.name
    };

    setUsers(updatedUsers);
    saveUsers(updatedUsers); // Guardar en Firebase
    setTransactions([transaction, ...transactions]);
    showNotification(`✅ ${task.reward} ${CURRENCY_SYMBOL} asignados a ${student.name}`, 'success');
  };

  const purchaseItem = (itemId) => {
    const item = storeItems.find(i => i.id === itemId);
    if (!item) return;

    const gasFee = calculateGasFee(item.price);
    const totalCost = item.price + gasFee;

    if (currentUser.tokens < totalCost) {
      showNotification(`❌ Saldo insuficiente. Necesitas ${totalCost.toFixed(2)} ${CURRENCY_SYMBOL}`, 'error');
      return;
    }

    if (item.stock <= 0) {
      showNotification('❌ Producto agotado', 'error');
      return;
    }

    const updatedUser = { ...currentUser, tokens: currentUser.tokens - totalCost };
    const updatedUsers = users.map(u => u.id === currentUser.id ? updatedUser : u);
    const updatedStore = storeItems.map(i => i.id === itemId ? { ...i, stock: i.stock - 1 } : i);

    const transaction = {
      id: `tx_${Date.now()}`,
      hash: generateTxHash(),
      from: currentUser.ethAddress,
      to: '0x0000000000000000000000000000000000000000',
      amount: item.price,
      gasFee: gasFee,
      type: 'purchase',
      description: item.name,
      timestamp: new Date().toISOString(),
      blockNumber: blocks.length > 0 ? blocks[0].number : 1,
      confirmations: 0,
      status: 'pending',
      fromName: currentUser.name,
      toName: 'Tienda IES Braille'
    };

    setCurrentUser(updatedUser);
    setUsers(updatedUsers);
    saveUsers(updatedUsers); // Guardar en Firebase
    setStoreItems(updatedStore);
    saveProducts(updatedStore); // Guardar en Firebase
    setTransactions([transaction, ...transactions]);
    showNotification(`✅ Has comprado: ${item.name}`, 'success');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(''), 4000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Cálculos
  const bbInBTC = currentUser ? (currentUser.tokens * bbPrice) / btcPrice : 0;
  const bbInEUR = currentUser ? (currentUser.tokens * bbPrice * EUR_USD_RATE) : 0;
  const myTransactions = currentUser ? transactions.filter(t => t.from === currentUser.ethAddress || t.to === currentUser.ethAddress) : [];
  const totalSupply = [...users, ...tutors].reduce((sum, u) => sum + u.tokens, 0);
  const marketCapUSD = totalSupply * bbPrice;
  const marketCapEUR = marketCapUSD * EUR_USD_RATE;
  const priceChange24h = ((bbPrice - 0.88) / 0.88 * 100); // Simulado

  if (view === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Navigation */}
      <nav className="bg-black/40 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-white hover:text-purple-400 transition">
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-xl">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {CURRENCY_NAME}
                  </h1>
                  <p className="text-xs text-purple-300">IES Luis Braille Network</p>
                </div>
              </div>

              {/* Price ticker */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-xs text-gray-400">BB Price</p>
                    <p className="text-white font-mono font-bold">${bbPrice.toFixed(4)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 px-4 py-2 rounded-lg">
                  <Coins className="w-4 h-4 text-orange-400" />
                  <div>
                    <p className="text-xs text-gray-400">Bitcoin</p>
                    <p className="text-white font-mono font-bold">${btcPrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-xs text-purple-300">{currentUser.role === 'tutor' ? '👨‍🏫 Tutor' : '🎓 Alumno'}</p>
                <p className="text-white font-semibold">{currentUser.name}</p>
                {currentUser.class && <p className="text-xs text-gray-400">{currentUser.class}</p>}
              </div>
              
              <button 
                onClick={() => { setCurrentUser(null); setView('login'); }} 
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg border border-red-500/30 transition font-semibold"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-72 bg-black/20 backdrop-blur-xl border-r border-purple-500/20 min-h-screen p-4 overflow-y-auto">
            <div className="space-y-2">
              {[
                { id: 'wallet', icon: Wallet, label: 'Mi Wallet' },
                { id: 'explorer', icon: Globe, label: 'Explorador' },
                { id: 'info', icon: BarChart3, label: 'Información' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    view === item.id
                      ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-white border border-purple-500/50 shadow-lg shadow-purple-500/20'
                      : 'text-gray-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-semibold">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Network stats */}
            <div className="mt-8 space-y-3">
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-xs text-gray-400">Estado de la Red</p>
                </div>
                <p className="text-white font-semibold">Online</p>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Último Bloque</p>
                <p className="text-white font-mono font-bold">#{blocks.length > 0 ? blocks[0].number : 0}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Transacciones</p>
                <p className="text-white font-mono font-bold">{transactions.length}</p>
              </div>
            </div>

            {/* Educational note */}
            <div className="mt-8 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-200 text-xs font-semibold mb-1">Proyecto Educativo</p>
                  <p className="text-yellow-300/80 text-xs">
                    BraiBit es una simulación con fines educativos. No tiene valor monetario real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          {notification && (
            <div className={`mb-6 backdrop-blur-xl border rounded-xl p-4 ${
              notification.type === 'error' 
                ? 'bg-red-500/10 border-red-500/30 text-red-200' 
                : 'bg-green-500/10 border-green-500/30 text-green-200'
            }`}>
              {notification.message}
            </div>
          )}

          {/* CNMV Warning Modal */}
          {showCNMVWarning && view === 'wallet' && (
            <CNMVWarning onClose={() => setShowCNMVWarning(false)} />
          )}

          {view === 'wallet' && (
            <WalletView
              currentUser={currentUser}
              users={users}
              tasks={tasks}
              storeItems={storeItems}
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
              assignTaskReward={assignTaskReward}
              purchaseItem={purchaseItem}
              CURRENCY_SYMBOL={CURRENCY_SYMBOL}
              calculateGasFee={calculateGasFee}
              formatNumber={formatNumber}
            />
          )}

          {view === 'explorer' && (
            <ExplorerView
              transactions={transactions}
              blocks={blocks}
              users={[...users, ...tutors]}
              CURRENCY_SYMBOL={CURRENCY_SYMBOL}
              formatAddress={formatAddress}
              formatDate={formatDate}
            />
          )}

          {view === 'info' && (
            <InfoView
              users={users}
              tutors={tutors}
              transactions={transactions}
              bbPrice={bbPrice}
              btcPrice={btcPrice}
              priceHistory={priceHistory}
              priceChange24h={priceChange24h}
              totalSupply={totalSupply}
              marketCapUSD={marketCapUSD}
              marketCapEUR={marketCapEUR}
              CURRENCY_SYMBOL={CURRENCY_SYMBOL}
              formatNumber={formatNumber}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTE LOGIN SCREEN
// ============================================

const LoginScreen = ({ onLogin }) => {
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({ name: '', email: '', nick: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(userType, formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-pink-500/20 rounded-full blur-3xl bottom-0 right-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative bg-black/40 backdrop-blur-2xl rounded-3xl p-8 max-w-md w-full shadow-2xl border border-purple-500/30">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl shadow-lg shadow-purple-500/50">
              <Coins className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 mb-2">
            BraiBit
          </h1>
          <p className="text-purple-300 font-semibold mb-1">IES Luis Braille Blockchain Network</p>
          <p className="text-xs text-gray-500">Powered by Ethereum-like Protocol</p>
        </div>

        <div className="flex gap-2 mb-6">
          {['student', 'tutor'].map(type => (
            <button
              key={type}
              onClick={() => setUserType(type)}
              className={`flex-1 py-3 rounded-xl font-semibold transition ${
                userType === type
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                  : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
              }`}
            >
              {type === 'student' ? '🎓 Alumno/a' : '👨‍🏫 Tutor/a'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {userType === 'tutor' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Ana García"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email institucional</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="tu@iesluisbraille.edu"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nick de Alumno</label>
                <input
                  type="text"
                  value={formData.nick}
                  onChange={(e) => setFormData({ ...formData, nick: e.target.value.toUpperCase() })}
                  placeholder="BRAILLE001"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 uppercase font-mono focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={20} />: <Eye size={20} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/50 transition transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Lock size={20} />
            Acceder al Wallet
          </button>
        </form>

        {userType === 'student' && (
          <div className="mt-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-purple-200">
                Introduce las credenciales que te proporcionó tu tutor. Tu Nick es único y personal.
              </p>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

// ===========================================
// CNMV WARNING COMPONENT
// ===========================================

const CNMVWarning = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/50 rounded-2xl p-6 max-w-2xl w-full shadow-2xl">
        <div className="flex items-start gap-4 mb-4">
          <div className="bg-yellow-500/20 p-3 rounded-xl">
            <AlertCircle className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-yellow-200 mb-2">⚠️ AVISO IMPORTANTE - CNMV</h3>
            <p className="text-sm text-yellow-300/80">Comisión Nacional del Mercado de Valores</p>
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-4 mb-4 space-y-3 text-sm text-gray-200">
          <p className="font-semibold text-white">
            Este es un proyecto EDUCATIVO del IES Luis Braille.
          </p>
          
          <p>
            Los <strong>BraiBits (BB) NO son criptomonedas reales</strong> y NO tienen valor monetario fuera de este sistema educativo. Son tokens virtuales utilizados exclusivamente para fines pedagógicos.
          </p>

          <div className="border-t border-yellow-500/30 pt-3 mt-3">
            <p className="font-semibold text-yellow-200 mb-2">Sobre las criptomonedas reales:</p>
            <ul className="space-y-1 pl-4 list-disc text-gray-300">
              <li>Las criptomonedas reales implican <strong>RIESGO de pérdida total</strong> del capital</li>
              <li>Presentan <strong>alta volatilidad</strong> de precios</li>
              <li><strong>No están reguladas</strong> ni protegidas por entidades financieras</li>
              <li>Existen <strong>fraudes y estafas</strong> en el mercado cripto</li>
              <li>No son adecuadas para todos los inversores</li>
            </ul>
          </div>

          <div className="border-t border-yellow-500/30 pt-3 mt-3">
            <p className="text-xs text-gray-400">
              Según la CNMV: "Las criptomonedas no están reguladas, pueden no ser adecuadas para inversores minoristas y perderse la totalidad del importe invertido."
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Más información: <a href="https://www.cnmv.es" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">www.cnmv.es</a>
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
        >
          He leído y entiendo el aviso
        </button>
      </div>
    </div>
  );
};

export default BraiBitEcosystem;
// ============================================
// WALLET VIEW COMPONENT
// ============================================

const WalletView = ({
  currentUser,
  users,
  tasks,
  storeItems,
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
  assignTaskReward,
  purchaseItem,
  CURRENCY_SYMBOL,
  calculateGasFee,
  formatNumber
}) => {
  return (
    <div className="space-y-6">
      {/* Wallet Header Card */}
      <div className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/30 shadow-2xl shadow-purple-500/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Balance Total
            </p>
            <div className="flex items-baseline gap-3 mb-3">
              <h2 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200">
                {formatNumber(currentUser.tokens)}
              </h2>
              <span className="text-3xl text-purple-300 font-bold">{CURRENCY_SYMBOL}</span>
            </div>
            
            {/* Conversión a otras monedas */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Coins className="w-4 h-4 text-orange-400" />
                <span className="text-gray-400">≈</span>
                <span className="text-orange-300 font-mono">{bbInBTC.toFixed(8)} BTC</span>
                <span className="text-gray-500 text-xs">(referencia)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xl">💶</span>
                <span className="text-gray-400">≈</span>
                <span className="text-green-300 font-mono">{formatNumber(bbInEUR)} EUR</span>
                <span className="text-gray-500 text-xs">(valor orientativo)</span>
              </div>
            </div>
          </div>
          
          {/* Price info */}
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <p className="text-xs text-gray-400 mb-2">Precio {CURRENCY_SYMBOL}</p>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-white font-mono text-xl font-bold">${bbPrice.toFixed(4)}</p>
              <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded text-xs text-green-400">
                <TrendingUp className="w-3 h-3" />
                +5.6%
              </div>
            </div>
            <p className="text-xs text-gray-500">BTC: ${btcPrice.toLocaleString()}</p>
          </div>
        </div>

        {/* Ethereum Address */}
        <div className="bg-black/40 rounded-xl p-4 border border-white/10 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Dirección del Wallet (Ethereum-compatible)
            </p>
            <button
              onClick={() => copyToClipboard(currentUser.ethAddress)}
              className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs transition"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  Copiado
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copiar
                </>
              )}
            </button>
          </div>
          <code className="text-white font-mono text-sm break-all">{currentUser.ethAddress}</code>
        </div>

        {/* Seed Phrase */}
        <div>
          <button
            onClick={() => setShowSeedPhrase(!showSeedPhrase)}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm font-semibold transition"
          >
            <Key className="w-4 h-4" />
            {showSeedPhrase ? <EyeOff size={16} /> : <Eye size={16} />}
            {showSeedPhrase ? 'Ocultar' : 'Mostrar'} Seed Phrase (12 palabras)
          </button>
          
          {showSeedPhrase && (
            <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-300 text-xs font-semibold">
                  ⚠️ NUNCA compartas estas 12 palabras con nadie. Son la llave maestra de tu wallet.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {currentUser.seedPhrase.split(' ').map((word, i) => (
                  <div key={i} className="bg-black/40 px-3 py-2 rounded-lg border border-yellow-500/20">
                    <span className="text-yellow-400 text-xs font-bold mr-2">{i + 1}.</span>
                    <span className="text-white text-sm font-mono">{word}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-purple-500/20 overflow-x-auto">
        {[
          { id: 'overview', label: '📊 Vista General', icon: Activity },
          ...(currentUser.role === 'tutor' ? [{ id: 'assign', label: '⭐ Asignar Tareas', icon: Award }] : []),
          ...(currentUser.role === 'student' ? [{ id: 'store', label: '🛒 Tienda', icon: ShoppingCart }] : []),
          { id: 'history', label: '📜 Historial', icon: History }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id)}
            className={`px-6 py-3 font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              selectedTab === tab.id
                ? 'text-white border-b-2 border-purple-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <OverviewTab 
          currentUser={currentUser} 
          myTransactions={myTransactions} 
          CURRENCY_SYMBOL={CURRENCY_SYMBOL}
          formatNumber={formatNumber}
        />
      )}

      {selectedTab === 'assign' && currentUser.role === 'tutor' && (
        <AssignTaskTab 
          users={users.filter(u => u.role === 'student')} 
          tasks={tasks} 
          onAssign={assignTaskReward} 
          CURRENCY_SYMBOL={CURRENCY_SYMBOL}
          calculateGasFee={calculateGasFee}
          formatNumber={formatNumber}
        />
      )}

      {selectedTab === 'store' && currentUser.role === 'student' && (
        <StoreTab 
          items={storeItems} 
          currentUser={currentUser} 
          onPurchase={purchaseItem} 
          CURRENCY_SYMBOL={CURRENCY_SYMBOL}
          bbPrice={bbPrice}
          calculateGasFee={calculateGasFee}
          formatNumber={formatNumber}
        />
      )}

      {selectedTab === 'history' && (
        <HistoryTab 
          transactions={myTransactions} 
          currentUser={currentUser} 
          CURRENCY_SYMBOL={CURRENCY_SYMBOL}
          formatNumber={formatNumber}
        />
      )}
    </div>
  );
};

// ============================================
// OVERVIEW TAB
// ============================================

const OverviewTab = ({ currentUser, myTransactions, CURRENCY_SYMBOL, formatNumber }) => {
  const recentTx = myTransactions.slice(0, 5);
  
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
        <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-400" />
          Actividad Reciente
        </h3>
        {recentTx.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No hay transacciones recientes</p>
        ) : (
          <div className="space-y-3">
            {recentTx.map(tx => {
              const isReceived = tx.to === currentUser.ethAddress;
              return (
                <div key={tx.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-blue-500/50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isReceived ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {isReceived ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className={`font-semibold ${isReceived ? 'text-green-400' : 'text-red-400'}`}>
                          {isReceived ? 'Recibido' : 'Enviado'}
                        </p>
                        <p className="text-gray-400 text-sm">{tx.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono font-bold">
                        {isReceived ? '+' : '-'}{formatNumber(tx.amount)} {CURRENCY_SYMBOL}
                      </p>
                      <p className="text-gray-500 text-xs">Gas: {tx.gasFee.toFixed(2)} {CURRENCY_SYMBOL}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {tx.status === 'confirmed' ? (
                      <span className="flex items-center gap-1 text-green-400">
                        <Check size={12} />
                        Confirmada
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Clock size={12} />
                        {tx.confirmations}/3 confirmaciones
                      </span>
                    )}
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">Bloque #{tx.blockNumber}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Account Info & Tips */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Información de la Cuenta
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Rol:</span>
              <span className="text-white font-semibold">
                {currentUser.role === 'tutor' ? '👨‍🏫 Tutor/a' : '🎓 Alumno/a'}
              </span>
            </div>
            {currentUser.class && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Clase:</span>
                <span className="text-white font-semibold">{currentUser.class}</span>
              </div>
            )}
            {currentUser.nick && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Nick:</span>
                <span className="text-white font-mono font-semibold">{currentUser.nick}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Transacciones:</span>
              <span className="text-white font-mono font-semibold">{myTransactions.length}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-yellow-500/20 p-2 rounded-lg">
              <Info className="w-5 h-5 text-yellow-400" />
            </div>
            <h3 className="text-white font-bold">💡 ¿Sabías que...?</h3>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Cada transacción en BraiBit se registra en un <strong>bloque de la blockchain</strong>, 
            garantizando <strong>transparencia y trazabilidad</strong>. Las transacciones requieren 
            <strong> 3 confirmaciones</strong> para considerarse finales, simulando el proceso real 
            de las criptomonedas como Bitcoin y Ethereum.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// ASSIGN TASK TAB (TUTORES)
// ============================================

const AssignTaskTab = ({ users, tasks, onAssign, CURRENCY_SYMBOL, calculateGasFee, formatNumber }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleAssign = () => {
    if (selectedStudent && selectedTask) {
      onAssign(selectedStudent, selectedTask);
      setSelectedStudent(null);
      setSelectedTask(null);
    }
  };

  const selectedTaskData = tasks.find(t => t.id === selectedTask);
  const gasFee = selectedTaskData ? calculateGasFee(selectedTaskData.reward) : 0;
  const netAmount = selectedTaskData ? selectedTaskData.reward - gasFee : 0;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Assignment Form */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
        <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-purple-400" />
          Asignar Tarea Completada
        </h3>

        <div className="space-y-4">
          {/* Selector de Grupos */}
          <div>
            <label className="block text-gray-300 text-sm mb-2 font-semibold">📚 Filtrar por Grupo</label>
            <select
              value={selectedGroup}
              onChange={(e) => {
                setSelectedGroup(e.target.value);
                setSelectedStudent(null);
              }}
              className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
            >
              <option value="">-- Todos los grupos --</option>
              <option value="DEMO">🎓 DEMO</option>
              <option value="AD-1">📘 AD-1 (17 alumnos)</option>
              <option value="AD-2">📗 AD-2 (14 alumnos)</option>
            </select>
          </div>

          {/* Selector de Alumnos con filtro */}
          <div>
            <label className="block text-gray-300 text-sm mb-2 font-semibold">
              👤 Selecciona Alumno/a
              {selectedGroup && <span className="text-purple-400 ml-2">({selectedGroup})</span>}
            </label>
            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
            >
              <option value="">-- Elige un alumno {selectedGroup ? `de ${selectedGroup}` : ''} --</option>
              {users
                .filter(student => !selectedGroup || student.group === selectedGroup)
                .map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.group || student.class}) - {formatNumber(student.tokens)} {CURRENCY_SYMBOL}
                </option>
              ))}
            </select>
            {selectedGroup && (
              <p className="text-xs text-gray-400 mt-1">
                Mostrando {users.filter(s => s.group === selectedGroup).length} alumno(s) del grupo {selectedGroup}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm mb-2 font-semibold">Selecciona Tarea</label>
            <select
              value={selectedTask || ''}
              onChange={(e) => setSelectedTask(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
            >
              <option value="">-- Elige una tarea --</option>
              {tasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.name} - {task.reward} {CURRENCY_SYMBOL} ({task.category})
                </option>
              ))}
            </select>
          </div>

          {selectedTaskData && (
            <div className="bg-black/30 rounded-xl p-4 border border-yellow-500/30">
              <p className="text-yellow-300 text-sm font-semibold mb-2">⚡ Resumen de la transacción:</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Recompensa:</span>
                  <span className="text-white font-mono">+{selectedTaskData.reward} {CURRENCY_SYMBOL}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gas Fee:</span>
                  <span className="text-yellow-400 font-mono">-{gasFee.toFixed(2)} {CURRENCY_SYMBOL}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
                  <span className="text-gray-300">El alumno recibirá:</span>
                  <span className="text-green-400 font-mono">+{netAmount.toFixed(2)} {CURRENCY_SYMBOL}</span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleAssign}
            disabled={!selectedStudent || !selectedTask}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold hover:shadow-2xl hover:shadow-purple-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Zap size={20} />
            Confirmar Transacción
          </button>
        </div>
      </div>

      {/* Available Tasks */}
      <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
        <h3 className="text-white font-bold text-xl mb-4">📋 Tareas Disponibles</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-blue-500/50 transition cursor-pointer"
              onClick={() => setSelectedTask(task.id)}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">{task.name}</span>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-mono font-bold">
                  {task.reward} {CURRENCY_SYMBOL}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/10 text-gray-400 px-2 py-1 rounded">{task.category}</span>
                <span className="text-xs text-gray-500">Gas: ~{calculateGasFee(task.reward).toFixed(2)} {CURRENCY_SYMBOL}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================
// STORE TAB (ALUMNOS)
// ============================================

const StoreTab = ({ items, currentUser, onPurchase, CURRENCY_SYMBOL, bbPrice, calculateGasFee, formatNumber }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('price-asc');

  const categories = ['all', ...new Set(items.map(item => item.category))];
  
  let filteredItems = filter === 'all' ? items : items.filter(item => item.category === filter);
  
  // Sorting
  filteredItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const EUR_USD_RATE = 0.92;

  return (
    <div>
      {/* Filters and Sort */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition ${
                  filter === cat
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                {cat === 'all' ? '🏪 Todo' : cat}
              </button>
            ))}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
          >
            <option value="price-asc">💰 Precio: Menor a Mayor</option>
            <option value="price-desc">💰 Precio: Mayor a Menor</option>
            <option value="name">📝 Nombre A-Z</option>
          </select>
        </div>

        {/* Info banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-blue-200 text-sm flex items-center gap-2">
            <Info size={16} />
            <strong>Precios fijos en {CURRENCY_SYMBOL}.</strong> El valor en EUR es orientativo y varía según la cotización.
          </p>
        </div>
      </div>

      {/* Store Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const gasFee = calculateGasFee(item.price);
          const totalCost = item.price + gasFee;
          const canAfford = currentUser.tokens >= totalCost;
          const valueInEUR = (item.price * bbPrice * EUR_USD_RATE).toFixed(2);

          return (
            <div 
              key={item.id} 
              className="bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition transform hover:scale-105"
            >
              {/* Icon */}
              <div className="text-6xl mb-4 text-center">{item.icon}</div>
              
              {/* Title */}
              <h4 className="text-white font-bold text-lg mb-2">{item.name}</h4>
              <p className="text-gray-400 text-sm mb-4">{item.description}</p>
              
              {/* Category & Stock */}
              <div className="flex justify-between text-xs mb-4">
                <span className="bg-white/10 text-gray-300 px-2 py-1 rounded">{item.category}</span>
                <span className={`px-2 py-1 rounded ${item.stock > 10 ? 'text-green-400 bg-green-500/10' : 'text-yellow-400 bg-yellow-500/10'}`}>
                  Stock: {item.stock}
                </span>
              </div>
              
              {/* Pricing */}
              <div className="bg-black/40 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Precio:</span>
                  <span className="text-white font-mono font-bold">{item.price} {CURRENCY_SYMBOL}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Gas Fee:</span>
                  <span className="text-yellow-400 font-mono">{gasFee.toFixed(2)} {CURRENCY_SYMBOL}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
                  <span className="text-white">Total:</span>
                  <span className="text-purple-400 font-mono">{totalCost.toFixed(2)} {CURRENCY_SYMBOL}</span>
                </div>
                <div className="text-xs text-gray-500 text-center pt-1">
                  ≈ {valueInEUR} EUR (referencia)
                </div>
              </div>
              
              {/* Buy Button */}
              <button
                onClick={() => onPurchase(item.id)}
                disabled={!canAfford || item.stock === 0}
                className={`w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                  canAfford && item.stock > 0
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl hover:shadow-green-500/50'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {item.stock === 0 ? (
                  <>❌ Agotado</>
                ) : canAfford ? (
                  <>
                    <ShoppingCart size={18} />
                    Comprar Ahora
                  </>
                ) : (
                  <>🔒 Saldo Insuficiente</>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================
// HISTORY TAB
// ============================================

const HistoryTab = ({ transactions, currentUser, CURRENCY_SYMBOL, formatNumber }) => {
  const [filter, setFilter] = useState('all');

  const filteredTx = filter === 'all' 
    ? transactions 
    : filter === 'received' 
      ? transactions.filter(tx => tx.to === currentUser.ethAddress)
      : transactions.filter(tx => tx.from === currentUser.ethAddress);

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-2xl flex items-center gap-2">
          <History className="w-7 h-7 text-purple-400" />
          Historial de Transacciones
        </h3>
        
        <div className="flex gap-2">
          {['all', 'received', 'sent'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                filter === f
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              {f === 'all' ? '📊 Todas' : f === 'received' ? '📥 Recibidas' : '📤 Enviadas'}
            </button>
          ))}
        </div>
      </div>

      {filteredTx.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No hay transacciones en el historial</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTx.map(tx => {
            const isReceived = tx.to === currentUser.ethAddress;
            return (
              <div 
                key={tx.id} 
                className={`bg-white/5 rounded-xl p-4 border-2 transition hover:scale-102 ${
                  isReceived ? 'border-green-500/30 hover:border-green-500/50' : 'border-red-500/30 hover:border-red-500/50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isReceived ? 'bg-green-500/20' : 'bg-red-500/20'
                    }`}>
                      {isReceived ? (
                        <ArrowDownRight className="w-6 h-6 text-green-400" />
                      ) : (
                        <ArrowUpRight className="w-6 h-6 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${isReceived ? 'text-green-400' : 'text-red-400'}`}>
                        {isReceived ? 'Recibido' : 'Enviado'}
                      </p>
                      <p className="text-white font-semibold">{tx.description}</p>
                      <p className="text-gray-400 text-sm">
                        {isReceived ? `De: ${tx.fromName}` : `A: ${tx.toName}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-mono text-2xl font-bold">
                      {isReceived ? '+' : '-'}{formatNumber(tx.amount)} {CURRENCY_SYMBOL}
                    </p>
                    <p className="text-gray-400 text-xs">Gas: {tx.gasFee.toFixed(2)} {CURRENCY_SYMBOL}</p>
                  </div>
                </div>
                
                {/* Transaction details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-white/10 text-xs">
                  <div>
                    <p className="text-gray-400 mb-1">Hash:</p>
                    <code className="text-purple-400 font-mono">{formatAddress(tx.hash)}</code>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Bloque:</p>
                    <p className="text-white font-mono">#{tx.blockNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Estado:</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
                      tx.status === 'confirmed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {tx.status === 'confirmed' ? (
                        <>
                          <Check size={12} />
                          Confirmada
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          {tx.confirmations}/3
                        </>
                      )}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Fecha:</p>
                    <p className="text-white">{formatDate(tx.timestamp)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
// ============================================
// EXPLORER VIEW - Blockchain Explorer
// ============================================

const ExplorerView = ({ transactions, blocks, users, CURRENCY_SYMBOL, formatAddress, formatDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('transactions');

  const filteredTransactions = transactions.filter(tx =>
    tx.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.toName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Explorer Header */}
      <div className="bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-3xl p-6 border border-blue-500/30">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-blue-500/20 p-3 rounded-xl">
            <Globe className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Explorador de Blockchain</h2>
            <p className="text-blue-300">Todas las transacciones son públicas y transparentes</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por hash, dirección o nombre..."
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-blue-500/20">
        {[
          { id: 'transactions', label: '📜 Transacciones', icon: Activity },
          { id: 'blocks', label: '📦 Bloques', icon: Coins }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'transactions' && (
        <div className="grid md:grid-cols-1 gap-4">
          <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <h3 className="text-white font-bold text-xl mb-4">
              Transacciones Recientes ({filteredTransactions.length})
            </h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredTransactions.slice(0, 20).map(tx => (
                <div key={tx.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-blue-500/50 transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-blue-400 font-mono text-sm bg-blue-500/10 px-2 py-1 rounded">
                          {formatAddress(tx.hash)}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(tx.hash)}
                          className="text-gray-400 hover:text-white transition"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400 text-xs">De:</p>
                          <p className="text-white font-semibold">{tx.fromName}</p>
                          <code className="text-gray-500 text-xs">{formatAddress(tx.from)}</code>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Para:</p>
                          <p className="text-white font-semibold">{tx.toName}</p>
                          <code className="text-gray-500 text-xs">{formatAddress(tx.to)}</code>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-mono text-xl font-bold">
                        {tx.amount} {CURRENCY_SYMBOL}
                      </p>
                      <p className="text-gray-400 text-xs">Gas: {tx.gasFee.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">Bloque #{tx.blockNumber}</span>
                      <span className="text-gray-500">•</span>
                      <span className={`px-2 py-1 rounded ${
                        tx.status === 'confirmed' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {tx.status === 'confirmed' ? '✅ Confirmada' : `⏳ ${tx.confirmations}/3`}
                      </span>
                    </div>
                    <span className="text-gray-400">{formatDate(tx.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'blocks' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
            <h3 className="text-white font-bold text-xl mb-4">Bloques Recientes</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {blocks.slice(0, 15).map(block => (
                <div key={block.number} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-cyan-500/50 transition">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="text-white font-mono font-bold text-lg">Bloque #{block.number}</p>
                      <p className="text-gray-400 text-xs">{formatDate(block.timestamp)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 font-mono">{block.transactions} tx</p>
                      <p className="text-gray-500 text-xs">Recompensa: {block.reward} {CURRENCY_SYMBOL}</p>
                    </div>
                  </div>
                  <div className="text-xs">
                    <p className="text-gray-400">Minero:</p>
                    <code className="text-gray-500 font-mono">{formatAddress(block.miner)}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Stats */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
              <h3 className="text-white font-bold text-xl mb-4">Estadísticas de Red</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Altura de Bloque</p>
                  <p className="text-white font-mono text-3xl font-bold">
                    #{blocks.length > 0 ? blocks[0].number : 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Transacciones</p>
                  <p className="text-white font-mono text-3xl font-bold">{transactions.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Tiempo de Bloque</p>
                  <p className="text-white font-mono text-3xl font-bold">~3s</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Confirmaciones Requeridas</p>
                  <p className="text-white font-mono text-3xl font-bold">3</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/30">
              <div className="flex items-center gap-3 mb-3">
                <Info className="w-6 h-6 text-yellow-400" />
                <h3 className="text-white font-bold">Sobre la Blockchain</h3>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                BraiBit utiliza una blockchain tipo <strong>Ethereum</strong> con un tiempo de bloque 
                de 3 segundos. Cada transacción requiere 3 confirmaciones para considerarse final. 
                Todos los datos son <strong>públicos y transparentes</strong>, simulando el 
                funcionamiento real de las criptomonedas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// INFO VIEW - Market Information & Statistics
// ============================================

const InfoView = ({ 
  users, 
  tutors, 
  transactions, 
  bbPrice, 
  btcPrice,
  priceHistory, 
  priceChange24h,
  totalSupply,
  marketCapUSD,
  marketCapEUR,
  CURRENCY_SYMBOL,
  formatNumber 
}) => {
  const allHolders = [...users, ...tutors];
  const topHolders = allHolders.sort((a, b) => b.tokens - a.tokens).slice(0, 10);
  const volume24h = transactions
    .filter(tx => new Date(tx.timestamp) > new Date(Date.now() - 86400000))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const EUR_USD_RATE = 0.92;

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/30">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-purple-500/20 p-3 rounded-xl">
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Información de {CURRENCY_SYMBOL}</h2>
            <p className="text-purple-300">Market Cap, Precio, Estadísticas y Top Holders</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {/* Price */}
          <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Precio
            </p>
            <p className="text-white font-mono text-2xl font-bold">${bbPrice.toFixed(4)}</p>
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs px-2 py-1 rounded ${
                priceChange24h >= 0 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {priceChange24h >= 0 ? '↗' : '↘'} {Math.abs(priceChange24h).toFixed(2)}%
              </span>
              <span className="text-xs text-gray-500">24h</span>
            </div>
          </div>

          {/* Market Cap */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Market Cap
            </p>
            <p className="text-white font-mono text-2xl font-bold">${formatNumber(marketCapUSD)}</p>
            <p className="text-gray-400 text-xs mt-2">≈ €{formatNumber(marketCapEUR)}</p>
          </div>

          {/* Total Supply */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-sm rounded-xl p-4 border border-green-500/30">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Suministro Total
            </p>
            <p className="text-white font-mono text-2xl font-bold">{formatNumber(totalSupply)}</p>
            <p className="text-gray-400 text-xs mt-2">{CURRENCY_SYMBOL}</p>
          </div>

          {/* Volume */}
          <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30">
            <p className="text-gray-400 text-sm mb-1 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Volumen 24h
            </p>
            <p className="text-white font-mono text-2xl font-bold">{formatNumber(volume24h)}</p>
            <p className="text-gray-400 text-xs mt-2">{CURRENCY_SYMBOL}</p>
          </div>
        </div>
      </div>

      {/* Price Chart & Bitcoin Reference */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Coins className="w-6 h-6 text-orange-400" />
            Referencia Bitcoin
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-2">Precio Bitcoin (BTC)</p>
              <p className="text-white font-mono text-4xl font-bold">${btcPrice.toLocaleString()}</p>
              <p className="text-gray-400 text-xs mt-1">Actualizado en tiempo real</p>
            </div>
            
            <div className="bg-black/30 rounded-xl p-4 border border-orange-500/20">
              <p className="text-orange-300 text-sm mb-2 font-semibold">Conversión {CURRENCY_SYMBOL} → BTC</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">1 {CURRENCY_SYMBOL}</span>
                  <span className="text-white font-mono">≈ {(bbPrice / btcPrice).toFixed(8)} BTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">100 {CURRENCY_SYMBOL}</span>
                  <span className="text-white font-mono">≈ {((bbPrice * 100) / btcPrice).toFixed(8)} BTC</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">1000 {CURRENCY_SYMBOL}</span>
                  <span className="text-white font-mono">≈ {((bbPrice * 1000) / btcPrice).toFixed(8)} BTC</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <p className="text-yellow-200 text-xs flex items-center gap-2">
                <Info size={14} />
                <strong>Sistema híbrido:</strong> Los precios en la tienda son fijos en {CURRENCY_SYMBOL}, 
                pero el valor de referencia en BTC/EUR varía según la cotización del mercado.
              </p>
            </div>
          </div>
        </div>

        {/* Price History */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30">
          <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            Historial de Precio
          </h3>
          <div className="bg-black/30 rounded-xl p-4 border border-blue-500/20 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-400 text-xs">Precio Actual</p>
                <p className="text-white font-mono text-2xl font-bold">${bbPrice.toFixed(4)}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">Cambio 24h</p>
                <p className={`font-mono text-lg font-bold ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Simple ASCII chart */}
            <div className="h-32 flex items-end gap-1">
              {priceHistory.slice(-30).map((point, i) => {
                const height = ((point.price - 0.8) / 0.4) * 100;
                return (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t opacity-60 hover:opacity-100 transition"
                    style={{ height: `${height}%` }}
                    title={`$${point.price.toFixed(4)}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Mínimo 24h</p>
              <p className="text-white font-mono font-bold">$0.88</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Máximo 24h</p>
              <p className="text-white font-mono font-bold">$0.98</p>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Promedio</p>
              <p className="text-white font-mono font-bold">$0.93</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Holders */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
        <h3 className="text-white font-bold text-2xl mb-6 flex items-center gap-2">
          <Users className="w-7 h-7 text-purple-400" />
          Top 10 Holders
        </h3>
        <div className="space-y-2">
          {topHolders.map((holder, index) => {
            const percentage = ((holder.tokens / totalSupply) * 100).toFixed(2);
            return (
              <div 
                key={holder.id} 
                className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      index === 1 ? 'bg-gray-400/20 text-gray-300' :
                      index === 2 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{holder.name}</p>
                      <code className="text-gray-500 text-xs font-mono">{formatAddress(holder.ethAddress)}</code>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-mono text-lg font-bold">
                      {formatNumber(holder.tokens)} {CURRENCY_SYMBOL}
                    </p>
                    <p className="text-gray-400 text-xs">{percentage}% del total</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* About BraiBit */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30">
        <h3 className="text-white font-bold text-2xl mb-4 flex items-center gap-2">
          <FileText className="w-7 h-7 text-cyan-400" />
          Sobre BraiBit
        </h3>
        <div className="space-y-4 text-gray-300">
          <p className="leading-relaxed">
            <strong className="text-white">BraiBit ({CURRENCY_SYMBOL})</strong> es la criptomoneda educativa 
            del <strong className="text-white">IES Luis Braille</strong>, diseñada para enseñar conceptos de 
            blockchain, criptomonedas y economía digital de forma práctica y segura.
          </p>
          
          <div className="bg-black/30 rounded-xl p-4 border border-cyan-500/20">
            <p className="text-cyan-300 font-semibold mb-3">📋 Características Técnicas:</p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Protocolo:</strong> Ethereum-like (compatible)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Tiempo de bloque:</strong> 3 segundos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Confirmaciones:</strong> 3 bloques requeridos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Gas fees:</strong> 0.1% del monto (mínimo 0.1 {CURRENCY_SYMBOL})</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Direcciones:</strong> Formato Ethereum (0x...)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Seed phrases:</strong> 12 palabras BIP39</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">•</span>
                <span><strong>Cotización:</strong> Referencia Bitcoin en tiempo real</span>
              </li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-200 font-semibold mb-2">⚠️ Proyecto Educativo</p>
                <p className="text-yellow-300/90 text-sm">
                  BraiBit es una simulación con fines exclusivamente educativos. Los tokens NO tienen 
                  valor monetario real fuera del sistema del IES Luis Braille. Este proyecto está diseñado 
                  para enseñar sobre blockchain, criptomonedas y gestión financiera digital en un entorno 
                  seguro y controlado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



