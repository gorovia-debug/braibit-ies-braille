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
  const [btcPrice, setBtcPrice] = useState(92340);
  const [bbPrice, setBbPrice] = useState(0.93);
  const [priceHistory, setPriceHistory] = useState([]);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showCNMVWarning, setShowCNMVWarning] = useState(true);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  // Nuevos estados para gestión de grupos

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
          const tutorsData = firebaseUsers.filter(u => u.role === 'tutor');
          const studentsData = firebaseUsers.filter(u => u.role === 'student');
          setTutors(tutorsData);
          setUsers(studentsData);
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
// REEMPLAZAR en initializeData (líneas 166-211)
// Desde: const initialTutors = [
// Hasta: ];  (después del último alumno)

const initialTutors = [
  { 
    id: 1, 
    name: "Tutor/a 1", 
    email: "tutor1@iesluisbraille.edu", 
    password: "Braibit2025", 
    role: "tutor", 
    tokens: 10000, 
    ethAddress: generateEthAddress(), 
    seedPhrase: generateSeedPhrase(),
    groups: [
      { id: "T1A", name: "Grupo 1A", customName: "" },
      { id: "T1B", name: "Grupo 1B", customName: "" }
    ]
  },
  { 
    id: 2, 
    name: "Tutor/a 2", 
    email: "tutor2@iesluisbraille.edu", 
    password: "Braibit2025", 
    role: "tutor", 
    tokens: 10000, 
    ethAddress: generateEthAddress(), 
    seedPhrase: generateSeedPhrase(),
    groups: [
      { id: "T2A", name: "Grupo 2A", customName: "" },
      { id: "T2B", name: "Grupo 2B", customName: "" }
    ]
  },
  { 
    id: 3, 
    name: "Tutor/a 3", 
    email: "tutor3@iesluisbraille.edu", 
    password: "Braibit2025", 
    role: "tutor", 
    tokens: 10000, 
    ethAddress: generateEthAddress(), 
    seedPhrase: generateSeedPhrase(),
    groups: [
      { id: "T3A", name: "Grupo 3A", customName: "" },
      { id: "T3B", name: "Grupo 3B", customName: "" }
    ]
  },
  { 
    id: 4, 
    name: "Tutor/a 4", 
    email: "tutor4@iesluisbraille.edu", 
    password: "Braibit2025", 
    role: "tutor", 
    tokens: 10000, 
    ethAddress: generateEthAddress(), 
    seedPhrase: generateSeedPhrase(),
    groups: [
      { id: "T4A", name: "Grupo 4A", customName: "" },
      { id: "T4B", name: "Grupo 4B", customName: "" }
    ]
  },
  { 
    id: 5, 
    name: "Tutor/a 5", 
    email: "tutor5@iesluisbraille.edu", 
    password: "Braibit2025", 
    role: "tutor", 
    tokens: 10000, 
    ethAddress: generateEthAddress(), 
    seedPhrase: generateSeedPhrase(),
    groups: [
      { id: "T5A", name: "Grupo 5A", customName: "" },
      { id: "T5B", name: "Grupo 5B", customName: "" }
    ]
  },
  { 
    id: 6, 
    name: "Tutor/a 6", 
    email: "tutor6@iesluisbraille.edu", 
    password: "Braibit2025", 
    role: "tutor", 
    tokens: 10000, 
    ethAddress: generateEthAddress(), 
    seedPhrase: generateSeedPhrase(),
    groups: [
      { id: "T6A", name: "Grupo 6A", customName: "" },
      { id: "T6B", name: "Grupo 6B", customName: "" }
    ]
  },
  { 
    id: 7, 
    name: "Tutor/a 7", 
    email: "tutor7@iesluisbraille.edu", 
    password: "Braibit2025", 
    role: "tutor", 
    tokens: 10000, 
    ethAddress: generateEthAddress(), 
    seedPhrase: generateSeedPhrase(),
    groups: [
      { id: "T7A", name: "Grupo 7A", customName: "" },
      { id: "T7B", name: "Grupo 7B", customName: "" }
    ]
  }
];

const initialStudents = [
  // Grupo 1A (25 alumnos) - Tutor/a 1
  { id: 1000, nick: "T1A-001", name: "Alumno T1A-01", password: "EG2594", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1001, nick: "T1A-002", name: "Alumno T1A-02", password: "KW1300", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1002, nick: "T1A-003", name: "Alumno T1A-03", password: "LU8767", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1003, nick: "T1A-004", name: "Alumno T1A-04", password: "EE1429", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1004, nick: "T1A-005", name: "Alumno T1A-05", password: "XP5834", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1005, nick: "T1A-006", name: "Alumno T1A-06", password: "TU4628", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1006, nick: "T1A-007", name: "Alumno T1A-07", password: "AZ8597", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1007, nick: "T1A-008", name: "Alumno T1A-08", password: "PV1883", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1008, nick: "T1A-009", name: "Alumno T1A-09", password: "MJ5524", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1009, nick: "T1A-010", name: "Alumno T1A-10", password: "ZY6122", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1010, nick: "T1A-011", name: "Alumno T1A-11", password: "CS8399", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1011, nick: "T1A-012", name: "Alumno T1A-12", password: "LA7870", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1012, nick: "T1A-013", name: "Alumno T1A-13", password: "LF4699", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1013, nick: "T1A-014", name: "Alumno T1A-14", password: "BA4283", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1014, nick: "T1A-015", name: "Alumno T1A-15", password: "CN7984", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1015, nick: "T1A-016", name: "Alumno T1A-16", password: "KL7107", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1016, nick: "T1A-017", name: "Alumno T1A-17", password: "XO2415", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1017, nick: "T1A-018", name: "Alumno T1A-18", password: "LA0298", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1018, nick: "T1A-019", name: "Alumno T1A-19", password: "FB2065", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1019, nick: "T1A-020", name: "Alumno T1A-20", password: "BB0329", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1020, nick: "T1A-021", name: "Alumno T1A-21", password: "SZ5134", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1021, nick: "T1A-022", name: "Alumno T1A-22", password: "WA7740", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1022, nick: "T1A-023", name: "Alumno T1A-23", password: "BL1748", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1023, nick: "T1A-024", name: "Alumno T1A-24", password: "IN3274", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1024, nick: "T1A-025", name: "Alumno T1A-25", password: "FC3878", role: "student", tokens: 0, class: "T1A", group: "T1A", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 1B (25 alumnos) - Tutor/a 1
  { id: 1025, nick: "T1B-001", name: "Alumno T1B-01", password: "YL4015", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1026, nick: "T1B-002", name: "Alumno T1B-02", password: "IA6835", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1027, nick: "T1B-003", name: "Alumno T1B-03", password: "KF6823", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1028, nick: "T1B-004", name: "Alumno T1B-04", password: "IL6495", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1029, nick: "T1B-005", name: "Alumno T1B-05", password: "AR6550", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1030, nick: "T1B-006", name: "Alumno T1B-06", password: "YV8596", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1031, nick: "T1B-007", name: "Alumno T1B-07", password: "FB1925", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1032, nick: "T1B-008", name: "Alumno T1B-08", password: "SI2721", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1033, nick: "T1B-009", name: "Alumno T1B-09", password: "HS3530", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1034, nick: "T1B-010", name: "Alumno T1B-10", password: "TB9260", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1035, nick: "T1B-011", name: "Alumno T1B-11", password: "ER4233", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1036, nick: "T1B-012", name: "Alumno T1B-12", password: "NT4630", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1037, nick: "T1B-013", name: "Alumno T1B-13", password: "PA7836", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1038, nick: "T1B-014", name: "Alumno T1B-14", password: "QT4887", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1039, nick: "T1B-015", name: "Alumno T1B-15", password: "CU4486", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1040, nick: "T1B-016", name: "Alumno T1B-16", password: "NM6794", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1041, nick: "T1B-017", name: "Alumno T1B-17", password: "TM2232", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1042, nick: "T1B-018", name: "Alumno T1B-18", password: "HJ5985", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1043, nick: "T1B-019", name: "Alumno T1B-19", password: "JZ5221", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1044, nick: "T1B-020", name: "Alumno T1B-20", password: "LM2993", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1045, nick: "T1B-021", name: "Alumno T1B-21", password: "SC8457", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1046, nick: "T1B-022", name: "Alumno T1B-22", password: "RF0902", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1047, nick: "T1B-023", name: "Alumno T1B-23", password: "CA2591", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1048, nick: "T1B-024", name: "Alumno T1B-24", password: "VY8004", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1049, nick: "T1B-025", name: "Alumno T1B-25", password: "OG6557", role: "student", tokens: 0, class: "T1B", group: "T1B", tutorId: 1, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 2A (25 alumnos) - Tutor/a 2
  { id: 1050, nick: "T2A-001", name: "Alumno T2A-01", password: "IG2003", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1051, nick: "T2A-002", name: "Alumno T2A-02", password: "FN7507", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1052, nick: "T2A-003", name: "Alumno T2A-03", password: "RZ8207", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1053, nick: "T2A-004", name: "Alumno T2A-04", password: "XH9171", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1054, nick: "T2A-005", name: "Alumno T2A-05", password: "GN3128", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1055, nick: "T2A-006", name: "Alumno T2A-06", password: "HT0069", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1056, nick: "T2A-007", name: "Alumno T2A-07", password: "BN8511", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1057, nick: "T2A-008", name: "Alumno T2A-08", password: "SQ6034", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1058, nick: "T2A-009", name: "Alumno T2A-09", password: "YP0798", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1059, nick: "T2A-010", name: "Alumno T2A-10", password: "NT0768", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1060, nick: "T2A-011", name: "Alumno T2A-11", password: "QR0188", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1061, nick: "T2A-012", name: "Alumno T2A-12", password: "KK2072", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1062, nick: "T2A-013", name: "Alumno T2A-13", password: "RS5055", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1063, nick: "T2A-014", name: "Alumno T2A-14", password: "NC8773", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1064, nick: "T2A-015", name: "Alumno T2A-15", password: "OG9361", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1065, nick: "T2A-016", name: "Alumno T2A-16", password: "HA2254", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1066, nick: "T2A-017", name: "Alumno T2A-17", password: "DZ7013", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1067, nick: "T2A-018", name: "Alumno T2A-18", password: "TB7512", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1068, nick: "T2A-019", name: "Alumno T2A-19", password: "FA4735", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1069, nick: "T2A-020", name: "Alumno T2A-20", password: "BA8190", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1070, nick: "T2A-021", name: "Alumno T2A-21", password: "CW1037", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1071, nick: "T2A-022", name: "Alumno T2A-22", password: "VA2189", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1072, nick: "T2A-023", name: "Alumno T2A-23", password: "FO7730", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1073, nick: "T2A-024", name: "Alumno T2A-24", password: "LT0585", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1074, nick: "T2A-025", name: "Alumno T2A-25", password: "MC1130", role: "student", tokens: 0, class: "T2A", group: "T2A", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 2B (25 alumnos) - Tutor/a 2
  { id: 1075, nick: "T2B-001", name: "Alumno T2B-01", password: "KY6163", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1076, nick: "T2B-002", name: "Alumno T2B-02", password: "DN7482", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1077, nick: "T2B-003", name: "Alumno T2B-03", password: "XZ3195", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1078, nick: "T2B-004", name: "Alumno T2B-04", password: "WR8442", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1079, nick: "T2B-005", name: "Alumno T2B-05", password: "HL4372", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1080, nick: "T2B-006", name: "Alumno T2B-06", password: "XG3101", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1081, nick: "T2B-007", name: "Alumno T2B-07", password: "TJ7995", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1082, nick: "T2B-008", name: "Alumno T2B-08", password: "KU9124", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1083, nick: "T2B-009", name: "Alumno T2B-09", password: "EL5177", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1084, nick: "T2B-010", name: "Alumno T2B-10", password: "HR2018", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1085, nick: "T2B-011", name: "Alumno T2B-11", password: "UY1343", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1086, nick: "T2B-012", name: "Alumno T2B-12", password: "JM8631", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1087, nick: "T2B-013", name: "Alumno T2B-13", password: "QP6253", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1088, nick: "T2B-014", name: "Alumno T2B-14", password: "MZ6875", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1089, nick: "T2B-015", name: "Alumno T2B-15", password: "CM0767", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1090, nick: "T2B-016", name: "Alumno T2B-16", password: "VK0706", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1091, nick: "T2B-017", name: "Alumno T2B-17", password: "JM5755", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1092, nick: "T2B-018", name: "Alumno T2B-18", password: "WM5895", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1093, nick: "T2B-019", name: "Alumno T2B-19", password: "BF3339", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1094, nick: "T2B-020", name: "Alumno T2B-20", password: "YU7763", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1095, nick: "T2B-021", name: "Alumno T2B-21", password: "VF7334", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1096, nick: "T2B-022", name: "Alumno T2B-22", password: "LE7943", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1097, nick: "T2B-023", name: "Alumno T2B-23", password: "ZI9282", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1098, nick: "T2B-024", name: "Alumno T2B-24", password: "RE4889", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1099, nick: "T2B-025", name: "Alumno T2B-25", password: "XG6794", role: "student", tokens: 0, class: "T2B", group: "T2B", tutorId: 2, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 3A (25 alumnos) - Tutor/a 3
  { id: 1100, nick: "T3A-001", name: "Alumno T3A-01", password: "XE3335", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1101, nick: "T3A-002", name: "Alumno T3A-02", password: "KQ6599", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1102, nick: "T3A-003", name: "Alumno T3A-03", password: "HM2130", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1103, nick: "T3A-004", name: "Alumno T3A-04", password: "RZ0471", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1104, nick: "T3A-005", name: "Alumno T3A-05", password: "PP7143", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1105, nick: "T3A-006", name: "Alumno T3A-06", password: "WH5676", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1106, nick: "T3A-007", name: "Alumno T3A-07", password: "DI3063", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1107, nick: "T3A-008", name: "Alumno T3A-08", password: "PJ5985", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1108, nick: "T3A-009", name: "Alumno T3A-09", password: "UA3141", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1109, nick: "T3A-010", name: "Alumno T3A-10", password: "IW1963", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1110, nick: "T3A-011", name: "Alumno T3A-11", password: "KV7230", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1111, nick: "T3A-012", name: "Alumno T3A-12", password: "RC6669", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1112, nick: "T3A-013", name: "Alumno T3A-13", password: "EX0307", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1113, nick: "T3A-014", name: "Alumno T3A-14", password: "FK2761", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1114, nick: "T3A-015", name: "Alumno T3A-15", password: "BH1844", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1115, nick: "T3A-016", name: "Alumno T3A-16", password: "VB2783", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1116, nick: "T3A-017", name: "Alumno T3A-17", password: "BR2664", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1117, nick: "T3A-018", name: "Alumno T3A-18", password: "KF6331", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1118, nick: "T3A-019", name: "Alumno T3A-19", password: "ET7793", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1119, nick: "T3A-020", name: "Alumno T3A-20", password: "EB5290", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1120, nick: "T3A-021", name: "Alumno T3A-21", password: "OY6484", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1121, nick: "T3A-022", name: "Alumno T3A-22", password: "VR4272", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1122, nick: "T3A-023", name: "Alumno T3A-23", password: "GX8292", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1123, nick: "T3A-024", name: "Alumno T3A-24", password: "GW5594", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1124, nick: "T3A-025", name: "Alumno T3A-25", password: "QY0876", role: "student", tokens: 0, class: "T3A", group: "T3A", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 3B (25 alumnos) - Tutor/a 3
  { id: 1125, nick: "T3B-001", name: "Alumno T3B-01", password: "HB6570", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1126, nick: "T3B-002", name: "Alumno T3B-02", password: "CW1175", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1127, nick: "T3B-003", name: "Alumno T3B-03", password: "RC7508", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1128, nick: "T3B-004", name: "Alumno T3B-04", password: "RB5936", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1129, nick: "T3B-005", name: "Alumno T3B-05", password: "AB4421", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1130, nick: "T3B-006", name: "Alumno T3B-06", password: "II9109", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1131, nick: "T3B-007", name: "Alumno T3B-07", password: "NP5052", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1132, nick: "T3B-008", name: "Alumno T3B-08", password: "CG1875", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1133, nick: "T3B-009", name: "Alumno T3B-09", password: "TM7918", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1134, nick: "T3B-010", name: "Alumno T3B-10", password: "RU4232", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1135, nick: "T3B-011", name: "Alumno T3B-11", password: "UY6036", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1136, nick: "T3B-012", name: "Alumno T3B-12", password: "EQ2562", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1137, nick: "T3B-013", name: "Alumno T3B-13", password: "FF2143", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1138, nick: "T3B-014", name: "Alumno T3B-14", password: "QR6773", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1139, nick: "T3B-015", name: "Alumno T3B-15", password: "PJ8384", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1140, nick: "T3B-016", name: "Alumno T3B-16", password: "HA5361", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1141, nick: "T3B-017", name: "Alumno T3B-17", password: "DV8833", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1142, nick: "T3B-018", name: "Alumno T3B-18", password: "DU4893", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1143, nick: "T3B-019", name: "Alumno T3B-19", password: "GB1786", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1144, nick: "T3B-020", name: "Alumno T3B-20", password: "JV3135", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1145, nick: "T3B-021", name: "Alumno T3B-21", password: "MP2286", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1146, nick: "T3B-022", name: "Alumno T3B-22", password: "RO0673", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1147, nick: "T3B-023", name: "Alumno T3B-23", password: "ZC7288", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1148, nick: "T3B-024", name: "Alumno T3B-24", password: "JJ7184", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1149, nick: "T3B-025", name: "Alumno T3B-25", password: "CB7014", role: "student", tokens: 0, class: "T3B", group: "T3B", tutorId: 3, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 4A (25 alumnos) - Tutor/a 4
  { id: 1150, nick: "T4A-001", name: "Alumno T4A-01", password: "WE0162", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1151, nick: "T4A-002", name: "Alumno T4A-02", password: "HJ7838", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1152, nick: "T4A-003", name: "Alumno T4A-03", password: "HC5580", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1153, nick: "T4A-004", name: "Alumno T4A-04", password: "FH1067", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1154, nick: "T4A-005", name: "Alumno T4A-05", password: "EW1326", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1155, nick: "T4A-006", name: "Alumno T4A-06", password: "OW2181", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1156, nick: "T4A-007", name: "Alumno T4A-07", password: "VP6718", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1157, nick: "T4A-008", name: "Alumno T4A-08", password: "EY7736", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1158, nick: "T4A-009", name: "Alumno T4A-09", password: "DB4638", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1159, nick: "T4A-010", name: "Alumno T4A-10", password: "LS2532", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1160, nick: "T4A-011", name: "Alumno T4A-11", password: "YG0928", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1161, nick: "T4A-012", name: "Alumno T4A-12", password: "BM4765", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1162, nick: "T4A-013", name: "Alumno T4A-13", password: "LQ6633", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1163, nick: "T4A-014", name: "Alumno T4A-14", password: "DP2767", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1164, nick: "T4A-015", name: "Alumno T4A-15", password: "UH4340", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1165, nick: "T4A-016", name: "Alumno T4A-16", password: "XM4266", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1166, nick: "T4A-017", name: "Alumno T4A-17", password: "ZV6573", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1167, nick: "T4A-018", name: "Alumno T4A-18", password: "DD5262", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1168, nick: "T4A-019", name: "Alumno T4A-19", password: "SH9506", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1169, nick: "T4A-020", name: "Alumno T4A-20", password: "BA8548", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1170, nick: "T4A-021", name: "Alumno T4A-21", password: "ZB8686", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1171, nick: "T4A-022", name: "Alumno T4A-22", password: "IT0686", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1172, nick: "T4A-023", name: "Alumno T4A-23", password: "AM3343", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1173, nick: "T4A-024", name: "Alumno T4A-24", password: "DB4618", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1174, nick: "T4A-025", name: "Alumno T4A-25", password: "QH3058", role: "student", tokens: 0, class: "T4A", group: "T4A", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 4B (25 alumnos) - Tutor/a 4
  { id: 1175, nick: "T4B-001", name: "Alumno T4B-01", password: "FV8017", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1176, nick: "T4B-002", name: "Alumno T4B-02", password: "VL9094", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1177, nick: "T4B-003", name: "Alumno T4B-03", password: "XJ4264", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1178, nick: "T4B-004", name: "Alumno T4B-04", password: "NQ1953", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1179, nick: "T4B-005", name: "Alumno T4B-05", password: "KL7626", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1180, nick: "T4B-006", name: "Alumno T4B-06", password: "VB7059", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1181, nick: "T4B-007", name: "Alumno T4B-07", password: "YM1101", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1182, nick: "T4B-008", name: "Alumno T4B-08", password: "HY7472", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1183, nick: "T4B-009", name: "Alumno T4B-09", password: "KT6458", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1184, nick: "T4B-010", name: "Alumno T4B-10", password: "ZN5554", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1185, nick: "T4B-011", name: "Alumno T4B-11", password: "JD5818", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1186, nick: "T4B-012", name: "Alumno T4B-12", password: "DY8442", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1187, nick: "T4B-013", name: "Alumno T4B-13", password: "ZV3727", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1188, nick: "T4B-014", name: "Alumno T4B-14", password: "LB7116", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1189, nick: "T4B-015", name: "Alumno T4B-15", password: "ZE2862", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1190, nick: "T4B-016", name: "Alumno T4B-16", password: "EB8028", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1191, nick: "T4B-017", name: "Alumno T4B-17", password: "XX9561", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1192, nick: "T4B-018", name: "Alumno T4B-18", password: "YE9273", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1193, nick: "T4B-019", name: "Alumno T4B-19", password: "IH4734", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1194, nick: "T4B-020", name: "Alumno T4B-20", password: "AS2273", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1195, nick: "T4B-021", name: "Alumno T4B-21", password: "BN7211", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1196, nick: "T4B-022", name: "Alumno T4B-22", password: "TH7664", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1197, nick: "T4B-023", name: "Alumno T4B-23", password: "FB1056", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1198, nick: "T4B-024", name: "Alumno T4B-24", password: "KV8227", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1199, nick: "T4B-025", name: "Alumno T4B-25", password: "VW5990", role: "student", tokens: 0, class: "T4B", group: "T4B", tutorId: 4, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 5A (25 alumnos) - Tutor/a 5
  { id: 1200, nick: "T5A-001", name: "Alumno T5A-01", password: "RO6028", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1201, nick: "T5A-002", name: "Alumno T5A-02", password: "PP0571", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1202, nick: "T5A-003", name: "Alumno T5A-03", password: "WG1819", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1203, nick: "T5A-004", name: "Alumno T5A-04", password: "YY2198", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1204, nick: "T5A-005", name: "Alumno T5A-05", password: "HI9234", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1205, nick: "T5A-006", name: "Alumno T5A-06", password: "HP8214", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1206, nick: "T5A-007", name: "Alumno T5A-07", password: "IJ0933", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1207, nick: "T5A-008", name: "Alumno T5A-08", password: "IQ2005", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1208, nick: "T5A-009", name: "Alumno T5A-09", password: "DY3784", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1209, nick: "T5A-010", name: "Alumno T5A-10", password: "PA1892", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1210, nick: "T5A-011", name: "Alumno T5A-11", password: "SH1207", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1211, nick: "T5A-012", name: "Alumno T5A-12", password: "PO6418", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1212, nick: "T5A-013", name: "Alumno T5A-13", password: "VC8264", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1213, nick: "T5A-014", name: "Alumno T5A-14", password: "CY3593", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1214, nick: "T5A-015", name: "Alumno T5A-15", password: "MJ2178", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1215, nick: "T5A-016", name: "Alumno T5A-16", password: "OG4986", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1216, nick: "T5A-017", name: "Alumno T5A-17", password: "KF1478", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1217, nick: "T5A-018", name: "Alumno T5A-18", password: "AQ8255", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1218, nick: "T5A-019", name: "Alumno T5A-19", password: "JM9457", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1219, nick: "T5A-020", name: "Alumno T5A-20", password: "CO3077", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1220, nick: "T5A-021", name: "Alumno T5A-21", password: "KK2206", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1221, nick: "T5A-022", name: "Alumno T5A-22", password: "LO6249", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1222, nick: "T5A-023", name: "Alumno T5A-23", password: "JQ2478", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1223, nick: "T5A-024", name: "Alumno T5A-24", password: "ER5640", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1224, nick: "T5A-025", name: "Alumno T5A-25", password: "PF9114", role: "student", tokens: 0, class: "T5A", group: "T5A", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 5B (25 alumnos) - Tutor/a 5
  { id: 1225, nick: "T5B-001", name: "Alumno T5B-01", password: "ME0035", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1226, nick: "T5B-002", name: "Alumno T5B-02", password: "TN6928", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1227, nick: "T5B-003", name: "Alumno T5B-03", password: "MR6932", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1228, nick: "T5B-004", name: "Alumno T5B-04", password: "YV1342", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1229, nick: "T5B-005", name: "Alumno T5B-05", password: "WB9712", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1230, nick: "T5B-006", name: "Alumno T5B-06", password: "DR1013", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1231, nick: "T5B-007", name: "Alumno T5B-07", password: "XR3710", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1232, nick: "T5B-008", name: "Alumno T5B-08", password: "XR3843", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1233, nick: "T5B-009", name: "Alumno T5B-09", password: "BX7829", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1234, nick: "T5B-010", name: "Alumno T5B-10", password: "KB0086", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1235, nick: "T5B-011", name: "Alumno T5B-11", password: "XO6838", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1236, nick: "T5B-012", name: "Alumno T5B-12", password: "NI0473", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1237, nick: "T5B-013", name: "Alumno T5B-13", password: "GV4104", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1238, nick: "T5B-014", name: "Alumno T5B-14", password: "XX5920", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1239, nick: "T5B-015", name: "Alumno T5B-15", password: "JD8271", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1240, nick: "T5B-016", name: "Alumno T5B-16", password: "PO4240", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1241, nick: "T5B-017", name: "Alumno T5B-17", password: "UU4466", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1242, nick: "T5B-018", name: "Alumno T5B-18", password: "JW2796", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1243, nick: "T5B-019", name: "Alumno T5B-19", password: "IE9777", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1244, nick: "T5B-020", name: "Alumno T5B-20", password: "PK8700", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1245, nick: "T5B-021", name: "Alumno T5B-21", password: "VP3980", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1246, nick: "T5B-022", name: "Alumno T5B-22", password: "QJ5995", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1247, nick: "T5B-023", name: "Alumno T5B-23", password: "JN0630", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1248, nick: "T5B-024", name: "Alumno T5B-24", password: "US5387", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1249, nick: "T5B-025", name: "Alumno T5B-25", password: "JP8131", role: "student", tokens: 0, class: "T5B", group: "T5B", tutorId: 5, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 6A (25 alumnos) - Tutor/a 6
  { id: 1250, nick: "T6A-001", name: "Alumno T6A-01", password: "QW6751", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1251, nick: "T6A-002", name: "Alumno T6A-02", password: "OM5170", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1252, nick: "T6A-003", name: "Alumno T6A-03", password: "OR5579", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1253, nick: "T6A-004", name: "Alumno T6A-04", password: "DY5886", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1254, nick: "T6A-005", name: "Alumno T6A-05", password: "AK8367", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1255, nick: "T6A-006", name: "Alumno T6A-06", password: "XL1164", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1256, nick: "T6A-007", name: "Alumno T6A-07", password: "MD1841", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1257, nick: "T6A-008", name: "Alumno T6A-08", password: "JY0932", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1258, nick: "T6A-009", name: "Alumno T6A-09", password: "VE8005", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1259, nick: "T6A-010", name: "Alumno T6A-10", password: "OT1154", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1260, nick: "T6A-011", name: "Alumno T6A-11", password: "FL9480", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1261, nick: "T6A-012", name: "Alumno T6A-12", password: "RZ6480", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1262, nick: "T6A-013", name: "Alumno T6A-13", password: "UR6288", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1263, nick: "T6A-014", name: "Alumno T6A-14", password: "ZN8637", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1264, nick: "T6A-015", name: "Alumno T6A-15", password: "CD4064", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1265, nick: "T6A-016", name: "Alumno T6A-16", password: "OV6121", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1266, nick: "T6A-017", name: "Alumno T6A-17", password: "MB6946", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1267, nick: "T6A-018", name: "Alumno T6A-18", password: "JA6522", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1268, nick: "T6A-019", name: "Alumno T6A-19", password: "RU1153", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1269, nick: "T6A-020", name: "Alumno T6A-20", password: "JI6812", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1270, nick: "T6A-021", name: "Alumno T6A-21", password: "AI6830", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1271, nick: "T6A-022", name: "Alumno T6A-22", password: "EM9228", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1272, nick: "T6A-023", name: "Alumno T6A-23", password: "QM5454", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1273, nick: "T6A-024", name: "Alumno T6A-24", password: "NW9480", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1274, nick: "T6A-025", name: "Alumno T6A-25", password: "HW6139", role: "student", tokens: 0, class: "T6A", group: "T6A", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 6B (25 alumnos) - Tutor/a 6
  { id: 1275, nick: "T6B-001", name: "Alumno T6B-01", password: "KF9274", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1276, nick: "T6B-002", name: "Alumno T6B-02", password: "BZ4462", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1277, nick: "T6B-003", name: "Alumno T6B-03", password: "XN1174", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1278, nick: "T6B-004", name: "Alumno T6B-04", password: "TS3251", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1279, nick: "T6B-005", name: "Alumno T6B-05", password: "CO4596", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1280, nick: "T6B-006", name: "Alumno T6B-06", password: "DW1249", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1281, nick: "T6B-007", name: "Alumno T6B-07", password: "SR9101", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1282, nick: "T6B-008", name: "Alumno T6B-08", password: "LY6075", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1283, nick: "T6B-009", name: "Alumno T6B-09", password: "XF5549", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1284, nick: "T6B-010", name: "Alumno T6B-10", password: "OG2106", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1285, nick: "T6B-011", name: "Alumno T6B-11", password: "MV7902", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1286, nick: "T6B-012", name: "Alumno T6B-12", password: "EK3529", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1287, nick: "T6B-013", name: "Alumno T6B-13", password: "XP5094", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1288, nick: "T6B-014", name: "Alumno T6B-14", password: "XZ0985", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1289, nick: "T6B-015", name: "Alumno T6B-15", password: "VM6452", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1290, nick: "T6B-016", name: "Alumno T6B-16", password: "ZL8356", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1291, nick: "T6B-017", name: "Alumno T6B-17", password: "JT0781", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1292, nick: "T6B-018", name: "Alumno T6B-18", password: "DN0682", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1293, nick: "T6B-019", name: "Alumno T6B-19", password: "NA1246", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1294, nick: "T6B-020", name: "Alumno T6B-20", password: "MT7055", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1295, nick: "T6B-021", name: "Alumno T6B-21", password: "CH0014", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1296, nick: "T6B-022", name: "Alumno T6B-22", password: "WQ7723", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1297, nick: "T6B-023", name: "Alumno T6B-23", password: "OQ3175", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1298, nick: "T6B-024", name: "Alumno T6B-24", password: "VS8138", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1299, nick: "T6B-025", name: "Alumno T6B-25", password: "OW8444", role: "student", tokens: 0, class: "T6B", group: "T6B", tutorId: 6, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 7A (25 alumnos) - Tutor/a 7
  { id: 1300, nick: "T7A-001", name: "Alumno T7A-01", password: "CM4891", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1301, nick: "T7A-002", name: "Alumno T7A-02", password: "YM5535", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1302, nick: "T7A-003", name: "Alumno T7A-03", password: "VI7488", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1303, nick: "T7A-004", name: "Alumno T7A-04", password: "LH3826", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1304, nick: "T7A-005", name: "Alumno T7A-05", password: "LR1611", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1305, nick: "T7A-006", name: "Alumno T7A-06", password: "QU1792", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1306, nick: "T7A-007", name: "Alumno T7A-07", password: "ME0371", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1307, nick: "T7A-008", name: "Alumno T7A-08", password: "AS0349", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1308, nick: "T7A-009", name: "Alumno T7A-09", password: "AP1262", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1309, nick: "T7A-010", name: "Alumno T7A-10", password: "FF4230", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1310, nick: "T7A-011", name: "Alumno T7A-11", password: "VQ7525", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1311, nick: "T7A-012", name: "Alumno T7A-12", password: "JT2746", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1312, nick: "T7A-013", name: "Alumno T7A-13", password: "LI5891", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1313, nick: "T7A-014", name: "Alumno T7A-14", password: "HQ9333", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1314, nick: "T7A-015", name: "Alumno T7A-15", password: "YR4712", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1315, nick: "T7A-016", name: "Alumno T7A-16", password: "XL7421", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1316, nick: "T7A-017", name: "Alumno T7A-17", password: "QP9078", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1317, nick: "T7A-018", name: "Alumno T7A-18", password: "WG0255", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1318, nick: "T7A-019", name: "Alumno T7A-19", password: "WF8860", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1319, nick: "T7A-020", name: "Alumno T7A-20", password: "BZ7677", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1320, nick: "T7A-021", name: "Alumno T7A-21", password: "SC2735", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1321, nick: "T7A-022", name: "Alumno T7A-22", password: "RC4752", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1322, nick: "T7A-023", name: "Alumno T7A-23", password: "SZ1695", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1323, nick: "T7A-024", name: "Alumno T7A-24", password: "RU0707", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1324, nick: "T7A-025", name: "Alumno T7A-25", password: "IY4792", role: "student", tokens: 0, class: "T7A", group: "T7A", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },

  // Grupo 7B (25 alumnos) - Tutor/a 7
  { id: 1325, nick: "T7B-001", name: "Alumno T7B-01", password: "OM4525", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1326, nick: "T7B-002", name: "Alumno T7B-02", password: "TS0305", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1327, nick: "T7B-003", name: "Alumno T7B-03", password: "WZ9154", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1328, nick: "T7B-004", name: "Alumno T7B-04", password: "ZH8333", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1329, nick: "T7B-005", name: "Alumno T7B-05", password: "GF8728", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1330, nick: "T7B-006", name: "Alumno T7B-06", password: "MS5125", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1331, nick: "T7B-007", name: "Alumno T7B-07", password: "HO8147", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1332, nick: "T7B-008", name: "Alumno T7B-08", password: "OS5675", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1333, nick: "T7B-009", name: "Alumno T7B-09", password: "MU6900", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1334, nick: "T7B-010", name: "Alumno T7B-10", password: "AO3560", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1335, nick: "T7B-011", name: "Alumno T7B-11", password: "SR6422", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1336, nick: "T7B-012", name: "Alumno T7B-12", password: "DE4754", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1337, nick: "T7B-013", name: "Alumno T7B-13", password: "YG5807", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1338, nick: "T7B-014", name: "Alumno T7B-14", password: "MI2357", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1339, nick: "T7B-015", name: "Alumno T7B-15", password: "TI6715", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1340, nick: "T7B-016", name: "Alumno T7B-16", password: "YB6902", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1341, nick: "T7B-017", name: "Alumno T7B-17", password: "PN5549", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1342, nick: "T7B-018", name: "Alumno T7B-18", password: "DR2230", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1343, nick: "T7B-019", name: "Alumno T7B-19", password: "HC2815", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1344, nick: "T7B-020", name: "Alumno T7B-20", password: "ZS6190", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1345, nick: "T7B-021", name: "Alumno T7B-21", password: "TD0932", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1346, nick: "T7B-022", name: "Alumno T7B-22", password: "QD7834", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1347, nick: "T7B-023", name: "Alumno T7B-23", password: "TH7346", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1348, nick: "T7B-024", name: "Alumno T7B-24", password: "EE9122", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() },
  { id: 1349, nick: "T7B-025", name: "Alumno T7B-25", password: "DQ0963", role: "student", tokens: 0, class: "T7B", group: "T7B", tutorId: 7, ethAddress: generateEthAddress(), seedPhrase: generateSeedPhrase() }

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
      const tutor = tutors.find(t => t.email === userData.email);
      if (!tutor) {
        showNotification('❌ Email no encontrado', 'error');
        return;
      }
      if (tutor.password !== userData.password) {
        showNotification('❌ Contraseña incorrecta', 'error');
        return;
      }
      setCurrentUser(tutor);
      setView('wallet');
      showNotification(`✅ Bienvenido/a ${tutor.name}`, 'success');
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

  // NUEVA: Revertir una transacción
  const revertTransaction = async (transactionId) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (!tx || tx.status === 'reverted') {
      showNotification('❌ No se puede revertir esta transacción', 'error');
      return;
    }

    const sender = users.find(u => u.ethAddress === tx.from);
    const receiver = users.find(u => u.ethAddress === tx.to);

    if (!sender || !receiver) {
      showNotification('❌ Error: usuarios no encontrados', 'error');
      return;
    }

    const totalAmount = tx.amount + tx.gasFee;
    const updatedUsers = users.map(u => {
      if (u.id === sender.id) return { ...u, tokens: u.tokens + totalAmount };
      if (u.id === receiver.id) return { ...u, tokens: Math.max(0, u.tokens - tx.amount) };
      return u;
    });

    const updatedTransactions = transactions.map(t => 
      t.id === transactionId 
        ? { ...t, status: 'reverted', revertedBy: currentUser.name, revertedAt: new Date().toISOString() }
        : t
    );

    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    setTransactions(updatedTransactions);
    showNotification('✅ Transacción revertida exitosamente', 'success');
  };

  const updateGroupName = async (groupId, newName) => {
    const updatedUsers = users.map(u => {
      if (u.id === currentUser.id && u.role === 'tutor') {
        return {
          ...u,
          groups: u.groups.map(g => 
            g.id === groupId ? { ...g, customName: newName } : g
          )
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    await saveUsers(updatedUsers);
    showNotification('✅ Nombre de grupo actualizado', 'success');
  };

  const exportCredentials = (groupId) => {
    const tutor = users.find(u => u.role === 'tutor' && u.id === currentUser.id);
    if (!tutor) return;

    const group = tutor.groups.find(g => g.id === groupId);
    const groupStudents = users.filter(u => u.group === groupId);
    const groupName = group?.customName || group?.name || groupId;
    
    let csv = 'Nick,Password,Tokens,Grupo\n';
    groupStudents.forEach(student => {
      csv += `${student.nick},${student.password},${student.tokens},${groupName}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `credenciales_${groupName.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('✅ Credenciales exportadas', 'success');
  };

  const printCredentials = (groupId) => {
    const tutor = users.find(u => u.role === 'tutor' && u.id === currentUser.id);
    if (!tutor) return;

    const group = tutor.groups.find(g => g.id === groupId);
    const groupStudents = users.filter(u => u.group === groupId);
    const groupName = group?.customName || group?.name || groupId;
    
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Credenciales - ${groupName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #7c3aed; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #7c3aed; color: white; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Credenciales de Acceso - ${groupName}</h1>
          <p>IES Luis Braille - BraiBit System</p>
          <table>
            <thead>
              <tr>
                <th>Nick</th>
                <th>Contraseña</th>
                <th>Tokens</th>
              </tr>
            </thead>
            <tbody>
              ${groupStudents.map(s => `
                <tr>
                  <td>${s.nick}</td>
                  <td>${s.password}</td>
                  <td>${s.tokens} BB</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #7c3aed; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimir
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
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

      {/* MODAL: GESTIÓN DE GRUPOS */}
      {showGroupManagement && currentUser && currentUser.role === 'tutor' && currentUser.groups && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6" />
                Gestión de Mis Grupos
              </h2>
              <button
                onClick={() => {
                  setShowGroupManagement(false);
                  setEditingGroup(null);
                }}
                className="text-white/80 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {currentUser.groups.map((group) => {
                const groupStudents = users.filter(u => u.group === group.id);
                const groupName = group.customName || group.name;

                return (
                  <div key={group.id} className="bg-white/10 backdrop-blur rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        {editingGroup === group.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              defaultValue={groupName}
                              placeholder="Nombre del grupo"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  updateGroupName(group.id, e.target.value);
                                  setEditingGroup(null);
                                }
                              }}
                              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={(e) => {
                                const input = e.target.parentElement.querySelector('input');
                                updateGroupName(group.id, input.value);
                                setEditingGroup(null);
                              }}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingGroup(null)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-white">{groupName}</h3>
                            <button
                              onClick={() => setEditingGroup(group.id)}
                              className="text-white/60 hover:text-white transition"
                            >
                              ✏️ Editar
                            </button>
                          </div>
                        )}
                        <p className="text-gray-300 mt-1">
                          {groupStudents.length} alumno{groupStudents.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCredentials(group.id)}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Ver Credenciales
                      </button>
                      <button
                        onClick={() => exportCredentials(group.id)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      >
                        📥 CSV
                      </button>
                      <button
                        onClick={() => printCredentials(group.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                      >
                        🖨️ Imprimir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VER CREDENCIALES */}
      {showCredentials && currentUser && currentUser.role === 'tutor' && currentUser.groups && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {(() => {
              const group = currentUser.groups.find(g => g.id === showCredentials);
              const groupStudents = users.filter(u => u.group === showCredentials);
              const groupName = group?.customName || group?.name;

              return (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Credenciales - {groupName}
                    </h2>
                    <button
                      onClick={() => setShowCredentials(null)}
                      className="text-white/80 hover:text-white transition"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="bg-white/10 backdrop-blur rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-white/20">
                          <th className="px-4 py-3 text-left text-white font-semibold">Nick</th>
                          <th className="px-4 py-3 text-left text-white font-semibold">Contraseña</th>
                          <th className="px-4 py-3 text-left text-white font-semibold">Tokens</th>
                          <th className="px-4 py-3 text-left text-white font-semibold">Nombre</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupStudents.map((student, index) => (
                          <tr key={student.id} className={index % 2 === 0 ? 'bg-white/5' : ''}>
                            <td className="px-4 py-3 text-white font-mono">{student.nick}</td>
                            <td className="px-4 py-3 text-white font-mono">{student.password}</td>
                            <td className="px-4 py-3 text-white">{formatNumber(student.tokens)} BB</td>
                            <td className="px-4 py-3 text-gray-300">{student.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => exportCredentials(showCredentials)}
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                    >
                      📥 Exportar CSV
                    </button>
                    <button
                      onClick={() => printCredentials(showCredentials)}
                      className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2"
                    >
                      🖨️ Imprimir
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

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

        {currentUser.role === 'tutor' && (
          <button
            onClick={() => setShowGroupManagement(true)}
            className="flex items-center gap-3 px-6 py-3 rounded-xl transition text-gray-300 hover:text-white hover:bg-white/5 font-semibold whitespace-nowrap"
          >
            <Users className="w-5 h-5" />
            👥 Mis Grupos
          </button>
        )}
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
          {/* Selector de Alumnos */}
          <div>
            <label className="block text-gray-300 text-sm mb-2 font-semibold">
              👤 Selecciona Alumno/a
            </label>
            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(Number(e.target.value))}
              className="w-full px-4 py-3 bg-gray-800 border border-white/10 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
            >
              <option value="">-- Elige un alumno --</option>
              {users.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.group || student.class}) - {formatNumber(student.tokens)} {CURRENCY_SYMBOL}
                </option>
              ))}
            </select>
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
  const [filter, setFilter] = React.useState('all');
  
  const filteredTx = currentUser.role === "tutor" 
    ? transactions 
    : transactions.filter(tx => tx.from === currentUser.ethAddress || tx.to === currentUser.ethAddress);

  const displayTx = filteredTx.filter((tx) => {
    if (filter === "received") return tx.to === currentUser.ethAddress;
    if (filter === "sent") return tx.from === currentUser.ethAddress;
    return true;
  });

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

      {displayTx.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No hay transacciones en el historial</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayTx.map(tx => {
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






}
export default BraiBitEcosystem;
