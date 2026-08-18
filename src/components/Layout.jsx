import { Outlet } from 'react-router';
import Navbar from './Navbar';
import Footer from './Footer';
import styles from './Layout.module.css';
import AIAssistant from '../features/AI/AIAssistant';

export default function Layout() {
  return (
    <div className={styles.appShell}>
      <Navbar />
      <main className={styles.main}>
        <Outlet />
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
}