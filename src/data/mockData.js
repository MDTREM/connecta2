const now = Date.now();

export const MOCK_CATEGORIES = [
  { id: 'cat_default_0', label: 'Artesanato', key: 'Artesanato', type: 'lojas', icon: 'Palette', order: 0, desc: '', active: true, createdAt: now },
  { id: 'cat_default_1', label: 'Lembranças', key: 'Lembranças', type: 'lojas', icon: 'Gift', order: 1, desc: '', active: true, createdAt: now },
  { id: 'cat_default_2', label: 'Gastronomia', key: 'Gastronomia', type: 'lojas', icon: 'Utensils', order: 2, desc: '', active: true, createdAt: now },
  { id: 'cat_default_3', label: 'Alimentos', key: 'Alimentos', type: 'lojas', icon: 'ShoppingBag', order: 3, desc: '', active: true, createdAt: now },
  { id: 'cat_default_4', label: 'Bebidas', key: 'Bebidas', type: 'lojas', icon: 'Coffee', order: 4, desc: '', active: true, createdAt: now },
  { id: 'cat_default_5', label: 'Outros', key: 'Outros', type: 'lojas', icon: 'Sparkles', order: 5, desc: '', active: true, createdAt: now },
  { id: 'cat_default_6', label: 'Guia Turístico / Roteiros', key: 'Guia Turístico', type: 'servicos', icon: 'Compass', order: 0, desc: '', active: true, createdAt: now },
  { id: 'cat_default_7', label: 'Fotógrafo', key: 'Fotógrafo', type: 'servicos', icon: 'Camera', order: 1, desc: '', active: true, createdAt: now },
  { id: 'cat_default_8', label: 'Diarista / Faxina', key: 'Diarista', type: 'servicos', icon: 'Activity', order: 2, desc: '', active: true, createdAt: now },
  { id: 'cat_default_9', label: 'Manutenção Geral', key: 'Marido de Aluguel', type: 'servicos', icon: 'Wrench', order: 3, desc: '', active: true, createdAt: now },
  { id: 'cat_default_10', label: 'Entregas Grandes / Mudanças', key: 'Fretes', type: 'servicos', icon: 'Truck', order: 4, desc: '', active: true, createdAt: now },
  { id: 'cat_default_11', label: 'Entrega de Moto', key: 'Moto', type: 'entregadores', icon: 'Bike', order: 5, desc: '', active: true, createdAt: now },
  { id: 'cat_default_12', label: 'Entrega de Carro / Fretes', key: 'Carro', type: 'entregadores', icon: 'Truck', order: 6, desc: '', active: true, createdAt: now }
];

export const MOCK_USERS = [
  {
    id: 'user_client_1',
    email: 'cliente@connecta.com',
    role: 'client',
    name: 'Maria Clara Oliveira',
    phone: '(31) 99876-5432',
    address: 'Rua Direita, 142 - Centro, Ouro Preto - MG',
    cep: '35400-000',
    registrationStatus: 'approved',
    banned: false,
    ouroCoins: 350,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    createdAt: now - 86400000 * 30
  },
  {
    id: 'user_seller_1',
    email: 'loja1@connecta.com',
    role: 'seller',
    name: 'João Antônio',
    companyName: 'Ateliê Pedra-Sabão Ouro Preto',
    storeName: 'Ateliê Pedra-Sabão Ouro Preto',
    storeCategory: 'Artesanato',
    category: 'Artesanato',
    phone: '(31) 98811-2233',
    address: 'Largo de Coimbra, 18 - Centro, Ouro Preto - MG',
    cnpj: '12.345.678/0001-90',
    registrationStatus: 'approved',
    banned: false,
    ouroCoins: 120,
    avatar: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200',
    storeBanner: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
    createdAt: now - 86400000 * 60
  },
  {
    id: 'user_seller_2',
    email: 'loja2@connecta.com',
    role: 'seller',
    name: 'Dona Conceição',
    companyName: 'Empório Sabores de Minas',
    storeName: 'Empório Sabores de Minas',
    storeCategory: 'Gastronomia',
    category: 'Gastronomia',
    phone: '(31) 98722-3344',
    address: 'Rua São José, 89 - Centro, Ouro Preto - MG',
    cnpj: '23.456.789/0001-11',
    registrationStatus: 'approved',
    banned: false,
    ouroCoins: 80,
    avatar: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200',
    storeBanner: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800',
    createdAt: now - 86400000 * 45
  },
  {
    id: 'user_seller_3',
    email: 'loja3@connecta.com',
    role: 'seller',
    name: 'Rafael Mendes',
    companyName: 'Café & Quitandas Tiradentes',
    storeName: 'Café & Quitandas Tiradentes',
    storeCategory: 'Alimentos',
    category: 'Alimentos',
    phone: '(31) 98633-4455',
    address: 'Praça Tiradentes, 54 - Centro, Ouro Preto - MG',
    cnpj: '34.567.890/0001-22',
    registrationStatus: 'approved',
    banned: false,
    ouroCoins: 50,
    avatar: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200',
    storeBanner: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
    createdAt: now - 86400000 * 25
  },
  {
    id: 'user_provider_1',
    email: 'prestador1@connecta.com',
    role: 'provider',
    name: 'Lucas Guimarães',
    serviceCategory: 'Guia Turístico',
    phone: '(31) 98544-5566',
    address: 'Antônio Dias, Ouro Preto - MG',
    cpf: '123.456.789-00',
    registrationStatus: 'approved',
    banned: false,
    ouroCoins: 90,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    createdAt: now - 86400000 * 40
  },
  {
    id: 'user_provider_2',
    email: 'prestador2@connecta.com',
    role: 'provider',
    name: 'Ana Beatriz Fotografia',
    serviceCategory: 'Fotógrafo',
    phone: '(31) 98455-6677',
    address: 'Pilar, Ouro Preto - MG',
    cpf: '234.567.890-11',
    registrationStatus: 'approved',
    banned: false,
    ouroCoins: 40,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    createdAt: now - 86400000 * 20
  },
  {
    id: 'user_organizer_1',
    email: 'eventos@connecta.com',
    role: 'organizer',
    name: 'Mariana Costa',
    companyName: 'Produções Vila Rica',
    phone: '(31) 98366-7788',
    address: 'Av. Juscelino Kubitschek, 300 - Bauxita, Ouro Preto - MG',
    cnpj: '45.678.901/0001-33',
    registrationStatus: 'approved',
    banned: false,
    ouroCoins: 200,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
    createdAt: now - 86400000 * 50
  },
  {
    id: 'user_motoboy_1',
    email: 'entregador@connecta.com',
    role: 'motoboy',
    name: 'Carlos Eduardo',
    vehicleType: 'Moto',
    phone: '(31) 98277-8899',
    address: 'Saramenha, Ouro Preto - MG',
    cpf: '345.678.901-22',
    registrationStatus: 'approved',
    banned: false,
    ouroCoins: 60,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    createdAt: now - 86400000 * 15
  },
  {
    id: 'user_admin_1',
    email: 'admin@connecta.com',
    role: 'admin',
    name: 'Suporte Connecta+',
    phone: '(31) 99999-0000',
    address: 'Centro Histórico, Ouro Preto - MG',
    registrationStatus: 'approved',
    banned: false,
    ouroCoins: 0,
    createdAt: now - 86400000 * 90
  }
];

export const MOCK_PRODUCTS = [
  {
    id: 'prod_1',
    sellerId: 'user_seller_1',
    storeName: 'Ateliê Pedra-Sabão Ouro Preto',
    name: 'Panela de Pedra-Sabão 3L com Alça de Cobre',
    description: 'Panela artesanal legítima de Ouro Preto, já curada e pronta para uso. Mantém o calor dos alimentos por muito mais tempo.',
    category: 'Artesanato',
    price: 149.90,
    originalPrice: 189.90,
    shippingPrice: 15.00,
    stock: 14,
    soldCount: 42,
    active: true,
    isFlashDeal: true,
    flashDealDiscount: 21,
    flashDealLimit: 20,
    flashDealSold: 12,
    image: 'https://images.unsplash.com/photo-1584990347449-a2d4c2c044c9?w=500',
    createdAt: now - 86400000 * 10
  },
  {
    id: 'prod_2',
    sellerId: 'user_seller_1',
    storeName: 'Ateliê Pedra-Sabão Ouro Preto',
    name: 'Escultura Miniatura Igreja São Francisco',
    description: 'Peça decorativa esculpida à mão em pedra-sabão natural, representando o patrimônio barroco mineiro.',
    category: 'Lembranças',
    price: 68.00,
    originalPrice: null,
    shippingPrice: 10.00,
    stock: 25,
    soldCount: 19,
    active: true,
    isFlashDeal: false,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500',
    createdAt: now - 86400000 * 8
  },
  {
    id: 'prod_3',
    sellerId: 'user_seller_2',
    storeName: 'Empório Sabores de Minas',
    name: 'Queijo Minas Artesanal Canastra Curado (1kg)',
    description: 'Queijo produzido na Serra da Canastra com maturação de 22 dias. Sabor marcante e textura cremosa.',
    category: 'Gastronomia',
    price: 74.90,
    originalPrice: 89.90,
    shippingPrice: 12.00,
    stock: 18,
    soldCount: 87,
    active: true,
    isFlashDeal: true,
    flashDealDiscount: 17,
    flashDealLimit: 30,
    flashDealSold: 21,
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500',
    createdAt: now - 86400000 * 12
  },
  {
    id: 'prod_4',
    sellerId: 'user_seller_2',
    storeName: 'Empório Sabores de Minas',
    name: 'Doce de Leite Viçosa Tradicional 800g',
    description: 'O premiado doce de leite mineiro em lata de 800g, cremosidade incomparável.',
    category: 'Gastronomia',
    price: 42.00,
    originalPrice: null,
    shippingPrice: 8.00,
    stock: 30,
    soldCount: 64,
    active: true,
    isFlashDeal: false,
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500',
    createdAt: now - 86400000 * 7
  },
  {
    id: 'prod_5',
    sellerId: 'user_seller_2',
    storeName: 'Empório Sabores de Minas',
    name: 'Cachaça Ouro Preto Envelhecida em Carvalho 750ml',
    description: 'Cachaça artesanal de alambique envelhecida por 3 anos em barris de carvalho francês.',
    category: 'Bebidas',
    price: 95.00,
    originalPrice: 115.00,
    shippingPrice: 15.00,
    stock: 12,
    soldCount: 31,
    active: true,
    isFlashDeal: false,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=500',
    createdAt: now - 86400000 * 6
  },
  {
    id: 'prod_6',
    sellerId: 'user_seller_3',
    storeName: 'Café & Quitandas Tiradentes',
    name: 'Kit 12 Pães de Queijo Recheados com Goiabada',
    description: 'Assados na hora com queijo meia cura e goiabada cascão derretida por dentro.',
    category: 'Alimentos',
    price: 36.00,
    originalPrice: 45.00,
    shippingPrice: 7.00,
    stock: 20,
    soldCount: 115,
    active: true,
    isFlashDeal: true,
    flashDealDiscount: 20,
    flashDealLimit: 25,
    flashDealSold: 18,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
    createdAt: now - 86400000 * 5
  },
  {
    id: 'prod_7',
    sellerId: 'user_seller_3',
    storeName: 'Café & Quitandas Tiradentes',
    name: 'Café Especial das Montanhas de Minas (500g)',
    description: 'Grãos 100% arábica torra média, notas de chocolate e caramelo.',
    category: 'Bebidas',
    price: 39.90,
    originalPrice: null,
    shippingPrice: 8.00,
    stock: 40,
    soldCount: 53,
    active: true,
    isFlashDeal: false,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500',
    createdAt: now - 86400000 * 4
  },
  {
    id: 'prod_8',
    sellerId: 'user_seller_1',
    storeName: 'Ateliê Pedra-Sabão Ouro Preto',
    name: 'Porta-Incenso Barroco em Pedra-Sabão',
    description: 'Acabamento polido à mão, ideal para decoração e momentos de relaxamento.',
    category: 'Outros',
    price: 29.90,
    originalPrice: 39.90,
    shippingPrice: 6.00,
    stock: 35,
    soldCount: 28,
    active: true,
    isFlashDeal: false,
    image: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=500',
    createdAt: now - 86400000 * 3
  }
];

export const MOCK_EVENTS = [
  {
    id: 'evt_1',
    organizerId: 'user_organizer_1',
    organizerName: 'Produções Vila Rica',
    name: 'Festival de Inverno de Ouro Preto 2026',
    category: 'Festival',
    description: 'Três dias de música ao vivo, gastronomia mineira, exposições de arte e oficinas culturais na Praça Tiradentes.',
    venueName: 'Praça Tiradentes',
    location: 'Praça Tiradentes, s/n - Centro, Ouro Preto - MG',
    startDate: '2026-12-12',
    startTime: '18:00',
    endDate: '2026-12-14',
    endTime: '23:59',
    date: '12/12/2026 às 18:00',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
    cover: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
    homepageBanner: true,
    batchSalesMode: 'sequential',
    batches: [
      { name: '1º Lote - Pista', price: 45, limit: 150, sold: 92 },
      { name: '2º Lote - Pista', price: 65, limit: 200, sold: 0 },
      { name: 'Camarote Open Food', price: 140, limit: 60, sold: 28 }
    ],
    commissioners: [
      { id: 'comm_1', name: 'Comissário João', code: 'JOAO10', discountPercent: 10, commissionPercent: 10 }
    ],
    createdAt: now - 86400000 * 15
  },
  {
    id: 'evt_2',
    organizerId: 'user_organizer_1',
    organizerName: 'Produções Vila Rica',
    name: 'Noite do Jazz & Vinhos no Casarão',
    category: 'Show',
    description: 'Apresentação intimista de quarteto de jazz com degustação de vinhos mineiros e tábua de queijos artesanais.',
    venueName: 'Casarão das Artes',
    location: 'Rua Conde de Bobadela, 110 - Centro, Ouro Preto - MG',
    startDate: '2026-12-05',
    startTime: '20:30',
    endDate: '2026-12-06',
    endTime: '01:00',
    date: '05/12/2026 às 20:30',
    image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    cover: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800',
    homepageBanner: true,
    batchSalesMode: 'simultaneous',
    batches: [
      { name: 'Ingresso Individual', price: 80, limit: 80, sold: 44 },
      { name: 'Mesa para 2 Pessoas', price: 150, limit: 20, sold: 11 }
    ],
    commissioners: [],
    createdAt: now - 86400000 * 10
  },
  {
    id: 'evt_3',
    organizerId: 'user_organizer_1',
    organizerName: 'Produções Vila Rica',
    name: 'Tour Noturno Lendas de Vila Rica',
    category: 'Cultural',
    description: 'Caminhada guiada teatralizada pelas ladeiras históricas contando as histórias da Inconfidência Mineira.',
    venueName: 'Igreja do Rosário',
    location: 'Largo do Rosário - Centro, Ouro Preto - MG',
    startDate: '2026-11-29',
    startTime: '19:30',
    endDate: '2026-11-29',
    endTime: '22:00',
    date: '29/11/2026 às 19:30',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    cover: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
    homepageBanner: true,
    batchSalesMode: 'simultaneous',
    batches: [
      { name: 'Ingresso Único', price: 35, limit: 50, sold: 31 }
    ],
    commissioners: [],
    createdAt: now - 86400000 * 5
  },
  {
    id: 'evt_4',
    organizerId: 'user_organizer_1',
    organizerName: 'Produções Vila Rica',
    name: 'Feira Gastronômica Sabores da Serra',
    category: 'Gastronomia',
    description: 'Mais de 25 barracas com comida típica mineira, cervejas artesanais locais e música sertaneja raiz.',
    venueName: 'Parque Horto dos Contos',
    location: 'Rua Santa Efigênia - Centro, Ouro Preto - MG',
    startDate: '2026-12-20',
    startTime: '11:00',
    endDate: '2026-12-20',
    endTime: '21:00',
    date: '20/12/2026 às 11:00',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    cover: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    homepageBanner: false,
    batchSalesMode: 'simultaneous',
    batches: [
      { name: 'Entrada + Caneca', price: 25, limit: 300, sold: 110 }
    ],
    commissioners: [],
    createdAt: now - 86400000 * 2
  }
];

export const MOCK_SERVICES = [
  {
    id: 'serv_1',
    providerId: 'user_provider_1',
    providerName: 'Lucas Guimarães',
    title: 'City Tour Histórico Completo em Ouro Preto',
    category: 'Guia Turístico',
    description: 'Roteiro personalizado pelas principais igrejas barrocas, museus e minas de ouro com guia credenciado CADASTUR.',
    pricePerHour: 75,
    price: 75,
    priceType: 'hour',
    minHours: 2,
    active: true,
    image: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=500',
    createdAt: now - 86400000 * 14
  },
  {
    id: 'serv_2',
    providerId: 'user_provider_1',
    providerName: 'Lucas Guimarães',
    title: 'Trilha Ecológica Pico do Itacolomi',
    category: 'Guia Turístico',
    description: 'Acompanhamento seguro até o topo do Parque Estadual do Itacolomi, com paradas para fotos e lanche.',
    pricePerHour: 180,
    price: 180,
    priceType: 'total',
    minHours: 1,
    active: true,
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=500',
    createdAt: now - 86400000 * 10
  },
  {
    id: 'serv_3',
    providerId: 'user_provider_2',
    providerName: 'Ana Beatriz Fotografia',
    title: 'Ensaio Fotográfico nas Ladeiras Históricas',
    category: 'Fotógrafo',
    description: 'Ensaio externo de 1h30 com 30 fotos tratadas em alta resolução entregues em até 48h.',
    pricePerHour: 220,
    price: 220,
    priceType: 'total',
    minHours: 1,
    active: true,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
    createdAt: now - 86400000 * 8
  },
  {
    id: 'serv_4',
    providerId: 'user_provider_2',
    providerName: 'Ana Beatriz Fotografia',
    title: 'Cobertura Fotográfica de Eventos',
    category: 'Fotógrafo',
    description: 'Registro completo de festas, formaturas e eventos corporativos em Ouro Preto e região.',
    pricePerHour: 120,
    price: 120,
    priceType: 'hour',
    minHours: 3,
    active: true,
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500',
    createdAt: now - 86400000 * 4
  }
];

export const MOCK_BANNERS = [
  {
    id: 'banner_1',
    title: 'Artesanato & Tradição Mineira',
    desc: 'Peças em Pedra-Sabão direto dos ateliês de Ouro Preto',
    img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800',
    link: 'Artesanato',
    active: true
  },
  {
    id: 'banner_2',
    title: 'Festival de Inverno 2026',
    desc: 'Garanta já seu ingresso com desconto antecipado!',
    img: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800',
    link: 'Eventos',
    active: true
  },
  {
    id: 'banner_3',
    title: 'Sabores da Canastra & Quitandas',
    desc: 'Queijos, doces e cafés especiais com entrega rápida',
    img: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800',
    link: 'Gastronomia',
    active: true
  }
];

export const MOCK_COUPONS = [
  {
    code: 'CONECTA10',
    discountPercent: 10,
    minOrderValue: 50,
    active: true,
    description: '10% de desconto em pedidos acima de R$ 50'
  },
  {
    code: 'OUROPRETO15',
    discountPercent: 15,
    minOrderValue: 100,
    active: true,
    description: '15% OFF em compras acima de R$ 100'
  },
  {
    code: 'BEMVINDO20',
    discountPercent: 20,
    minOrderValue: 120,
    active: true,
    description: '20% OFF na sua primeira compra'
  }
];

export const MOCK_JOBS = [
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
    createdAt: now
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
    createdAt: now - 3600000
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
    createdAt: now - 7200000
  }
];

export const MOCK_VIDEOS = [
  {
    id: 'vid_1',
    userId: 'user_seller_1',
    authorName: 'Ateliê Pedra-Sabão Ouro Preto',
    title: 'Como esculpimos nossas panelas de pedra-sabão',
    description: 'Bastidores da produção artesanal direto do nosso ateliê no Largo de Coimbra!',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-potter-shaping-clay-on-a-wheel-42923-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1584990347449-a2d4c2c044c9?w=500',
    likes: ['user_client_1'],
    linkedProductId: 'prod_1',
    createdAt: now - 86400000 * 3
  },
  {
    id: 'vid_2',
    userId: 'user_organizer_1',
    authorName: 'Produções Vila Rica',
    title: 'Prévia do Festival de Inverno 2026',
    description: 'Confira o palco principal sendo preparado na Praça Tiradentes!',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-crowd-at-a-concert-at-night-4642-large.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=500',
    likes: [],
    linkedEventId: 'evt_1',
    createdAt: now - 86400000 * 1
  }
];

export const MOCK_PRODUCT_REVIEWS = [
  {
    id: 'rev_p1',
    productId: 'prod_1',
    userId: 'user_client_1',
    userName: 'Maria Clara Oliveira',
    rating: 5,
    comment: 'Panela maravilhosa! Mantém a comida quentinha por horas e chegou super bem embalada.',
    date: '20/11/2026',
    createdAt: now - 86400000 * 4
  },
  {
    id: 'rev_p2',
    productId: 'prod_3',
    userId: 'user_client_1',
    userName: 'Maria Clara Oliveira',
    rating: 5,
    comment: 'Melhor queijo da Canastra que já comprei, super saboroso!',
    date: '18/11/2026',
    createdAt: now - 86400000 * 6
  }
];

export const MOCK_SERVICE_REVIEWS = [
  {
    id: 'rev_s1',
    serviceId: 'serv_1',
    userId: 'user_client_1',
    userName: 'Maria Clara Oliveira',
    rating: 5,
    comment: 'Lucas conhece cada detalhe da história de Ouro Preto. Passeio incrível!',
    date: '15/11/2026',
    createdAt: now - 86400000 * 9
  }
];

export const MOCK_ORDERS = [
  {
    id: 'OP-849201',
    type: 'product',
    customerId: 'user_client_1',
    customerName: 'Maria Clara Oliveira',
    customerAddress: 'Rua Direita, 142 - Centro, Ouro Preto - MG',
    sellerId: 'user_seller_1',
    storeName: 'Ateliê Pedra-Sabão Ouro Preto',
    items: [
      {
        id: 'prod_1',
        name: 'Panela de Pedra-Sabão 3L com Alça de Cobre',
        price: 149.90,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1584990347449-a2d4c2c044c9?w=500'
      }
    ],
    total: 164.90,
    shippingPrice: 15.00,
    status: 'delivered',
    date: '20/11/2026 às 14:30',
    coinsUsed: 0,
    createdAt: now - 86400000 * 4
  },
  {
    id: 'TK-512093',
    type: 'ticket',
    customerId: 'user_client_1',
    customerName: 'Maria Clara Oliveira',
    eventId: 'evt_1',
    eventName: 'Festival de Inverno de Ouro Preto 2026',
    eventDate: '12/12/2026 às 18:00',
    eventLocation: 'Praça Tiradentes, s/n - Centro, Ouro Preto - MG',
    batchName: '1º Lote - Pista',
    quantity: 2,
    total: 90.00,
    status: 'valid',
    ticketCode: 'VIP-OP-2026-991',
    date: '22/11/2026 às 10:15',
    createdAt: now - 86400000 * 2
  }
];

export const MOCK_SERVICES_HIRED = [
  {
    id: 'hire_mock_1',
    serviceId: 'serv_1',
    serviceTitle: 'City Tour Histórico Completo em Ouro Preto',
    providerId: 'user_provider_1',
    providerName: 'Lucas Guimarães',
    customerId: 'user_client_1',
    customerName: 'Maria Clara Oliveira',
    hours: 3,
    date: '2026-12-02',
    time: '09:30',
    notes: 'Gostaria de incluir a Igreja de São Francisco de Assis.',
    total: 225.00,
    status: 'confirmed',
    createdAt: now - 86400000 * 3
  }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif_1',
    userId: 'user_client_1',
    message: 'Bem-vinda ao Connecta+! Você ganhou 350 OuroCoins para usar em compras e eventos.',
    read: false,
    date: '24/11/2026',
    createdAt: now - 3600000
  }
];

export const MOCK_VISUAL_SETTINGS = {
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
