import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    const res = await fetch('http://localhost:4000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
       toast.success('Signup successful! Please login.');
      router.push('/login');
    } else {
      const data = await res.json();
      toast.error(data.message || 'Signup failed');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign Up</h2>
        <p style={styles.subtitle}>Create your new account</p>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSignup} style={styles.button}>
          Register
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #6e4aff, #845ef7)', // purple gradient
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    padding: '40px 30px',
    maxWidth: '400px',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  title: {
    marginBottom: '10px',
    color: '#5a3cff',
    fontSize: '28px',
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: '30px',
    color: '#6b6b6b',
    fontSize: '16px',
  },
  input: {
    width: '100%',
    padding: '14px 15px',
    marginBottom: '20px',
    borderRadius: '10px',
    border: '1.5px solid #ddd',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#5a3cff',
    color: 'white',
    fontSize: '18px',
    fontWeight: '700',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(90, 60, 255, 0.4)',
    transition: 'background-color 0.3s ease',
  },
};
