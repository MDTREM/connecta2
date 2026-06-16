/**
 * Script para criar o usuário admin inicial no Firebase
 * 
 * Execute este script UMA VEZ para criar o admin:
 *   node src/firebase/setup-admin.mjs
 * 
 * Depois de criar, faça login no app com:
 *   Email: admin@connecta.com
 *   Senha: admin123456
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCtCpKFoZ2eSTrZs7WpxKbUIR3q2aVAnx4",
  authDomain: "connecta-8d2ff.firebaseapp.com",
  projectId: "connecta-8d2ff",
  storageBucket: "connecta-8d2ff.firebasestorage.app",
  messagingSenderId: "401155167184",
  appId: "1:401155167184:web:5013e3052dd431a9041fd5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdmin() {
  try {
    console.log('🔧 Criando usuário admin no Firebase Auth...');
    
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      'admin@connecta.com', 
      'admin123456'
    );
    
    const uid = userCredential.user.uid;
    console.log(`✅ Usuário Auth criado com UID: ${uid}`);

    console.log('📝 Salvando perfil admin no Firestore...');
    
    await setDoc(doc(db, 'users', uid), {
      id: uid,
      email: 'admin@connecta.com',
      role: 'admin',
      name: 'Suporte Connecta+',
      registrationStatus: 'approved',
      banned: false,
      ouroCoins: 0,
      createdAt: Date.now()
    });

    console.log('✅ Admin criado com sucesso!');
    console.log('');
    console.log('📋 Credenciais:');
    console.log('   Email: admin@connecta.com');
    console.log('   Senha: admin123456');
    console.log('');
    console.log('⚠️  Troque a senha após o primeiro login!');
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Admin já existe! Use as credenciais para fazer login.');
    } else {
      console.error('❌ Erro ao criar admin:', error.message);
    }
    process.exit(1);
  }
}

createAdmin();
