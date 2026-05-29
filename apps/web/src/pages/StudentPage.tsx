import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NoorOwl from '../components/NoorOwl';

export default function StudentPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  if (!user) return null;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <span style={styles.logo}>الموجه الذكي 🦉</span>
        <button
          style={styles.logoutBtn}
          onClick={() => {
            localStorage.clear();
            navigate('/login');
          }}
        >
          خروج
        </button>
      </header>

      <main style={styles.main}>
        <motion.div
          style={styles.heroCard}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <NoorOwl expression="happy" size={100} animate message={`أهلاً ${user.firstName || ''}! جاهز للتعلم؟`} />
          <div>
            <h2 style={styles.welcomeText}>مرحباً، {user.firstName || 'طالبنا العزيز'}!</h2>
            <p style={styles.subText}>ابدأ رحلة التعلم اليوم</p>
          </div>
        </motion.div>

        <div style={styles.grid}>
          {['عربي', 'عبري', 'إنجليزي', 'رياضيات', 'علوم'].map((subject) => (
            <motion.div
              key={subject}
              style={styles.subjectCard}
              whileHover={{ scale: 1.04, boxShadow: '0 8px 24px rgba(26,31,94,0.15)' }}
              whileTap={{ scale: 0.97 }}
            >
              <span style={styles.subjectIcon}>📚</span>
              <span style={styles.subjectName}>{subject}</span>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#f8f9ff',
    direction: 'rtl',
  },
  header: {
    background: '#1A1F5E',
    color: 'white',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: 22,
    fontWeight: 800,
    color: '#FFD700',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #FFD700',
    color: '#FFD700',
    padding: '6px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: 'inherit',
  },
  main: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '32px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  heroCard: {
    background: 'white',
    borderRadius: 20,
    padding: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    boxShadow: '0 4px 16px rgba(26,31,94,0.08)',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1A1F5E',
    margin: 0,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    margin: '4px 0 0',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 16,
  },
  subjectCard: {
    background: 'white',
    borderRadius: 16,
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(26,31,94,0.07)',
    transition: 'box-shadow 0.2s',
  },
  subjectIcon: {
    fontSize: 36,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1A1F5E',
  },
};
