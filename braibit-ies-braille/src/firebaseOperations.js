// Firebase database operations for BraiBit
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query,
  onSnapshot 
} from 'firebase/firestore';

// ===== USERS =====

export const saveUsers = async (users) => {
  try {
    await setDoc(doc(db, 'system', 'users'), { data: users });
    return true;
  } catch (error) {
    console.error('Error saving users:', error);
    return false;
  }
};

export const getUsers = async () => {
  try {
    const docRef = doc(db, 'system', 'users');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().data;
    }
    return null;
  } catch (error) {
    console.error('Error getting users:', error);
    return null;
  }
};

// ===== BLOCKCHAIN =====

export const saveBlockchain = async (blockchain) => {
  try {
    await setDoc(doc(db, 'system', 'blockchain'), { data: blockchain });
    return true;
  } catch (error) {
    console.error('Error saving blockchain:', error);
    return false;
  }
};

export const getBlockchain = async () => {
  try {
    const docRef = doc(db, 'system', 'blockchain');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().data;
    }
    return null;
  } catch (error) {
    console.error('Error getting blockchain:', error);
    return null;
  }
};

// ===== TASKS =====

export const saveTasks = async (tasks) => {
  try {
    await setDoc(doc(db, 'system', 'tasks'), { data: tasks });
    return true;
  } catch (error) {
    console.error('Error saving tasks:', error);
    return false;
  }
};

export const getTasks = async () => {
  try {
    const docRef = doc(db, 'system', 'tasks');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().data;
    }
    return null;
  } catch (error) {
    console.error('Error getting tasks:', error);
    return null;
  }
};

// ===== PRODUCTS =====

export const saveProducts = async (products) => {
  try {
    await setDoc(doc(db, 'system', 'products'), { data: products });
    return true;
  } catch (error) {
    console.error('Error saving products:', error);
    return false;
  }
};

export const getProducts = async () => {
  try {
    const docRef = doc(db, 'system', 'products');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().data;
    }
    return null;
  } catch (error) {
    console.error('Error getting products:', error);
    return null;
  }
};

// ===== REAL-TIME LISTENERS =====

export const subscribeToUsers = (callback) => {
  const docRef = doc(db, 'system', 'users');
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().data);
    }
  });
};

export const subscribeToBlockchain = (callback) => {
  const docRef = doc(db, 'system', 'blockchain');
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().data);
    }
  });
};
