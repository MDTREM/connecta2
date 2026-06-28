import { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { IS_BETA_EVENTS_ONLY } from '../config';
import { 
  collection, doc, setDoc, updateDoc, deleteDoc, 
  onSnapshot
} from 'firebase/firestore';

// Safely wrap localStorage.setItem to avoid QuotaExceededError crashes when disk/quota is full
const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
  try {
    originalSetItem.call(localStorage, key, value);
  } catch (e) {
    console.warn("Local storage quota exceeded or unavailable:", e);
  }
};

const FirebaseMockContext = createContext();

const generateRandomHiringId = () => 'hire_' + Math.random().toString(36).substr(2, 9);
const generateRandomOrderId = () => 'OP-' + Math.floor(100000 + Math.random() * 900000);
const generateRandomTicketOrderId = () => 'TK-' + Math.floor(100000 + Math.random() * 900000);

export const FirebaseMockProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [deletedUsers, setDeletedUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [events, setEvents] = useState([]);
  const [services, setServices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [videos, setVideos] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [videoComments, setVideoComments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [servicesHired, setServicesHired] = useState([]);
  const [chats, setChats] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('connecta_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [userLocation, setUserLocation] = useState('Centro Histórico, Ouro Preto - MG');
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('connecta_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [productReviews, setProductReviews] = useState([]);
  const [serviceReviews, setServiceReviews] = useState([]);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [servicesLoaded, setServicesLoaded] = useState(false);
  const [bannersLoaded, setBannersLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [homeSectionsLoaded, setHomeSectionsLoaded] = useState(false);
  const [authFirebaseUser, setAuthFirebaseUser] = useState(null);

  // Failsafe load timeout for slow networks/devices (resolves loading in 3.5s max)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.warn("Failsafe loaded trigger fired due to slow connection.");
      setUsersLoaded(true);
      setProductsLoaded(true);
      setEventsLoaded(true);
      setServicesLoaded(true);
      setBannersLoaded(true);
      setCategoriesLoaded(true);
      setHomeSectionsLoaded(true);
      setJobsLoaded(true);
      setIsAuthLoading(false);
      setAuthInitialized(true);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);
  const [banners, setBanners] = useState([]);
  const [homeSections, setHomeSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [visualLayoutSettings, setVisualLayoutSettings] = useState(() => {
    const saved = localStorage.getItem('connecta_visual_layout_settings');
    return saved ? JSON.parse(saved) : {
      customTexts: {},
      customColors: {},
      sectionOrder: ['banner', 'categories', 'flashDeals', 'nearbyStores', 'products', 'buyers', 'events', 'services'],
      avatarOffset: { top: -36, left: 32 }
    };
  });

  const parseDateStr = (dateStr) => {
    if (!dateStr) return new Date(0);
    const parts = dateStr.split(' às ');
    const dateParts = parts[0].split('/');
    let timeParts = [0, 0];
    if (parts[1]) {
      timeParts = parts[1].split(':');
    }
    return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
  };

  const getCoinsUsedInPeriod = (days) => {
    if (!currentUser) return 0;
    const now = new Date();
    const timeLimit = now.getTime() - (days * 24 * 60 * 60 * 1000);
    
    let totalCoins = 0;
    orders.forEach(o => {
      if ((o.customerId === currentUser.id || o.userId === currentUser.id) && o.coinsUsed) {
        const d = parseDateStr(o.date);
        if (d.getTime() >= timeLimit) {
          totalCoins += o.coinsUsed;
        }
      }
    });
    servicesHired.forEach(sh => {
      if ((sh.customerId === currentUser.id || sh.userId === currentUser.id) && sh.coinsUsed) {
        const d = new Date(sh.date + 'T12:00:00');
        if (d.getTime() >= timeLimit) {
          totalCoins += sh.coinsUsed;
        }
      }
    });
    return totalCoins;
  };

  // --- Firestore real-time listeners ---
  useEffect(() => {
    // Public subscriptions that anyone (even guest users) can read
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setUsers(list);
      setUsersLoaded(true);
    }, (error) => {
      console.warn("Users subscription warning:", error);
      setUsersLoaded(true);
    });

    const unsubDeletedUsers = onSnapshot(collection(db, 'deletedUsers'), (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setDeletedUsers(list);
    }, (error) => {
      console.warn("DeletedUsers subscription warning:", error);
    });

    let unsubProducts = () => {};
    let unsubServices = () => {};
    let unsubVideos = () => {};
    let unsubReviews = () => {};
    let unsubServiceReviews = () => {};
    let unsubVideoComments = () => {};
    let unsubCategories = () => {};
    let unsubJobs = () => {};

    if (IS_BETA_EVENTS_ONLY) {
      setProductsLoaded(true);
      setServicesLoaded(true);
      setCategoriesLoaded(true);
      setJobsLoaded(true);
    }

    if (!IS_BETA_EVENTS_ONLY) {
      unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
        setProducts(list);
        setProductsLoaded(true);
      }, (error) => {
        console.warn("Products subscription error:", error);
        setProductsLoaded(true);
      });
    }

    const unsubEvents = onSnapshot(collection(db, 'events'), (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setEvents(list);
      setEventsLoaded(true);
    }, (error) => {
      console.warn("Events subscription error:", error);
      setEventsLoaded(true);
    });

    if (!IS_BETA_EVENTS_ONLY) {
      unsubServices = onSnapshot(collection(db, 'services'), (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
        setServices(list);
        setServicesLoaded(true);
      }, (error) => {
        console.warn("Services subscription error:", error);
        setServicesLoaded(true);
      });

      unsubVideos = onSnapshot(collection(db, 'videos'), (snapshot) => {
        const list = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (doc.id && !doc.id.startsWith('vid_default_')) {
            list.push({ ...data, id: doc.id });
          }
        });
        setVideos(list);
      });
    }

    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), code: doc.id }));
      setCoupons(list);
    });

    if (!IS_BETA_EVENTS_ONLY) {
      unsubReviews = onSnapshot(collection(db, 'productReviews'), (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
        setProductReviews(list);
      });

      unsubServiceReviews = onSnapshot(collection(db, 'serviceReviews'), (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
        setServiceReviews(list);
      }, (error) => console.warn("ServiceReviews subscription warning:", error));

      unsubVideoComments = onSnapshot(collection(db, 'videoComments'), (snapshot) => {
        const list = [];
        snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
        setVideoComments(list);
      }, (error) => console.warn("videoComments subscription warning:", error));

      unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
        if (snapshot.empty) {
          const defaultCats = [
            { label: 'Artesanato', key: 'Artesanato', type: 'lojas', icon: 'Palette', order: 0 },
            { label: 'Lembranças', key: 'Lembranças', type: 'lojas', icon: 'Gift', order: 1 },
            { label: 'Gastronomia', key: 'Gastronomia', type: 'lojas', icon: 'Utensils', order: 2 },
            { label: 'Alimentos', key: 'Alimentos', type: 'lojas', icon: 'ShoppingBag', order: 3 },
            { label: 'Bebidas', key: 'Bebidas', type: 'lojas', icon: 'Coffee', order: 4 },
            { label: 'Outros', key: 'Outros', type: 'lojas', icon: 'Sparkles', order: 5 },
            { label: 'Guia Turístico / Roteiros', key: 'Guia Turístico', type: 'servicos', icon: 'Compass', order: 0 },
            { label: 'Fotógrafo', key: 'Fotógrafo', type: 'servicos', icon: 'Camera', order: 1 },
            { label: 'Diarista / Faxina', key: 'Diarista', type: 'servicos', icon: 'Activity', order: 2 },
            { label: 'Manutenção Geral', key: 'Marido de Aluguel', type: 'servicos', icon: 'Wrench', order: 3 },
            { label: 'Entregas Grandes / Mudanças', key: 'Fretes', type: 'servicos', icon: 'Truck', order: 4 },
            { label: 'Entrega de Moto', key: 'Moto', type: 'entregadores', icon: 'Bike', order: 5 },
            { label: 'Entrega de Carro / Fretes', key: 'Carro', type: 'entregadores', icon: 'Truck', order: 6 }
          ];
          defaultCats.forEach((cat, index) => {
            const catId = `cat_default_${index}`;
            setDoc(doc(db, 'categories', catId), {
              id: catId,
              ...cat,
              desc: '',
              active: true,
              createdAt: Date.now()
            }).catch(err => console.error("Error seeding category:", err));
          });
          setCategoriesLoaded(true);
        } else {
          const list = [];
          snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          setCategories(list);
          setCategoriesLoaded(true);
        }
      }, (error) => {
        console.warn("Categories subscription error:", error);
        setCategoriesLoaded(true);
      });
    }

    const unsubBanners = onSnapshot(collection(db, 'banners'), (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      setBanners(list);
      setBannersLoaded(true);
    }, (error) => {
      console.warn("Banners subscription warning:", error);
      setBannersLoaded(true);
    });

    const unsubHomeSections = onSnapshot(collection(db, 'homeSections'), (snapshot) => {
      const list = [];
      snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
      list.sort((a, b) => (a.order || 0) - (b.order || 0));
      setHomeSections(list);
      setHomeSectionsLoaded(true);
    }, (error) => {
      console.warn("HomeSections subscription warning:", error);
      setHomeSectionsLoaded(true);
    });

    if (!IS_BETA_EVENTS_ONLY) {
      unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
        if (snapshot.empty) {
          const defaultJobs = [
            {
              id: 'job_default_1',
              companyName: 'Café das Flores',
              cnpj: '12.345.678/0001-90',
              title: 'Auxiliar Administrativo',
              description: 'Atendimento ao público, controle de caixa e organização de planilhas. Necessário conhecimento básico de Excel e boa comunicação.',
              location: 'Centro Histórico, Ouro Preto - MG',
              contactType: 'both',
              whatsapp: '31988888888',
              email: 'vagas@cafedasflores.com.br',
              photo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500',
              createdAt: Date.now()
            },
            {
              id: 'job_default_2',
              companyName: 'Pedra Sabão Arte',
              cnpj: '98.765.432/0001-10',
              title: 'Atendente de Vendas',
              description: 'Venda de artesanatos locais, recepção e atendimento caloroso a turistas e moradores. Organização de vitrines e controle de estoque básico.',
              location: 'Feirinha de Pedra Sabão, Ouro Preto - MG',
              contactType: 'whatsapp',
              whatsapp: '31977777777',
              email: '',
              photo: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=500',
              createdAt: Date.now() - 3600000
            },
            {
              id: 'job_default_3',
              companyName: 'Restaurante Contos de Réis',
              cnpj: '45.678.901/0001-23',
              title: 'Garçom / Garçonete',
              description: 'Apresentar cardápio, servir mesas, tirar pedidos e zelar pela higiene e boa experiência do cliente. Desejável inglês ou espanhol básico.',
              location: 'Centro, Ouro Preto - MG',
              contactType: 'email',
              whatsapp: '',
              email: 'rh@contosdereis.com.br',
              photo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500',
              createdAt: Date.now() - 7200000
            }
          ];
          defaultJobs.forEach(job => {
            setDoc(doc(db, 'jobs', job.id), job).catch(err => console.error("Error seeding job:", err));
          });
          setJobs(defaultJobs);
          setJobsLoaded(true);
        } else {
          const list = [];
          snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          setJobs(list);
          setJobsLoaded(true);
        }
      }, (error) => {
        console.warn("Jobs subscription warning:", error);
        setJobsLoaded(true);
      });
    }

    const unsubSettings = onSnapshot(doc(db, 'settings', 'visualLayout'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setVisualLayoutSettings(data);
        localStorage.setItem('connecta_visual_layout_settings', JSON.stringify(data));
      } else {
        const defaultSettings = {
          customTexts: {},
          customColors: {},
          sectionOrder: ['banner', 'categories', 'flashDeals', 'nearbyStores', 'products', 'buyers', 'events', 'services'],
          avatarOffset: { top: -36, left: 32 },
          homeBanner: {
            title: 'Artesanato & Tradição',
            desc: 'Peças em Pedra-Sabão direto de Ouro Preto',
            img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500',
            link: 'Artesanato'
          },
          commissions: {
            products: 10,
            tickets: 10,
            services: 10
          }
        };
        setDoc(doc(db, 'settings', 'visualLayout'), defaultSettings).catch(err => console.error(err));
      }
    });

    // Refs for dynamically managed authenticated subscriptions
    let unsubOrders = null;
    let unsubServicesHired = null;
    let unsubChats = null;
    let unsubNotifications = null;

    const cleanAuthSubscriptions = () => {
      if (unsubOrders) { unsubOrders(); unsubOrders = null; }
      if (unsubServicesHired) { unsubServicesHired(); unsubServicesHired = null; }
      if (unsubChats) { unsubChats(); unsubChats = null; }
      if (unsubNotifications) { unsubNotifications(); unsubNotifications = null; }
    };

    // Firebase Auth listener to auto-restore session
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setAuthFirebaseUser(firebaseUser);
      setAuthInitialized(true);
      if (firebaseUser) {
        // Create authenticated subscriptions
        cleanAuthSubscriptions();

        unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
          const list = [];
          snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
          setOrders(list);
        }, (error) => console.error("Orders subscription error:", error));

        unsubServicesHired = onSnapshot(collection(db, 'servicesHired'), (snapshot) => {
          const list = [];
          snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
          setServicesHired(list);
        }, (error) => console.error("ServicesHired subscription error:", error));

        unsubChats = onSnapshot(collection(db, 'chats'), (snapshot) => {
          const list = [];
          snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
          setChats(list);
        }, (error) => console.error("Chats subscription error:", error));

        unsubNotifications = onSnapshot(collection(db, 'notifications'), (snapshot) => {
          const list = [];
          snapshot.forEach(doc => list.push({ ...doc.data(), id: doc.id }));
          setNotifications(list);
        }, (error) => console.error("Notifications subscription error:", error));

      } else {
        setCurrentUser(null);
        cleanAuthSubscriptions();
        setOrders([]);
        setServicesHired([]);
        setChats([]);
        setNotifications([]);
      }
    });

    return () => {
      unsubUsers();
      unsubDeletedUsers();
      unsubProducts();
      unsubEvents();
      unsubServices();
      unsubVideos();
      unsubCoupons();
      unsubReviews();
      unsubServiceReviews();
      unsubVideoComments();
      unsubCategories();
      unsubBanners();
      unsubHomeSections();
      unsubJobs();
      unsubSettings();
      cleanAuthSubscriptions();
      unsubAuth();
    };
  }, []);

  // Manage currentUser and isAuthLoading deterministically
  useEffect(() => {
    if (!authInitialized) {
      setIsAuthLoading(true);
      return;
    }

    if (!authFirebaseUser) {
      setCurrentUser(null);
      setIsAuthLoading(false);
    } else {
      if (usersLoaded) {
        const userDoc = users.find(u => u.id === authFirebaseUser.uid);
        if (userDoc) {
          if (!userDoc.banned) {
            setCurrentUser(userDoc);
          } else {
            signOut(auth).catch(err => console.error(err));
            setCurrentUser(null);
          }
        } else {
          // Verify if the user is in the deletedUsers list
          const isDeleted = deletedUsers.some(du => du.id === authFirebaseUser.uid);
          if (isDeleted) {
            signOut(auth).catch(err => console.error(err));
            setCurrentUser(null);
          }
        }
        setIsAuthLoading(false);
      } else {
        setIsAuthLoading(true);
      }
    }
  }, [authInitialized, authFirebaseUser, usersLoaded, users, deletedUsers]);

  // Sync currentUser with localStorage and fresh Firestore data
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('connecta_current_user', JSON.stringify(currentUser));
      const freshUser = users.find(u => u.id === currentUser.id);
      if (usersLoaded && !freshUser) {
        setTimeout(() => {
          signOut(auth).catch(err => console.error(err));
          setCurrentUser(null);
          localStorage.removeItem('connecta_current_user');
        }, 0);
      } else if (freshUser && JSON.stringify(freshUser) !== JSON.stringify(currentUser)) {
        setTimeout(() => setCurrentUser(freshUser), 0);
      }
    } else {
      localStorage.removeItem('connecta_current_user');
    }
  }, [currentUser, users, usersLoaded]);

  useEffect(() => {
    localStorage.setItem('connecta_cart', JSON.stringify(cart));
  }, [cart]);


  // --- AUTH SERVICES ---
  const login = async (email, password) => {
    // 1. Verificar primeiro se é um comissário cadastrado localmente pelo organizador
    const localUser = users.find(u => u.email?.toLowerCase() === email?.toLowerCase() && u.role === 'commissioner');
    if (localUser) {
      if (localUser.banned) {
        return { success: false, message: 'Eita! Esta conta foi suspensa por descumprir as regras.' };
      }
      if (localUser.commissionerPassword && localUser.commissionerPassword === password) {
        setCurrentUser(localUser);
        return { success: true, user: localUser };
      }
      if (localUser.commissionerPassword) {
        return { success: false, message: 'Senha incorreta para esta conta de comissário.' };
      }
    }

    // 2. Autenticação padrão do Firebase para os demais usuários
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const userDoc = users.find(u => u.id === uid);
      if (!userDoc) {
        return { success: false, message: 'Usuário não encontrado no banco de dados.' };
      }
      if (userDoc.banned) {
        return { success: false, message: 'Eita! Esta conta foi suspensa por descumprir as regras.' };
      }
      setCurrentUser(userDoc);
      return { success: true, user: userDoc };
    } catch (error) {
      let message = 'Ops! E-mail ou senha incorretos, uai.';
      if (error.code === 'auth/user-not-found') message = 'E-mail não cadastrado.';
      if (error.code === 'auth/wrong-password') message = 'Senha incorreta.';
      if (error.code === 'auth/invalid-credential') message = 'E-mail ou senha incorretos.';
      if (error.code === 'auth/too-many-requests') message = 'Muitas tentativas. Aguarde um momento.';
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error('Logout error:', e);
    }
    setCurrentUser(null);
    setCart([]);
  };

  const signup = async (userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const uid = userCredential.user.uid;
      const status = 'approved';

      const newUser = {
        id: uid,
        email: userData.email,
        role: userData.role,
        name: userData.name,
        phone: userData.phone || '',
        address: userData.address || '',
        registrationStatus: status,
        banned: false,
        createdAt: Date.now(),
        ...userData,
        ouroCoins: 0,
        id: uid
      };
      delete newUser.password;

      await setDoc(doc(db, 'users', uid), newUser);
      setCurrentUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      let message = 'Erro ao criar conta.';
      if (error.code === 'auth/email-already-in-use') message = 'Já existe uma conta com este e-mail!';
      if (error.code === 'auth/weak-password') message = 'A senha deve ter pelo menos 6 caracteres.';
      if (error.code === 'auth/invalid-email') message = 'E-mail inválido.';
      return { success: false, message };
    }
  };

  const updateRegistrationStatus = (userId, newStatus) => {
    updateDoc(doc(db, 'users', userId), { registrationStatus: newStatus }).catch(err => console.error(err));
    createNotification(userId, `Atenção: O status do seu cadastro foi atualizado para "${newStatus === 'approved' ? 'Aprovado' : newStatus === 'pending' ? 'Em Análise' : 'Recusado'}".`);
  };

  const setUserBanStatus = (userId, isBanned) => {
    updateDoc(doc(db, 'users', userId), { banned: isBanned }).catch(err => console.error(err));
    if (currentUser && currentUser.id === userId && isBanned) {
      logout();
    }
  };


  // --- CATALOG SERVICES ---
  const addProduct = (prodData) => {
    const newId = 'prod_' + Math.random().toString(36).substr(2, 9);
    const newProd = {
      id: newId,
      active: true,
      soldCount: 0,
      originalPrice: prodData.originalPrice ? parseFloat(prodData.originalPrice) : null,
      price: parseFloat(prodData.price),
      shippingPrice: parseFloat(prodData.shippingPrice) || 0,
      stock: parseInt(prodData.stock) || 0,
      ...prodData
    };
    setDoc(doc(db, 'products', newId), newProd).catch(err => console.error(err));
  };

  const editProduct = (prodId, updatedData) => {
    updateDoc(doc(db, 'products', prodId), {
      ...updatedData,
      price: parseFloat(updatedData.price),
      originalPrice: updatedData.originalPrice ? parseFloat(updatedData.originalPrice) : null,
      stock: parseInt(updatedData.stock) || 0,
      shippingPrice: parseFloat(updatedData.shippingPrice) || 0
    }).catch(err => console.error(err));
  };

  const deleteProduct = (prodId) => {
    deleteDoc(doc(db, 'products', prodId)).catch(err => console.error(err));
  };

  const deleteService = (servId) => {
    deleteDoc(doc(db, 'services', servId)).catch(err => console.error(err));
  };

  const deleteEvent = (eventId) => {
    deleteDoc(doc(db, 'events', eventId)).catch(err => console.error(err));
  };

  const toggleProductActive = (prodId) => {
    const p = products.find(prod => prod.id === prodId);
    if (p) {
      updateDoc(doc(db, 'products', prodId), { active: !p.active }).catch(err => console.error(err));
    }
  };

  const addFlashDeal = (productId, discountPercent, limit) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    const discount = parseFloat(discountPercent);
    const limitVal = parseInt(limit);
    const backupPrice = p.price;
    const newPrice = parseFloat((backupPrice * (1 - discount / 100)).toFixed(2));
    
    updateDoc(doc(db, 'products', productId), {
      inFlashDeal: true,
      flashDealDiscount: discount,
      flashDealLimit: limitVal,
      flashDealSold: 0,
      flashDealCreatedAt: Date.now(),
      flashDealBackupPrice: backupPrice,
      price: newPrice,
      originalPrice: backupPrice
    }).catch(err => console.error(err));
  };

  const removeFlashDeal = (productId) => {
    const p = products.find(prod => prod.id === productId);
    if (!p) return;
    updateDoc(doc(db, 'products', productId), {
      inFlashDeal: false,
      price: p.flashDealBackupPrice || p.price,
      originalPrice: null,
      flashDealLimit: null,
      flashDealSold: null,
      flashDealCreatedAt: null,
      flashDealBackupPrice: null,
      flashDealDiscount: null
    }).catch(err => console.error(err));
  };


  // --- SERVICES (PRESTADORES) ---
  const addService = (servData) => {
    const newId = 'serv_' + Math.random().toString(36).substr(2, 9);
    const newServ = {
      id: newId,
      rating: 5.0,
      reviewsCount: 0,
      ...servData,
      pricePerHour: isNaN(parseFloat(servData.pricePerHour)) ? null : parseFloat(servData.pricePerHour),
      totalPrice: isNaN(parseFloat(servData.totalPrice)) ? null : parseFloat(servData.totalPrice),
      minHours: parseInt(servData.minHours) || 1
    };
    setDoc(doc(db, 'services', newId), newServ).catch(err => console.error(err));
  };

  const editService = (servId, updatedData) => {
    updateDoc(doc(db, 'services', servId), {
      ...updatedData,
      pricePerHour: isNaN(parseFloat(updatedData.pricePerHour)) ? null : parseFloat(updatedData.pricePerHour),
      totalPrice: isNaN(parseFloat(updatedData.totalPrice)) ? null : parseFloat(updatedData.totalPrice),
      minHours: parseInt(updatedData.minHours) || 1
    }).catch(err => console.error(err));
  };

  const hireServiceProvider = (serviceId, hours, date, time, notes, useCoins = false, variation = null) => {
    if (!currentUser) return { success: false, message: 'Precisa logar primeiro, uai!' };
    
    const service = services.find(s => s.id === serviceId);
    if (!service) return { success: false, message: 'Serviço não encontrado.' };

    // Check double booking
    if (service.schedule?.enabled) {
      const isAlreadyBooked = (servicesHired || []).some(sh => 
        sh.serviceId === serviceId && 
        sh.date === date && 
        sh.time === time && 
        sh.status !== 'rejected'
      );
      if (isAlreadyBooked) {
        return { success: false, message: 'Desculpe, este horário já foi reservado por outro cliente!' };
      }
    }

    const newHiringId = generateRandomHiringId();
    const variationPrice = variation?.price || 0;
    const subtotal = (service.pricePerHour * hours) + variationPrice;
    
    // Apply Coins
    let coinsUsed = 0;
    let coinDiscount = 0;
    if (useCoins && currentUser.ouroCoins > 0) {
      const dailyUsed = getCoinsUsedInPeriod(1);
      const weeklyUsed = getCoinsUsedInPeriod(7);
      const dailyRemaining = Math.max(0, 10000 - dailyUsed);
      const weeklyRemaining = Math.max(0, 30000 - weeklyUsed);
      
      let maxCoinsAllowed = Math.min(currentUser.ouroCoins, dailyRemaining, weeklyRemaining);
      const maxDiscountAllowed = subtotal * 0.25;
      const maxCoinsByDiscount = Math.floor(maxDiscountAllowed / 0.01);
      
      coinsUsed = Math.min(maxCoinsAllowed, maxCoinsByDiscount);
      coinDiscount = coinsUsed * 0.01;
    }

    const total = subtotal - coinDiscount;
    const servicesCommRate = (visualLayoutSettings?.commissions?.services !== undefined ? visualLayoutSettings.commissions.services : 10) / 100;
    const commissionFee = subtotal * servicesCommRate;

    const newHiring = {
      id: newHiringId,
      serviceId,
      serviceName: service.name,
      providerId: service.providerId,
      providerName: service.providerName,
      pricePerHour: service.pricePerHour,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      hours,
      date,
      time,
      notes,
      total,
      coinsUsed,
      commissionFee,
      status: 'pending',
      variation: variation ? variation.text : null,
      variationPrice: variation ? variation.price : 0
    };

    setDoc(doc(db, 'servicesHired', newHiringId), newHiring).catch(err => console.error(err));
    createNotification(service.providerId, `Novo agendamento solicitado por ${currentUser.name} para o dia ${date}!`);
    
    // Earn OuroCoins
    const earnedCoins = Math.floor(total); 
    const finalCoins = Math.max(0, currentUser.ouroCoins - coinsUsed + earnedCoins);
    updateDoc(doc(db, 'users', currentUser.id), { ouroCoins: finalCoins }).catch(err => console.error(err));
    createNotification(currentUser.id, `Que chique! Você ganhou ${earnedCoins} OuroCoins contratando esse serviço!`);

    return { success: true, hiring: newHiring };
  };

  const updateHiringStatus = (hiringId, status) => {
    updateDoc(doc(db, 'servicesHired', hiringId), { status }).catch(err => console.error(err));
    const hiring = servicesHired.find(h => h.id === hiringId);
    if (hiring) {
      if (status === 'accepted') {
        createNotification(hiring.customerId, `Oba! ${hiring.providerName} aceitou o seu agendamento de serviço!`);
      } else if (status === 'rejected') {
        createNotification(hiring.customerId, `Eita! ${hiring.providerName} não pôde aceitar seu agendamento.`);
      } else if (status === 'completed') {
        createNotification(hiring.customerId, `Serviço concluído por ${hiring.providerName}. Avalie depois!`);
      }
    }
  };


  // --- EVENTS SERVICES ---
  const addEvent = (eventData) => {
    const newId = 'event_' + Math.random().toString(36).substr(2, 9);
    const newEvent = {
      id: newId,
      published: true,
      commissioners: [],
      batches: eventData.batches.map(b => ({ ...b, price: parseFloat(b.price), limit: parseInt(b.limit), sold: 0 })),
      ...eventData
    };
    setDoc(doc(db, 'events', newId), newEvent).catch(err => console.error(err));
  };

  const addJobVacancy = async (jobData) => {
    try {
      const newJobId = 'job_' + Math.random().toString(36).substr(2, 9);
      const newJob = {
        id: newJobId,
        createdAt: Date.now(),
        ...jobData
      };
      await setDoc(doc(db, 'jobs', newJobId), newJob);
      return { success: true, job: newJob };
    } catch (err) {
      console.error("Error adding job:", err);
      return { success: false, message: err.message };
    }
  };

  const addCommissioner = async (eventId, { name, email, phone, avatar, password, code }) => {
    const e = events.find(event => event.id === eventId);
    if (!e) return { success: false, message: 'Evento não encontrado.' };

    const commissioners = [...(e.commissioners || [])];
    const upperCode = code.toUpperCase().trim();
    
    if (commissioners.some(c => c.code.toUpperCase() === upperCode)) {
      return { success: false, message: 'Já existe um comissário com este código vinculado a este evento!' };
    }

    const commUserId = 'comm_' + Math.random().toString(36).substr(2, 9);
    const newUser = {
      id: commUserId,
      email: email.toLowerCase().trim(),
      role: 'commissioner',
      name: name.trim(),
      phone: phone.trim(),
      avatar: avatar || 'https://www.w3schools.com/howto/img_avatar.png',
      registrationStatus: 'approved',
      banned: false,
      createdAt: Date.now(),
      ouroCoins: 0,
      commissionerCode: upperCode,
      commissionerPassword: password
    };

    try {
      await setDoc(doc(db, 'users', commUserId), newUser);

      commissioners.push({ 
        name: name.trim(), 
        code: upperCode, 
        sales: 0,
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        avatar: newUser.avatar
      });
      await updateDoc(doc(db, 'events', eventId), { commissioners });

      return { success: true, user: newUser, code: upperCode };
    } catch (err) {
      console.error("Erro ao cadastrar comissário:", err);
      return { success: false, message: 'Erro ao cadastrar comissário no Firestore.' };
    }
  };

  const updateEvent = (eventId, eventData) => {
    const updates = { ...eventData };
    if (eventData.batches) {
      updates.batches = eventData.batches.map(b => ({
        ...b,
        price: parseFloat(b.price || 0),
        limit: parseInt(b.limit || 0),
        sold: parseInt(b.sold || 0)
      }));
    }
    updateDoc(doc(db, 'events', eventId), updates).catch(err => console.error(err));
  };


  // --- FOR YOU VIDEOS ---
  const addVideo = (vidData) => {
    const newId = 'vid_' + Math.random().toString(36).substr(2, 9);
    const newVid = {
      id: newId,
      likes: 0,
      comments: 0,
      ...vidData
    };
    setDoc(doc(db, 'videos', newId), newVid).catch(err => console.error(err));
  };

  const likeVideo = (vidId) => {
    if (!currentUser) return;
    const v = videos.find(vid => vid.id === vidId);
    if (v) {
      const likedBy = v.likedBy ? [...v.likedBy] : [];
      if (!likedBy.includes(currentUser.id)) {
        likedBy.push(currentUser.id);
        updateDoc(doc(db, 'videos', vidId), { 
          likedBy, 
          likes: likedBy.length 
        }).catch(err => console.error(err));
      }
    }
  };

  const unlikeVideo = (vidId) => {
    if (!currentUser) return;
    const v = videos.find(vid => vid.id === vidId);
    if (v) {
      const likedBy = v.likedBy ? v.likedBy.filter(id => id !== currentUser.id) : [];
      updateDoc(doc(db, 'videos', vidId), { 
        likedBy, 
        likes: likedBy.length 
      }).catch(err => console.error(err));
    }
  };

  const deleteVideo = (vidId) => {
    deleteDoc(doc(db, 'videos', vidId)).catch(err => console.error(err));
  };

  const updateVideo = (vidId, vidData) => {
    updateDoc(doc(db, 'videos', vidId), vidData).catch(err => console.error(err));
  };

  const addVideoComment = async (videoId, userName, userAvatar, text, userId) => {
    const newId = 'vidcmt_' + Math.random().toString(36).substr(2, 9);
    const newComment = {
      id: newId,
      videoId,
      userName,
      userAvatar: userAvatar || '',
      text,
      userId: userId || '',
      createdAt: new Date().toISOString()
    };
    
    // Update local state immediately for instant feedback
    setVideoComments(prev => [...prev, newComment]);

    try {
      const v = videos.find(vid => vid.id === videoId);
      if (v) {
        const currentComments = v.commentsList ? [...v.commentsList] : [];
        currentComments.push(newComment);
        await updateDoc(doc(db, 'videos', videoId), {
          commentsList: currentComments,
          comments: currentComments.length
        });
      }
    } catch (err) {
      console.error("Erro ao salvar comentário do vídeo no Firebase:", err);
    }
  };


  // --- CART & ORDER OPERATIONS ---
  const addToCart = (product, variation = null) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.variation === variation);
      if (existing) {
        return prev.map(item => item.product.id === product.id && item.variation === variation 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
        );
      }
      return [...prev, { product, quantity: 1, variation }];
    });
  };

  const updateCartQty = (prodId, variation, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === prodId && item.variation === variation) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (prodId, variation) => {
    setCart(prev => prev.filter(item => !(item.product.id === prodId && item.variation === variation)));
  };

  const placeOrder = (paymentMethod, couponCode = '', useCoins = false, customShipping = null, shippingType = 'motoboy') => {
    if (!currentUser) return { success: false, message: 'Entre na sua conta para finalizar o pedido!' };
    if (cart.length === 0) return { success: false, message: 'Seu carrinho está vazio!' };

    let subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shipping = customShipping !== null ? customShipping : cart.reduce((acc, item) => acc + (item.product.shippingPrice), 0);
    
    let discount = 0;
    if (couponCode) {
      const cp = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
      if (cp && subtotal >= cp.minPurchase) {
        if (cp.discountType === 'fixed') {
          discount = cp.value;
        } else {
          discount = (subtotal * cp.value) / 100;
        }
      }
    }

    let coinsUsed = 0;
    let coinDiscount = 0;
    if (useCoins && currentUser.ouroCoins > 0) {
      const dailyUsed = getCoinsUsedInPeriod(1);
      const weeklyUsed = getCoinsUsedInPeriod(7);
      const dailyRemaining = Math.max(0, 10000 - dailyUsed);
      const weeklyRemaining = Math.max(0, 30000 - weeklyUsed);
      
      let maxCoinsAllowed = Math.min(currentUser.ouroCoins, dailyRemaining, weeklyRemaining);
      const maxDiscountAllowed = (subtotal - discount) * 0.25;
      const maxCoinsByDiscount = Math.floor(maxDiscountAllowed / 0.01);
      
      coinsUsed = Math.min(maxCoinsAllowed, maxCoinsByDiscount);
      coinDiscount = coinsUsed * 0.01;
    }

    const total = Math.max(0, subtotal + shipping - discount - coinDiscount);
    const orderId = generateRandomOrderId();
    const productsCommRate = (visualLayoutSettings?.commissions?.products !== undefined ? visualLayoutSettings.commissions.products : 10) / 100;
    const commissionFee = subtotal * productsCommRate;

    const newOrder = {
      id: orderId,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerPhone: currentUser.phone,
      address: currentUser.address || userLocation,
      items: cart.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        variation: item.variation,
        storeId: item.product.storeId,
        storeName: item.product.storeName,
        image: item.product.image
      })),
      subtotal,
      shipping,
      discount: discount + coinDiscount,
      coinsUsed,
      total,
      commissionFee,
      paymentMethod,
      status: 'pending',
      date: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      riderId: null,
      riderName: null,
      step: 0,
      shippingType
    };

    cart.forEach(item => {
      const p = products.find(prod => prod.id === item.product.id);
      if (p) {
        const isFlash = p.inFlashDeal;
        let newSold = p.soldCount + item.quantity;
        let newFlashSold = (p.flashDealSold || 0) + item.quantity;
        
        let stillInFlash = isFlash;
        let currentPrice = p.price;
        let currentOriginalPrice = p.originalPrice;
        let backupPrice = p.flashDealBackupPrice;
        
        if (isFlash && newFlashSold >= p.flashDealLimit) {
          stillInFlash = false;
          currentPrice = backupPrice || p.price;
          currentOriginalPrice = null;
          createNotification(p.storeId, `A oferta relâmpago de "${p.name}" acabou pois atingiu o limite de vendas!`);
        }
        
        updateDoc(doc(db, 'products', p.id), {
          stock: Math.max(0, p.stock - item.quantity),
          soldCount: newSold,
          flashDealSold: stillInFlash ? newFlashSold : null,
          inFlashDeal: stillInFlash,
          price: currentPrice,
          originalPrice: currentOriginalPrice,
          flashDealLimit: stillInFlash ? p.flashDealLimit : null,
          flashDealCreatedAt: stillInFlash ? p.flashDealCreatedAt : null,
          flashDealBackupPrice: stillInFlash ? p.flashDealBackupPrice : null,
          flashDealDiscount: stillInFlash ? p.flashDealDiscount : null
        }).catch(err => console.error(err));
      }
    });

    setDoc(doc(db, 'orders', orderId), newOrder).catch(err => console.error(err));

    const earnedCoins = Math.floor(total);
    const finalCoins = Math.max(0, currentUser.ouroCoins - coinsUsed + earnedCoins);
    updateDoc(doc(db, 'users', currentUser.id), { ouroCoins: finalCoins }).catch(err => console.error(err));

    const uniqueStores = [...new Set(cart.map(item => item.product.storeId))];
    uniqueStores.forEach(sId => {
      createNotification(sId, `Novo pedido recebido! #${orderId} de R$ ${total.toFixed(2)}.`);
    });

    createNotification(currentUser.id, `Pedido #${orderId} realizado com sucesso! Você ganhou ${earnedCoins} OuroCoins.`);
    
    setCart([]);
    return { success: true, order: newOrder };
  };

  const buyTicket = (eventId, batchIndex, qty, commissionerCode = '', useCoins = false, couponAppliedCode = '', selectedSeat = null) => {
    if (!currentUser) return { success: false, message: 'Faça login para comprar ingressos!' };

    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Evento não encontrado.' };

    const batch = event.batches[batchIndex];
    if (!batch) return { success: false, message: 'Lote não encontrado.' };

    // Validar datas de venda do lote
    const now = new Date();
    if (batch.startDate) {
      const startDateTimeStr = `${batch.startDate}T${batch.startTime || '00:00'}`;
      const startDateTime = new Date(startDateTimeStr);
      if (now < startDateTime) {
        return { success: false, message: `Vendas para este lote ainda não iniciaram. Iniciam em ${batch.startDate.split('-').reverse().join('/')} às ${batch.startTime || '00:00'}.` };
      }
    }
    if (batch.endDate) {
      const endDateTimeStr = `${batch.endDate}T${batch.endTime || '23:59'}`;
      const endDateTime = new Date(endDateTimeStr);
      if (now > endDateTime) {
        return { success: false, message: `Vendas para este lote já foram encerradas em ${batch.endDate.split('-').reverse().join('/')} às ${batch.endTime || '23:59'}.` };
      }
    }

    if (batch.sold + qty > batch.limit) {
      return { success: false, message: 'Ops! Lote esgotado ou sem ingressos suficientes!' };
    }

    // Validar assento numerado
    if (event.hasNumberedSeats && selectedSeat) {
      const soldSeats = event.soldSeats || [];
      if (soldSeats.includes(selectedSeat)) {
        return { success: false, message: `O assento ${selectedSeat} já foi reservado por outro cliente. Por favor, escolha outro!` };
      }
    }

    const price = parseFloat(batch.price || 0);
    let subtotal = price * qty;

    // Validar e aplicar Cupom do Evento
    let couponDiscount = 0;
    if (couponAppliedCode && event.coupons && event.coupons.length > 0) {
      const foundCoupon = event.coupons.find(c => c.code.toUpperCase() === couponAppliedCode.toUpperCase());
      if (foundCoupon) {
        if (foundCoupon.discountType === 'percent') {
          couponDiscount = subtotal * (parseFloat(foundCoupon.value || 0) / 100);
        } else {
          couponDiscount = parseFloat(foundCoupon.value || 0);
        }
      }
    }
    subtotal = Math.max(0, subtotal - couponDiscount);

    // Apply Coins
    let coinsUsed = 0;
    let coinDiscount = 0;
    if (useCoins && currentUser.ouroCoins > 0 && subtotal > 0) {
      const dailyUsed = getCoinsUsedInPeriod(1);
      const weeklyUsed = getCoinsUsedInPeriod(7);
      const dailyRemaining = Math.max(0, 10000 - dailyUsed);
      const weeklyRemaining = Math.max(0, 30000 - weeklyUsed);
      
      let maxCoinsAllowed = Math.min(currentUser.ouroCoins, dailyRemaining, weeklyRemaining);
      const maxDiscountAllowed = subtotal * 0.25;
      const maxCoinsByDiscount = Math.floor(maxDiscountAllowed / 0.01);
      
      coinsUsed = Math.min(maxCoinsAllowed, maxCoinsByDiscount);
      coinDiscount = coinsUsed * 0.01;
    }

    const ticketPriceAfterDiscount = subtotal - coinDiscount;

    // Calcular Taxa do Aplicativo (10%)
    const appFeeRate = 0.10;
    const appFeeAmount = subtotal * appFeeRate;
    
    let totalClientPays = ticketPriceAfterDiscount;
    let commissionFee = appFeeAmount;

    if (event.feeOption === 'repassar') {
      totalClientPays += appFeeAmount;
      commissionFee = appFeeAmount;
    } else {
      commissionFee = appFeeAmount;
    }

    const ticketOrderId = generateRandomTicketOrderId();

    const newTicketOrder = {
      id: ticketOrderId,
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerCpf: currentUser.cpf || '',
      customerPhone: currentUser.phone || '',
      type: 'ticket',
      eventId,
      eventName: event.name,
      eventDate: event.date,
      eventLocation: event.location,
      eventImage: event.image,
      batchName: batch.name,
      quantity: qty,
      ticketPrice: price,
      subtotal: price * qty,
      couponCode: couponAppliedCode || null,
      couponDiscount,
      seatNumber: selectedSeat || null,
      feeOption: event.feeOption || 'absorver',
      appFeeAmount,
      total: totalClientPays,
      coinsUsed,
      commissionFee,
      date: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
      commissionerCode: commissionerCode ? commissionerCode.toUpperCase() : null,
      legalAttentionNotice: "Atenção! O produtor é o único responsável pela devolução de valores referentes ao(s) ingresso(s). Em caso de arrependimento da compra, o reembolso do valor do ingresso somente será efetuado caso a solicitação seja feita no prazo de até 7 dias a contar da data da compra e desde que realizado o pedido de devolução com no máximo 48h de antecedência do horário de início do evento. Situações fora do descrito estarão condicionadas a decisão dos produtores do evento."
    };

    const newBatches = [...event.batches];
    newBatches[batchIndex].sold += qty;

    const newSoldSeats = [...(event.soldSeats || [])];
    if (event.hasNumberedSeats && selectedSeat) {
      newSoldSeats.push(selectedSeat);
    }
    
    let newCommissioners = [...(event.commissioners || [])];
    if (commissionerCode) {
      newCommissioners = newCommissioners.map(c => 
        c.code.toUpperCase() === commissionerCode.toUpperCase() 
          ? { ...c, sales: c.sales + qty } 
          : c
      );
    }

    updateDoc(doc(db, 'events', eventId), { 
      batches: newBatches, 
      commissioners: newCommissioners,
      soldSeats: newSoldSeats
    }).catch(err => console.error(err));

    setDoc(doc(db, 'orders', ticketOrderId), newTicketOrder).catch(err => console.error(err));

    const earnedCoins = Math.floor(totalClientPays);
    const finalCoins = Math.max(0, currentUser.ouroCoins - coinsUsed + earnedCoins);
    updateDoc(doc(db, 'users', currentUser.id), { ouroCoins: finalCoins }).catch(err => console.error(err));
    
    createNotification(event.organizerId, `Uai, mais vendas! Ingressos para o evento "${event.name}" comprados por ${currentUser.name}.`);
    createNotification(currentUser.id, `Ingressos comprados! Encontre-os na carteira do app. Ganhou ${earnedCoins} OuroCoins!`);

    return { success: true, order: newTicketOrder };
  };

  const validateTicket = async (ticketId, organizerId, filterEventId = 'all') => {
    const ticket = orders.find(o => o.id === ticketId);
    if (!ticket) {
      return { success: false, message: 'Ingresso não encontrado!' };
    }
    if (ticket.type !== 'ticket') {
      return { success: false, message: 'Este ID não corresponde a um ingresso!' };
    }
    
    const event = events.find(e => e.id === ticket.eventId);
    if (!event) {
      return { success: false, message: 'Evento associado a este ingresso não foi encontrado.' };
    }
    if (event.organizerId !== organizerId) {
      return { success: false, message: 'Este ingresso pertence a um evento de outro organizador!' };
    }

    if (filterEventId && filterEventId !== 'all' && ticket.eventId !== filterEventId) {
      const selectedEvent = events.find(e => e.id === filterEventId);
      return { 
        success: false, 
        message: `Este ingresso pertence ao evento "${event.name}", mas a validação está configurada apenas para o evento "${selectedEvent?.name || 'evento selecionado'}"!` 
      };
    }

    if (ticket.status === 'checked_in') {
      return { 
        success: false, 
        message: `Ingresso já utilizado! Entrada realizada em ${ticket.checkInTime || 'horário desconhecido'}.` 
      };
    }

    const checkInTime = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    try {
      await updateDoc(doc(db, 'orders', ticketId), {
        status: 'checked_in',
        checkInTime: checkInTime
      });

      createNotification(ticket.customerId, `Seu ingresso para "${ticket.eventName}" foi validado na portaria! Bom evento!`);
      createNotification(organizerId, `Ingresso validado: Check-in realizado para ${ticket.customerName} no evento "${ticket.eventName}".`);

      return { 
        success: true, 
        message: 'Ingresso validado com sucesso! Entrada liberada.',
        ticket: { ...ticket, status: 'checked_in', checkInTime }
      };
    } catch (err) {
      console.error("Erro ao validar ingresso no Firestore:", err);
      return { success: false, message: 'Erro ao validar o ingresso na base de dados.' };
    }
  };

  const reportEvent = async (eventId, reason, description = '') => {
    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Evento não encontrado.' };

    const reportsCount = (event.reportsCount || 0) + 1;
    const reportDetails = [...(event.reportDetails || [])];
    const reportText = `Motivo: ${reason}${description ? ` - Detalhes: ${description}` : ''} (por ${currentUser?.name || 'Anônimo'})`;
    reportDetails.push(reportText);

    try {
      await updateDoc(doc(db, 'events', eventId), {
        reported: true,
        reportsCount,
        reportDetails
      });
      return { success: true, message: 'Denúncia registrada com sucesso. O Administrador do sistema analisará este evento.' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Erro ao registrar a denúncia.' };
    }
  };

  const dismissReport = async (eventId) => {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        reported: false,
        reportsCount: 0,
        reportDetails: []
      });
      return { success: true, message: 'Denúncias limpas com sucesso.' };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Erro ao limpar as denúncias.' };
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'preparing') updates.step = 1;
    else if (newStatus === 'calling_rider') updates.step = 2;
    else if (newStatus === 'rider_assigned') updates.step = 3;
    else if (newStatus === 'delivering') updates.step = 4;
    else if (newStatus === 'delivered') updates.step = 5;

    updateDoc(doc(db, 'orders', orderId), updates).catch(err => console.error(err));

    const order = orders.find(o => o.id === orderId);
    if (order) {
      let statusText;
      switch (newStatus) {
        case 'preparing': statusText = 'está sendo preparado pela loja'; break;
        case 'calling_rider': statusText = 'está aguardando um entregador'; break;
        case 'rider_assigned': statusText = 'já tem um entregador a caminho'; break;
        case 'delivering': statusText = 'saiu para entrega'; break;
        case 'delivered': statusText = 'foi entregue'; break;
        default: statusText = 'foi atualizado';
      }
      createNotification(order.customerId, `Aviso: Seu pedido #${order.id} ${statusText}!`);
    }
  };

  const callRider = (orderId, riderId = null) => {
    const updates = { status: 'calling_rider' };
    if (riderId) {
      updates.assignedRiderId = riderId;
      const rider = users.find(u => u.id === riderId);
      if (rider) {
        updates.assignedRiderName = rider.name;
      }
    } else {
      updates.assignedRiderId = null;
      updates.assignedRiderName = null;
    }
    updateDoc(doc(db, 'orders', orderId), updates).catch(err => console.error(err));

    if (riderId) {
      createNotification(riderId, `Você recebeu uma proposta de entrega exclusiva! Pedido #${orderId}.`);
    } else {
      users.filter(u => u.role === 'motoboy' && u.online).forEach(rider => {
        createNotification(rider.id, `Corrida disponível! Pedido #${orderId}.`);
      });
    }
  };

  const cancelCallRider = (orderId) => {
    updateDoc(doc(db, 'orders', orderId), {
      status: 'preparing',
      assignedRiderId: null,
      assignedRiderName: null
    }).catch(err => console.error(err));
  };

  const acceptDelivery = (orderId, riderId) => {
    const rider = users.find(u => u.id === riderId);
    updateDoc(doc(db, 'orders', orderId), {
      status: 'rider_assigned',
      riderId,
      riderName: rider ? rider.name : 'Motoboy',
      step: 3
    }).catch(err => console.error(err));

    const order = orders.find(o => o.id === orderId);
    if (order) {
      createNotification(order.customerId, `Que rápido! O entregador ${rider.name} aceitou sua entrega e está na loja recolhendo.`);
      createNotification(order.items[0].storeId, `O entregador ${rider.name} está a caminho da sua loja buscar o pedido #${orderId}.`);
    }
  };

  // --- CHAT SYSTEM ---
  const addMessage = (roomKey, text, sender) => {
    const newId = 'msg_' + Math.random().toString(36).substr(2, 9);
    const isAdmin = sender.role === 'admin' || sender.id === 'admin';
    const newMsg = {
      id: newId,
      roomKey,
      text,
      senderId: isAdmin ? 'admin' : sender.id,
      senderName: isAdmin ? 'Suporte Connecta' : sender.name,
      senderRole: sender.role,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setDoc(doc(db, 'chats', newId), newMsg).catch(err => console.error(err));

    if (roomKey.includes('admin') && sender.role !== 'admin') {
      setTimeout(() => {
        const autoReplyId = 'msg_' + Math.random().toString(36).substr(2, 9);
        const autoReply = {
          id: autoReplyId,
          roomKey,
          text: `Olá, ${sender.name} Recebi seu chamado. Nossa equipe de suporte está analisando o seu caso e te responde logo logo. Obrigado pela paciência!`,
          senderId: 'admin',
          senderName: 'Suporte Connecta',
          senderRole: 'admin',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        setDoc(doc(db, 'chats', autoReplyId), autoReply).catch(err => console.error(err));
      }, 2500);
    }
  };

  // --- COUPON ACTIONS ---
  const createCoupon = (couponData) => {
    const code = couponData.code.toUpperCase();
    const newCp = {
      code,
      discountType: couponData.discountType,
      value: parseFloat(couponData.value),
      minPurchase: parseFloat(couponData.minPurchase) || 0,
      active: true
    };
    setDoc(doc(db, 'coupons', code), newCp).catch(err => console.error(err));
  };

  // --- UTILS ---
  const createNotification = (userId, text) => {
    const newId = 'notif_' + Math.random().toString(36).substr(2, 9);
    const newNotif = {
      id: newId,
      userId,
      text,
      date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setDoc(doc(db, 'notifications', newId), newNotif).catch(err => console.error(err));
  };

  const markNotificationsRead = (userId) => {
    const userNotifs = notifications.filter(n => n.userId === userId);
    userNotifs.forEach(n => {
      updateDoc(doc(db, 'notifications', n.id), { read: true }).catch(err => console.error(err));
    });
  };

  const triggerGlobalNotification = (roleTarget, text) => {
    users.forEach(u => {
      if (roleTarget === 'all' || u.role === roleTarget) {
        createNotification(u.id, `AVISO GERAL: ${text}`);
      }
    });
  };

  const updateUserProfile = (userId, data) => {
    updateDoc(doc(db, 'users', userId), data).catch(err => console.error(err));
  };

  // --- VISUAL EDITOR CMS ---
  const [isVisualEditorActive, setIsVisualEditorActive] = useState(() => localStorage.getItem('connecta_visual_editor_active') === 'true');

  const toggleVisualEditor = (active) => {
    setIsVisualEditorActive(active);
    localStorage.setItem('connecta_visual_editor_active', active ? 'true' : 'false');
  };

  const updateVisualText = (textId, text) => {
    const updated = {
      ...visualLayoutSettings,
      customTexts: {
        ...(visualLayoutSettings.customTexts || {}),
        [textId]: text
      }
    };
    setDoc(doc(db, 'settings', 'visualLayout'), updated).catch(err => console.error(err));
  };

  const updateAvatarOffset = (field, delta) => {
    const currentOffset = visualLayoutSettings.avatarOffset || { top: -36, left: 32 };
    const updated = {
      ...visualLayoutSettings,
      avatarOffset: {
        ...currentOffset,
        [field]: currentOffset[field] + delta
      }
    };
    setDoc(doc(db, 'settings', 'visualLayout'), updated).catch(err => console.error(err));
  };

  const reorderSections = (sectionId, direction) => {
    const order = [...(visualLayoutSettings.sectionOrder || [])];
    const index = order.indexOf(sectionId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= order.length) return;
    
    const temp = order[index];
    order[index] = order[newIndex];
    order[newIndex] = temp;
    
    const updated = {
      ...visualLayoutSettings,
      sectionOrder: order
    };
    setDoc(doc(db, 'settings', 'visualLayout'), updated).catch(err => console.error(err));
  };

  // Salva a lista inteira de sectionOrder de uma vez
  const setSectionOrder = (newOrder) => {
    const updated = {
      ...visualLayoutSettings,
      sectionOrder: newOrder
    };
    setDoc(doc(db, 'settings', 'visualLayout'), updated).catch(err => console.error(err));
  };

  const updateVisualColor = (elementId, color) => {
    const updated = {
      ...visualLayoutSettings,
      customColors: {
        ...(visualLayoutSettings.customColors || {}),
        [elementId]: color
      }
    };
    setDoc(doc(db, 'settings', 'visualLayout'), updated).catch(err => console.error(err));
  };

  const resetVisualLayout = () => {
    const defaultSettings = {
      customTexts: {},
      customColors: {},
      sectionOrder: ['banner', 'categories', 'flashDeals', 'nearbyStores', 'products', 'buyers', 'events', 'services'],
      avatarOffset: { top: -36, left: 32 },
      homeBanner: {
        title: 'Artesanato & Tradição',
        desc: 'Peças em Pedra-Sabão direto de Ouro Preto',
        img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500',
        link: 'Artesanato'
      },
      commissions: {
        products: 10,
        tickets: 10,
        services: 12
      }
    };
    setDoc(doc(db, 'settings', 'visualLayout'), defaultSettings).catch(err => console.error(err));
  };

  const updateVisualLayoutSettings = (newSettings) => {
    setDoc(doc(db, 'settings', 'visualLayout'), newSettings).catch(err => console.error(err));
  };

  const addProductReview = (productId, userName, rating, comment, images = []) => {
    const newId = `rev_${Date.now()}`;
    const newReview = {
      id: newId,
      productId,
      userName: userName || 'Cliente Anônimo',
      rating,
      comment,
      images,
      date: new Date().toLocaleDateString('pt-BR')
    };
    setDoc(doc(db, 'productReviews', newId), newReview).catch(err => console.error(err));
  };

  const addServiceReview = async (hiringId, userName, rating, comment, images = []) => {
    const hiring = servicesHired.find(sh => sh.id === hiringId);
    if (!hiring) return { success: false, message: 'Agendamento não encontrado.' };

    const reviewId = 'srev_' + Math.random().toString(36).substr(2, 9);
    const newReview = {
      id: reviewId,
      hiringId,
      serviceId: hiring.serviceId,
      serviceName: hiring.serviceName,
      providerId: hiring.providerId,
      providerName: hiring.providerName,
      customerName: userName || hiring.customerName || 'Cliente Anônimo',
      rating: parseInt(rating),
      comment,
      images,
      date: new Date().toLocaleDateString('pt-BR'),
      createdAt: Date.now()
    };

    await setDoc(doc(db, 'serviceReviews', reviewId), newReview);
    await updateDoc(doc(db, 'servicesHired', hiringId), { reviewed: true });

    // Update aggregate rating on the service document
    const serviceDocRef = doc(db, 'services', hiring.serviceId);
    const allReviewsForService = [...serviceReviews, newReview].filter(r => r.serviceId === hiring.serviceId);
    const totalRating = allReviewsForService.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRating / allReviewsForService.length).toFixed(1));

    await updateDoc(serviceDocRef, {
      rating: avgRating,
      reviewsCount: allReviewsForService.length
    });

    createNotification(hiring.providerId, `Oba! Você recebeu uma avaliação de ${rating} estrelas de ${newReview.customerName} pelo serviço "${hiring.serviceName}"!`);
    return { success: true };
  };

  // --- CATEGORIES CRUD ---
  const addCategory = (catData) => {
    const newId = 'cat_' + Math.random().toString(36).substr(2, 9);
    const newCat = {
      id: newId,
      label: catData.label,
      key: catData.key || catData.label,
      desc: catData.desc || '',
      icon: catData.icon || 'Sparkles',
      type: catData.type || 'lojas', // 'lojas', 'servicos', 'eventos'
      image: catData.image || '',
      order: catData.order || categories.length,
      active: true,
      createdAt: Date.now()
    };
    setDoc(doc(db, 'categories', newId), newCat).catch(err => console.error(err));
  };

  const editCategory = (catId, updatedData) => {
    updateDoc(doc(db, 'categories', catId), updatedData).catch(err => console.error(err));
  };

  const deleteCategory = (catId) => {
    deleteDoc(doc(db, 'categories', catId)).catch(err => console.error(err));
  };

  const addBanner = (bannerData) => {
    const newId = 'banner_' + Math.random().toString(36).substr(2, 9);
    const newBanner = {
      id: newId,
      title: bannerData.title || '',
      desc: bannerData.desc || '',
      img: bannerData.img || '',
      imgMobile: bannerData.imgMobile || '',
      link: bannerData.link || '',
      createdAt: Date.now()
    };
    return setDoc(doc(db, 'banners', newId), newBanner);
  };

  const deleteBanner = (bannerId) => {
    deleteDoc(doc(db, 'banners', bannerId)).catch(err => console.error("Error deleting banner:", err));
  };

  // --- HOME SECTIONS CRUD ---
  const addHomeSection = (sectionData) => {
    const newId = 'section_' + Math.random().toString(36).substr(2, 9);
    const newSection = {
      id: newId,
      name: sectionData.name,
      type: sectionData.type, // 'products', 'stores', 'services', 'events'
      itemIds: sectionData.itemIds || [],
      order: sectionData.order !== undefined ? sectionData.order : homeSections.length,
      active: true,
      createdAt: Date.now()
    };
    setDoc(doc(db, 'homeSections', newId), newSection).catch(err => console.error("Error adding home section:", err));
  };

  const editHomeSection = (sectionId, updatedData) => {
    updateDoc(doc(db, 'homeSections', sectionId), updatedData).catch(err => console.error("Error editing home section:", err));
  };

  const deleteHomeSection = (sectionId) => {
    deleteDoc(doc(db, 'homeSections', sectionId)).catch(err => console.error("Error deleting home section:", err));
  };

  const reorderHomeSections = async (orderedIds) => {
    for (let i = 0; i < orderedIds.length; i++) {
      const sId = orderedIds[i];
      await updateDoc(doc(db, 'homeSections', sId), { order: i }).catch(err => console.error("Error reordering home section:", err));
    }
  };

  const deleteUser = async (userId) => {
    try {
      // Find the user document first to copy their data
      const userDoc = users.find(u => u.id === userId);
      if (userDoc) {
        // Sanitizar objeto para remover campos undefined, que causam erro no Firestore
        const sanitizedDoc = {};
        Object.keys(userDoc).forEach(key => {
          if (userDoc[key] !== undefined) {
            sanitizedDoc[key] = userDoc[key];
          }
        });

        // Save the deleted user to 'deletedUsers' collection
        await setDoc(doc(db, 'deletedUsers', userId), {
          ...sanitizedDoc,
          deletedAt: Date.now()
        });
      }

      // Delete the user document
      await deleteDoc(doc(db, 'users', userId));

      // Delete all products owned by this user
      const userProducts = products.filter(p => p.storeId === userId || p.sellerId === userId);
      for (const p of userProducts) {
        await deleteDoc(doc(db, 'products', p.id)).catch(err => console.error("Error deleting user product:", err));
      }

      // Delete all services owned by this user
      const userServices = services.filter(s => s.providerId === userId);
      for (const s of userServices) {
        await deleteDoc(doc(db, 'services', s.id)).catch(err => console.error("Error deleting user service:", err));
      }

      // Delete all events owned by this user
      const userEvents = events.filter(e => e.organizerId === userId);
      for (const e of userEvents) {
        await deleteDoc(doc(db, 'events', e.id)).catch(err => console.error("Error deleting user event:", err));
      }

      // Delete all videos owned by this user
      const userVideos = videos.filter(v => v.creatorId === userId);
      for (const v of userVideos) {
        await deleteDoc(doc(db, 'videos', v.id)).catch(err => console.error("Error deleting user video:", err));
      }

      alert("Usuário excluído com sucesso do Firestore, sô! Todas as suas informações associadas foram limpas.");
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Erro ao excluir usuário: " + err.message);
    }
  };

  return (
    <FirebaseMockContext.Provider value={{
      users,
      updateUserProfile,
      products,
      events,
      services,
      videos,
      coupons,
      orders,
      servicesHired,
      chats,
      notifications,
      currentUser,
      deletedUsers,
      userLocation,
      cart,
      login,
      logout,
      signup,
      updateRegistrationStatus,
      setUserBanStatus,
      addProduct,
      editProduct,
      deleteProduct,
      deleteService,
      deleteEvent,
      toggleProductActive,
      addFlashDeal,
      removeFlashDeal,
      addService,
      editService,
      hireServiceProvider,
      updateHiringStatus,
      addEvent,
      updateEvent,
      addCommissioner,
      addVideo,
      likeVideo,
      unlikeVideo,
      deleteVideo,
      updateVideo,
      videoComments,
      addVideoComment,
      addToCart,
      updateCartQty,
      removeFromCart,
      placeOrder,
      buyTicket,
      validateTicket,
      reportEvent,
      dismissReport,
      updateOrderStatus,
      callRider,
      cancelCallRider,
      acceptDelivery,
      addMessage,
      createCoupon,
      createNotification,
      markNotificationsRead,
      triggerGlobalNotification,
      setUserLocation,
      setUsers,
      isVisualEditorActive,
      toggleVisualEditor,
      visualLayoutSettings,
      updateVisualText,
      updateVisualColor,
      updateAvatarOffset,
      reorderSections,
      resetVisualLayout,
      updateVisualLayoutSettings,
      productReviews,
      addProductReview,
      serviceReviews,
      addServiceReview,
      getCoinsUsedInPeriod,
      categories,
      addCategory,
      editCategory,
      deleteCategory,
      banners,
      addBanner,
      deleteBanner,
      homeSections,
      addHomeSection,
      editHomeSection,
      deleteHomeSection,
      reorderHomeSections,
      deleteUser,
      setSectionOrder,
      jobs,
      addJobVacancy,
      isAuthLoading,
      isDataLoading: IS_BETA_EVENTS_ONLY
        ? (!usersLoaded || !eventsLoaded || !bannersLoaded || !homeSectionsLoaded)
        : (!usersLoaded || !productsLoaded || !eventsLoaded || !servicesLoaded || !bannersLoaded || !categoriesLoaded || !homeSectionsLoaded || !jobsLoaded)
    }}>
      {children}
    </FirebaseMockContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFirebaseMock = () => useContext(FirebaseMockContext);

// Reusable component to edit texts and colors visual-editor style
export function EditableText({ textId, defaultText, style = {} }) {
  const { isVisualEditorActive, visualLayoutSettings, updateVisualText, updateVisualColor } = useFirebaseMock();
  const [showColorPicker, setShowColorPicker] = useState(false);
  let currentText = (visualLayoutSettings?.customTexts && visualLayoutSettings.customTexts[textId]) || defaultText;
  if (currentText === 'Oi, lindeza!' || currentText === 'Oi, lindeza') {
    currentText = 'Olá! Seja bem-vindo!';
  }
  const currentColor = (visualLayoutSettings?.customColors && visualLayoutSettings.customColors[textId]) || style.color || 'inherit';

  const colors = [
    { name: 'Laranja', hex: '#f28d1a' },
    { name: 'Preto', hex: '#2d2d2d' },
    { name: 'Cinza', hex: '#707070' },
    { name: 'Vermelho', hex: '#ff5e5b' },
    { name: 'Verde', hex: '#2ec4b6' },
    { name: 'Azul', hex: '#007aff' }
  ];

  if (isVisualEditorActive) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', position: 'relative', verticalAlign: 'middle' }}>
        <span 
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => {
            updateVisualText(textId, e.target.innerText.trim());
          }}
          style={{ 
            ...style, 
            color: currentColor,
            outline: '1px dashed #f28d1a', 
            padding: '1px 3px', 
            borderRadius: '4px', 
            cursor: 'text',
            display: 'inline-block',
            backgroundColor: '#f9bb1a15',
            zIndex: 100
          }}
          title="Clique para editar texto"
        >
          {currentText}
        </span>
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          style={{
            padding: '2px',
            border: 'none',
            background: '#ffffff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
            zIndex: 101,
            width: '16px',
            height: '16px'
          }}
          title="Mudar cor do texto"
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: currentColor === 'inherit' ? '#2d2d2d' : currentColor }} />
        </button>
        
        {showColorPicker && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            border: '1px solid #eaeaea',
            borderRadius: '8px',
            padding: '6px',
            display: 'flex',
            gap: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}>
            {colors.map(c => (
              <button
                key={c.hex}
                type="button"
                onClick={() => {
                  updateVisualColor(textId, c.hex);
                  setShowColorPicker(false);
                }}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: c.hex,
                  border: currentColor === c.hex ? '2px solid #000' : '1px solid #ddd',
                  cursor: 'pointer',
                  padding: 0
                }}
                title={c.name}
              />
            ))}
          </div>
        )}
      </span>
    );
  }
  return <span style={{ ...style, color: currentColor }}>{currentText}</span>;
}
