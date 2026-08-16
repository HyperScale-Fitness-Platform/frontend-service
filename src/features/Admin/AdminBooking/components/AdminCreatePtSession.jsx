import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { createPtSession } from '../bookingApi';
import styles from '../Booking.module.css';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  sessions: z.coerce.number().int().min(1, 'Sessions must be at least 1'),
  price: z.coerce.number().positive('Price must be greater than 0'),
});

export default function AdminCreatePtSession({ onCreated }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await createPtSession({
        name: data.name,
        sessions: data.sessions,
        price: data.price,
      });
      toast.success('PT session created');
      reset();
      onCreated?.(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create PT session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.card}>
      <h3 className={styles.cardTitle}>Create a PT Session</h3>
      <p className={styles.cardMeta}>Customers will see this offering and can purchase it.</p>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Name</label>
        <input className={styles.input} placeholder="e.g. 20 Sessions" {...register('name')} />
        {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Number of Sessions</label>
        <input className={styles.input} type="number" min="1" {...register('sessions')} />
        {errors.sessions && <span className={styles.errorText}>{errors.sessions.message}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Price (EGP)</label>
        <input className={styles.input} type="number" min="0" step="0.01" placeholder="e.g. 1000" {...register('price')} />
        {errors.price && <span className={styles.errorText}>{errors.price.message}</span>}
      </div>

      <button type="submit" className={styles.cardBtn} disabled={loading}>
        {loading ? 'Creating...' : 'Create PT Session'}
      </button>
    </form>
  );
}