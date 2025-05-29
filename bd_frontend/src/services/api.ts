import axios from 'axios';
import type {
  Country, Human, Season, Chief, DishType, Dish,
  DishRating, Product, Recipe, Order, SearchParams,
  ProcedureResult
} from '../types/index';

// Configure axios with base URL from environment
const API_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем интерцептор для подстановки токена авторизации
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Generic CRUD operations
const createEntity = async <T>(endpoint: string, data: Partial<T>): Promise<T> => {
  const response = await api.post<T>(endpoint, data);
  return response.data;
};

const getEntities = async <T>(endpoint: string, params = {}): Promise<T[]> => {
  const response = await api.get<T[]>(endpoint, { params });
  return response.data;
};

const getEntityById = async <T>(endpoint: string, id: number): Promise<T> => {
  const response = await api.get<T>(`${endpoint}/${id}`);
  return response.data;
};

const updateEntity = async <T>(endpoint: string, id: number, data: Partial<T>): Promise<T> => {
  const response = await api.put<T>(`${endpoint}/${id}`, data);
  return response.data;
};

const deleteEntity = async (endpoint: string, id: number): Promise<void> => {
  await api.delete(`${endpoint}/${id}`);
};

// Specific endpoints for each entity
export const countryApi = {
  getAll: (params = {}) => getEntities<Country>('/countries', params),
  getById: (id: number) => getEntityById<Country>('/countries', id),
  create: (data: Partial<Country>) => createEntity<Country>('/countries', data),
  update: (id: number, data: Partial<Country>) => updateEntity<Country>('/countries', id, data),
  delete: (id: number) => deleteEntity('/countries', id),
};

export const humanApi = {
  getAll: (params = {}) => getEntities<Human>('/users', params),
  getById: (id: number) => getEntityById<Human>('/users', id),
  create: (data: Partial<Human>) => createEntity<Human>('/users', data),
  update: (id: number, data: Partial<Human>) => updateEntity<Human>('/users', id, data),
  delete: (id: number) => deleteEntity('/users', id),
};

export const seasonApi = {
  getAll: (params = {}) => getEntities<Season>('/seasons', params),
  getById: (id: number) => getEntityById<Season>('/seasons', id),
  create: (data: Partial<Season>) => createEntity<Season>('/seasons', data),
  update: (id: number, data: Partial<Season>) => updateEntity<Season>('/seasons', id, data),
  delete: (id: number) => deleteEntity('/seasons', id),
};

export const chiefApi = {
  getAll: (params = {}) => getEntities<Chief>('/chiefs', params),
  getById: (id: number) => getEntityById<Chief>('/chiefs', id),
  create: (data: Partial<Chief>) => createEntity<Chief>('/chiefs', data),
};

export const dishTypeApi = {
  getAll: (params = {}) => getEntities<DishType>('/dishtypes', params),
  getById: (id: number) => getEntityById<DishType>('/dishtypes', id),
  create: (data: Partial<DishType>) => createEntity<DishType>('/dishtypes', data),
  update: (id: number, data: Partial<DishType>) => updateEntity<DishType>('/dishtypes', id, data),
  delete: (id: number) => deleteEntity('/dishtypes', id),
};

export const dishApi = {
  getAll: (params = {}) => getEntities<Dish>('/dishes', params),
  getById: (id: number) => getEntityById<Dish>('/dishes', id),
  create: (data: Partial<Dish>) => createEntity<Dish>('/dishes', data),
  update: (id: number, data: Partial<Dish>) => updateEntity<Dish>('/dishes', id, data),
  delete: (id: number) => deleteEntity('/dishes', id),
  getSeasonalDishes: (seasonId: number) => api.get(`/dishes/seasonal/${seasonId}`).then(res => res.data),
  getCost: (id: number) => api.get(`/dishes/${id}/cost`).then(res => res.data),
  changeChef: (id: number, newChefId: number) => api.post(`/dishes/${id}/change_chef`, { new_chef_id: newChefId }).then(res => res.data),
  search: (params: { country_id?: number; season_id?: number; group_id?: number }) =>
    api.get('/dishes/search', { params }).then(res => res.data),
};

export const dishRatingApi = {
  create: (data: Partial<DishRating>) => createEntity<DishRating>('/ratings', data),
  getAll: () => getEntities<DishRating>('/ratings'),
  delete: (id: number) => deleteEntity('/ratings', id),
};

export const productApi = {
  getAll: (params = {}) => getEntities<Product>('/products', params),
  getById: (id: number) => getEntityById<Product>('/products', id),
  create: (data: Partial<Product>) => createEntity<Product>('/products', data),
  update: (id: number, data: Partial<Product>) => updateEntity<Product>('/products', id, data),
  delete: (id: number) => deleteEntity('/products', id),
};

export const recipeApi = {
  getAll: (params = {}) => getEntities<Recipe>('/recipes', params),
  getByIds: (dishId: number, productId: number) => api.get(`/recipes/${dishId}/${productId}`).then(res => res.data),
  create: (data: Partial<Recipe>) => createEntity<Recipe>('/recipes', data),
  update: (dishId: number, productId: number, data: Partial<Recipe>) =>
    api.put(`/recipes/${dishId}/${productId}`, data).then(res => res.data),
  delete: (dishId: number, productId: number) => api.delete(`/recipes/${dishId}/${productId}`),
};

export const orderApi = {
  create: (data: Partial<Order>) => createEntity<Order>('/orders', data),
  getAll: () => getEntities<Order>('/orders'),
  delete: (id: number) => deleteEntity('/orders', id),
};

export const reportApi = {
  getDishRatings: (min_rating: number = 3) =>
    api.get('/reports/dish_ratings', { params: { min_rating } }).then(res => res.data),
};

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/login', data).then(res => res.data),
  register: (data: { email: string; password: string; name_user: string; is_admin: boolean }) =>
    api.post('/register', data).then(res => res.data),
};

export default api;
