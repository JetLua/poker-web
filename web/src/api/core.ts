import axios from 'axios'

const n = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true
})

n.interceptors.response.use(r => {
  return r.data
}, async ({response, message}) => {
  if (response?.status === 401) {
    open(response.data.uri, '_top')
    return Promise.reject(new Error('401'))
  }
  if (response?.data) return Promise.reject(new Error(response.data || message))
  return Promise.reject(new Error(message))
})

export default n
