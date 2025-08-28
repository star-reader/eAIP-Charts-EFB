import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_HOST,
    timeout: 10000
})

export default axiosInstance