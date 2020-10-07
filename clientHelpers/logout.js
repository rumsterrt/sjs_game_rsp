import axios from 'axios'
export default async () => {
  await axios.get('/api/logout')
  window.location += ''
}
