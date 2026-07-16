'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        toast.success('Login successful!');
        router.push('/businesses');
      } else {
        toast.error(data.message || 'Invalid username or password.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Network error. Please try again.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>OnePaySlip Login</h2>
        <p style={styles.subtitle}>
          Please enter your credentials to continue.
        </p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleLogin} style={styles.button}>
          Login
        </button>

        <div style={styles.forgot}>
          <a href="#" style={styles.forgotLink}>
            Forgot Password?
          </a>
        </div>
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
    background: 'linear-gradient(135deg, #6e4aff, #845ef7)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '15px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
    padding: '40px 30px',
    maxWidth: '400px',
    width: '100%',
    boxSizing: 'border-box' as const,
    textAlign: 'center' as const,
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
  },
  forgot: {
    marginTop: '20px',
  },
  forgotLink: {
    color: '#5a3cff',
    textDecoration: 'underline',
    fontSize: '14px',
    cursor: 'pointer',
  },
};
