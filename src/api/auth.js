import client from './client'

export const register = async (name, email, password) => {
  const res = await client.post('/api/auth/register', { name, email, password })
  return res.data
}

export const login = async (email, password) => {
  const res = await client.post('/api/auth/login', { email, password })
  return res.data
}