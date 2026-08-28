
import './App.css'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

function App() {
  const [isdataLoaded, setloded] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const fetchData = async () => {
    try {
      const response = await axios.post('http://localhost:3000/register', {
        username : formData.username,
        email: formData.email ,
        password : formData.password
      });
      console.log(response.data);
      return response.data;
    }catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  const { data, isLoading, error } = useQuery({
    queryKey: ['register'],
   queryFn: fetchData,
   enabled: isdataLoaded,
   staleTime: 1000 * 5
  });
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  return (
    <main>
      <h1>Welcome to React</h1>
      <form onSubmit={(e) => {
       setloded(true)
      }}>
        <label>
          Username:
          <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
        </label>
        <br />
        <label>
          Email:
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
        </label>
        <br />
        <button type="submit" >Register</button>
      </form>
      {data && (
        <div>
          <h2>User Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}

    </main>
   
  )
}

export default App
