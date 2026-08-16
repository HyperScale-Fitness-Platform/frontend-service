import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { openTrainerSlot } from '../bookingApi';
import { getTrainers } from '../../TrainerManagement/trainerApi';
import styles from '../Booking.module.css';

const schema = z.object({
  trainerId: z.string().min(1, 'Select a trainer'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
}).refine(
  (val) => new Date(val.endTime) > new Date(val.startTime),
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

export default function TrainerOpenSlot({ onOpened }) {
  const [loading, setLoading] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getTrainers();
        setTrainers(res.data?.data ?? res.data ?? []);
      } catch {
        toast.error('Failed to load trainers');
      }
    })();
  }, []);

  const onSubmit = async ({ trainerId, ...data }) => {
    setLoading(true);
    try {
      const res = await openTrainerSlot(trainerId, {
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      });
      toast.success('Slot opened');
      reset();
      onOpened?.(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to open slot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.card}>
      <h3 className={styles.cardTitle}>Open a PT Availability Slot</h3>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Trainer</label>
        <select className={styles.input} {...register('trainerId')}>
          <option value="">Select a trainer...</option>
          {trainers.map((trainer) => (
            <option key={trainer.id} value={trainer.id}>
              {trainer.full_name}
            </option>
          ))}
        </select>
        {errors.trainerId && <span className={styles.errorText}>{errors.trainerId.message}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>Start Time</label>
        <input className={styles.input} type="datetime-local" {...register('startTime')} />
        {errors.startTime && <span className={styles.errorText}>{errors.startTime.message}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel}>End Time</label>
        <input className={styles.input} type="datetime-local" {...register('endTime')} />
        {errors.endTime && <span className={styles.errorText}>{errors.endTime.message}</span>}
      </div>

      <button type="submit" className={styles.cardBtn} disabled={loading}>
        {loading ? 'Opening...' : 'Open Slot'}
      </button>
    </form>
  );
}