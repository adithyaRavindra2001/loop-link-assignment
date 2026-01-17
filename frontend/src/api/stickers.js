import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getShopperDetails = async (shopperId) => {
  const response = await api.get(`/shoppers/${shopperId}/`);
  return response.data;
};

export const listShoppers = async () => {
  const response = await api.get('/shoppers/');
  return response.data;
};

export const submitTransaction = async (transaction) => {
  const response = await api.post('/transactions/', transaction);
  return response.data;
};

export default api;
