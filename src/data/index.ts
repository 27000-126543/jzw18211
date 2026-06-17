export type UserRole = 'owner' | 'provider' | 'admin';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  avatar: string;
  providerId?: string;
}

export type PetSpecies = 'dog' | 'cat' | 'other';

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  species: PetSpecies;
  breed: string;
  age: number;
  vaccineRecords: string[];
  notes: string;
}

export type ServiceType = 'daycare' | 'home_visit' | 'boarding';

export interface Service {
  id: string;
  providerId: string;
  type: ServiceType;
  dailyPrice: number;
  description: string;
  enabled: boolean;
}

export interface EnvPhoto {
  id: string;
  url: string;
  caption: string;
  sortOrder: number;
}

export interface Availability {
  id: string;
  providerId: string;
  date: string;
  serviceType: ServiceType;
  capacity: number;
  booked: number;
}

export interface Provider {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  description: string;
  businessHours: string;
  acceptedPets: {
    species: string[];
    maxCount: number;
    breedRestrictions?: string[];
  };
  photos: EnvPhoto[];
  services: Service[];
  availability: Availability[];
}

export type OrderStatus = 'pending_confirm' | 'confirmed' | 'in_service' | 'pending_balance' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  orderNo: string;
  ownerId: string;
  providerId: string;
  petId: string;
  serviceId: string;
  serviceType: ServiceType;
  startDate: string;
  endDate: string;
  timeSlot: string;
  totalAmount: number;
  depositAmount: number;
  balanceAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  reviewerId: string;
  providerId: string;
  rating: number;
  content: string;
  images: string[];
  createdAt: string;
  response?: string;
}

export interface Update {
  id: string;
  orderId: string;
  providerId: string;
  content: string;
  images: string[];
  createdAt: string;
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image';
  createdAt: string;
}

export const users: User[] = [
  {
    id: 'u1',
    role: 'owner',
    name: '张小明',
    phone: '13800138001',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  },
  {
    id: 'u2',
    role: 'owner',
    name: '李小红',
    phone: '13800138002',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lily',
  },
  {
    id: 'u3',
    role: 'provider',
    name: '王大伟',
    phone: '13800138003',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    providerId: 'p1',
  },
  {
    id: 'u4',
    role: 'provider',
    name: '赵小芳',
    phone: '13800138004',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Flora',
    providerId: 'p2',
  },
  {
    id: 'u5',
    role: 'admin',
    name: '管理员',
    phone: '13800138000',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  },
];

export const pets: Pet[] = [
  {
    id: 'pet1',
    ownerId: 'u1',
    name: '豆豆',
    species: 'dog',
    breed: '金毛寻回犬',
    age: 3,
    vaccineRecords: ['狂犬疫苗2025', '六联疫苗2025'],
    notes: '性格温顺，喜欢玩球，每天需要遛两次',
  },
  {
    id: 'pet2',
    ownerId: 'u1',
    name: '咪咪',
    species: 'cat',
    breed: '英国短毛猫',
    age: 2,
    vaccineRecords: ['狂犬疫苗2025', '猫三联2025'],
    notes: '比较胆小，需要慢慢熟悉环境',
  },
  {
    id: 'pet3',
    ownerId: 'u2',
    name: '旺财',
    species: 'dog',
    breed: '柯基',
    age: 1.5,
    vaccineRecords: ['狂犬疫苗2025', '六联疫苗2025'],
    notes: '活泼好动，爱吃零食',
  },
];

const today = new Date();
const formatDate = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
};

const generateAvailability = (providerId: string): Availability[] => {
  const result: Availability[] = [];
  const types: ServiceType[] = ['daycare', 'home_visit', 'boarding'];
  for (let i = -7; i < 60; i++) {
    const date = formatDate(addDays(today, i));
    types.forEach((type, idx) => {
      result.push({
        id: `avail-${providerId}-${i}-${idx}`,
        providerId,
        date,
        serviceType: type,
        capacity: type === 'boarding' ? 5 : 10,
        booked: Math.floor(Math.random() * (type === 'boarding' ? 5 : 8)),
      });
    });
  }
  return result;
};

export const providers: Provider[] = [
  {
    id: 'p1',
    ownerId: 'u3',
    name: '温馨宠物之家',
    address: '北京市朝阳区望京街道SOHO T1 1203',
    latitude: 39.9954,
    longitude: 116.4798,
    rating: 4.8,
    reviewCount: 128,
    description: '专业宠物寄养服务10年经验，独立小院，24小时专人看护，每天定时发视频汇报宠物状态。',
    businessHours: '08:00 - 20:00',
    acceptedPets: {
      species: ['dog', 'cat'],
      maxCount: 8,
      breedRestrictions: ['藏獒', '比特犬'],
    },
    photos: [
      { id: 'ph1', url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800', caption: '温馨客厅活动区', sortOrder: 1 },
      { id: 'ph2', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800', caption: '户外活动场地', sortOrder: 2 },
      { id: 'ph3', url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800', caption: '猫咪专属房间', sortOrder: 3 },
      { id: 'ph4', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800', caption: '狗狗休息区', sortOrder: 4 },
    ],
    services: [
      { id: 's1-p1', providerId: 'p1', type: 'daycare', dailyPrice: 88, description: '日间照料，含两餐+户外活动', enabled: true },
      { id: 's2-p1', providerId: 'p1', type: 'home_visit', dailyPrice: 128, description: '上门喂养+遛弯+清理猫砂', enabled: true },
      { id: 's3-p1', providerId: 'p1', type: 'boarding', dailyPrice: 158, description: '住宿寄养，独立房间，24h看护', enabled: true },
    ],
    availability: generateAvailability('p1'),
  },
  {
    id: 'p2',
    ownerId: 'u4',
    name: '萌乐园宠物寄养中心',
    address: '北京市海淀区中关村南大街5号院',
    latitude: 39.9593,
    longitude: 116.3283,
    rating: 4.9,
    reviewCount: 256,
    description: '连锁品牌寄养中心，配备专业宠物医生，室内恒温系统，每只宠物都有独立空间。',
    businessHours: '07:30 - 21:00',
    acceptedPets: {
      species: ['dog', 'cat', 'other'],
      maxCount: 15,
    },
    photos: [
      { id: 'ph5', url: 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=800', caption: '中心大厅', sortOrder: 1 },
      { id: 'ph6', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800', caption: '专业美容区', sortOrder: 2 },
      { id: 'ph7', url: 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800', caption: '阳光活动房', sortOrder: 3 },
    ],
    services: [
      { id: 's1-p2', providerId: 'p2', type: 'daycare', dailyPrice: 98, description: '高端日间托管，含营养餐', enabled: true },
      { id: 's2-p2', providerId: 'p2', type: 'home_visit', dailyPrice: 148, description: '金牌服务，全程录像', enabled: true },
      { id: 's3-p2', providerId: 'p2', type: 'boarding', dailyPrice: 198, description: '豪华套房+每日遛弯3次', enabled: true },
    ],
    availability: generateAvailability('p2'),
  },
  {
    id: 'p3',
    ownerId: 'u3',
    name: '小院儿宠物客栈',
    address: '北京市东城区安定门内大街方家胡同',
    latitude: 39.9483,
    longitude: 116.4183,
    rating: 4.7,
    reviewCount: 87,
    description: '胡同里的宠物客栈，老北京风情小院，自由散养模式，让宠物像在家一样自在。',
    businessHours: '09:00 - 19:00',
    acceptedPets: {
      species: ['dog', 'cat'],
      maxCount: 6,
    },
    photos: [
      { id: 'ph8', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800', caption: '院子全景', sortOrder: 1 },
      { id: 'ph9', url: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800', caption: '猫咪晒台', sortOrder: 2 },
    ],
    services: [
      { id: 's1-p3', providerId: 'p3', type: 'boarding', dailyPrice: 128, description: '小院散养模式，家一般的感觉', enabled: true },
    ],
    availability: generateAvailability('p3'),
  },
];

export const orders: Order[] = [
  {
    id: 'o1',
    orderNo: 'PB' + Date.now().toString().slice(-10) + '001',
    ownerId: 'u1',
    providerId: 'p1',
    petId: 'pet1',
    serviceId: 's3-p1',
    serviceType: 'boarding',
    startDate: formatDate(addDays(today, 3)),
    endDate: formatDate(addDays(today, 7)),
    timeSlot: '10:00 - 12:00',
    totalAmount: 632,
    depositAmount: 189.6,
    balanceAmount: 442.4,
    status: 'confirmed',
    createdAt: new Date(today.getTime() - 86400000).toISOString(),
  },
  {
    id: 'o2',
    orderNo: 'PB' + Date.now().toString().slice(-10) + '002',
    ownerId: 'u1',
    providerId: 'p2',
    petId: 'pet2',
    serviceId: 's1-p2',
    serviceType: 'daycare',
    startDate: formatDate(addDays(today, 1)),
    endDate: formatDate(addDays(today, 1)),
    timeSlot: '08:00 - 09:00',
    totalAmount: 98,
    depositAmount: 29.4,
    balanceAmount: 68.6,
    status: 'in_service',
    createdAt: new Date(today.getTime() - 2 * 86400000).toISOString(),
  },
  {
    id: 'o3',
    orderNo: 'PB' + Date.now().toString().slice(-10) + '003',
    ownerId: 'u2',
    providerId: 'p1',
    petId: 'pet3',
    serviceId: 's3-p1',
    serviceType: 'boarding',
    startDate: formatDate(addDays(today, -5)),
    endDate: formatDate(addDays(today, -2)),
    timeSlot: '09:00 - 11:00',
    totalAmount: 474,
    depositAmount: 142.2,
    balanceAmount: 331.8,
    status: 'completed',
    createdAt: new Date(today.getTime() - 10 * 86400000).toISOString(),
  },
  {
    id: 'o4',
    orderNo: 'PB' + Date.now().toString().slice(-10) + '004',
    ownerId: 'u1',
    providerId: 'p3',
    petId: 'pet1',
    serviceId: 's1-p3',
    serviceType: 'boarding',
    startDate: formatDate(addDays(today, 5)),
    endDate: formatDate(addDays(today, 10)),
    timeSlot: '14:00 - 16:00',
    totalAmount: 640,
    depositAmount: 192,
    balanceAmount: 448,
    status: 'pending_confirm',
    createdAt: new Date(today.getTime() - 3600000).toISOString(),
  },
];

export const reviews: Review[] = [
  {
    id: 'r1',
    orderId: 'o3',
    reviewerId: 'u2',
    providerId: 'p1',
    rating: 5,
    content: '非常满意！王哥照顾旺财特别细心，每天都发视频和照片，回来感觉旺财胖了一圈，下次还会再来！',
    images: [
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
    ],
    createdAt: new Date(today.getTime() - 1 * 86400000).toISOString(),
    response: '谢谢旺财妈妈的好评！旺财也给我们带来了很多欢乐，欢迎下次再来~',
  },
  {
    id: 'r2',
    orderId: 'o-none-1',
    reviewerId: 'u2',
    providerId: 'p2',
    rating: 4,
    content: '整体服务很专业，环境也很好，就是价格稍微有点贵，但是一分钱一分货吧。',
    images: [],
    createdAt: new Date(today.getTime() - 5 * 86400000).toISOString(),
  },
  {
    id: 'r3',
    orderId: 'o-none-2',
    reviewerId: 'u1',
    providerId: 'p1',
    rating: 5,
    content: '豆豆在这里住了一周，完全没有不适应，每天玩得很开心。感谢温馨宠物之家的细心照料！',
    images: ['https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400'],
    createdAt: new Date(today.getTime() - 15 * 86400000).toISOString(),
  },
];

export const updates: Update[] = [
  {
    id: 'up1',
    orderId: 'o2',
    providerId: 'p2',
    content: '咪咪今天状态很好，早上吃了半碗猫粮，现在正在阳光房里晒太阳呢~',
    images: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600'],
    createdAt: new Date(today.getTime() - 3 * 3600000).toISOString(),
  },
  {
    id: 'up2',
    orderId: 'o2',
    providerId: 'p2',
    content: '午餐时间！咪咪胃口不错，吃完还喝了好多水。',
    images: ['https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600'],
    createdAt: new Date(today.getTime() - 1 * 3600000).toISOString(),
  },
  {
    id: 'up3',
    orderId: 'o3',
    providerId: 'p1',
    content: '旺财第一天来有点紧张，现在已经和小伙伴玩成一片啦！',
    images: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600',
      'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600',
    ],
    createdAt: new Date(today.getTime() - 6 * 86400000).toISOString(),
  },
];

export const messages: Message[] = [
  {
    id: 'm1',
    orderId: 'o2',
    senderId: 'u4',
    content: '您好，咪咪已经安全到达啦，请放心~',
    type: 'text',
    createdAt: new Date(today.getTime() - 5 * 3600000).toISOString(),
  },
  {
    id: 'm2',
    orderId: 'o2',
    senderId: 'u1',
    content: '好的，麻烦您多照顾了！她比较胆小，麻烦多陪陪她',
    type: 'text',
    createdAt: new Date(today.getTime() - 4.5 * 3600000).toISOString(),
  },
  {
    id: 'm3',
    orderId: 'o2',
    senderId: 'u4',
    content: '没问题的，我们有专人陪猫咪玩耍，您放心！',
    type: 'text',
    createdAt: new Date(today.getTime() - 4 * 3600000).toISOString(),
  },
  {
    id: 'm4',
    orderId: 'o4',
    senderId: 'u1',
    content: '您好，我刚下了订单，麻烦看一下',
    type: 'text',
    createdAt: new Date(today.getTime() - 1800000).toISOString(),
  },
];

export interface MockData {
  users: User[];
  pets: Pet[];
  providers: Provider[];
  orders: Order[];
  reviews: Review[];
  updates: Update[];
  messages: Message[];
}

export const mockData: MockData = {
  users,
  pets,
  providers,
  orders,
  reviews,
  updates,
  messages,
};

export default mockData;
