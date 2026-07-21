import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { createClass } from '../bookingApi';
import styles from '../Booking.module.css';

const schema = z.object({
  name: z.string().min(1, 'Class name is required'),
  type: z.string().min(1, 'Type is required'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
});

export default function AdminCreateClass({ onCreated }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await createClass(data);
      toast.success('Class created');
      reset();
      onCreated?.(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.card}>
      <div className={styles.cardEyebrow}>Catalog</div>
      <h3 className={styles.cardTitle}>Create a Class</h3>
      <h3 className={styles.cardTitle}>Create a Class</h3>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Name</label>
        <input className={styles.input} placeholder="e.g. Yoga Flow" {...register('name')} />
        {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Type</label>
        <input className={styles.input} placeholder="e.g. group" {...register('type')} />
        {errors.type && <span className={styles.errorText}>{errors.type.message}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Capacity</label>
        <input className={styles.input} type="number" {...register('capacity')} />
        {errors.capacity && <span className={styles.errorText}>{errors.capacity.message}</span>}
      </div>

      <button type="submit" className={styles.cardBtn} disabled={loading}>
        {loading ? 'Creating...' : 'Create Class'}
      </button>
    </form>
  );
}