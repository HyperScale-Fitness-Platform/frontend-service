import { useState, useEffect } from 'react';
import { getClasses } from './bookingApi';
import AdminCreateClass from './components/AdminCreateClass';
import AdminScheduleSession from './components/AdminScheduleSession';
import TrainerOpenSlot from './components/TrainerOpenSlot';
import styles from './Booking.module.css';

const OPTIONS = [
  {
    key: 'classes',
    title: 'Classes',
    description: 'Create a new class type for the gym catalog.',
    icon: '🏋️',
  },
  {
    key: 'sessions',
    title: 'Sessions',
    description: 'Schedule when a class actually happens.',
    icon: '📅',
  },
  {
    key: 'availability',
    title: 'My Availability',
    description: 'Open a personal training slot for customers to book.',
    icon: '🕒',
  },
];

export default function AdminBooking() {
  const [activePanel, setActivePanel] = useState(null);
  const [classes, setClasses] = useState([]);

  const loadClasses = async () => {
    const res = await getClasses();
    setClasses(res.data);
  };

  useEffect(() => {
    loadClasses();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.eyebrow}>Studio Management</div>
        <h1 className={styles.pageTitle}>Booking Setup</h1>
        <p className={styles.pageSub}>Create classes, schedule sessions, and manage your availability.</p>
        <div className={styles.optionGrid}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`${styles.optionCard} ${activePanel === opt.key ? styles.optionCardActive : ''}`}
              onClick={() => setActivePanel(activePanel === opt.key ? null : opt.key)}
            >
              <span className={styles.optionIconBadge}>
                <span className={styles.optionIcon}>{opt.icon}</span>
              </span>              <span className={styles.optionTitle}>{opt.title}</span>
              <span className={styles.optionDesc}>{opt.description}</span>
            </button>
          ))}
        </div>

        {activePanel && (
          <div className={styles.panel}>
            {activePanel === 'classes' && (
              <AdminCreateClass onCreated={loadClasses} />
            )}
            {activePanel === 'sessions' && (
              <AdminScheduleSession classes={classes} onScheduled={() => { }} />
            )}
            {activePanel === 'availability' && (
              <TrainerOpenSlot onOpened={() => { }} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}