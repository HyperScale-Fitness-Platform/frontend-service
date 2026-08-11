import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { scheduleSession } from '../bookingApi';
import DateTimeField from '../../../../components/DateTimeField';
import styles from '../Booking.module.css';

const schema = z.object({
  classId: z.string().min(1, 'Select a class'),
  trainerId: z.string().min(1, 'Trainer ID is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

export default function AdminScheduleSession({ classes, onScheduled }) {
  const [status, setStatus] = useState('idle');
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async ({ classId, ...data }) => {
    setStatus('submitting');
    try {
      const res = await scheduleSession(classId, data);
      setStatus('success');
      toast.success('Session scheduled');
      reset();
      onScheduled?.(res.data);
      setTimeout(() => setStatus('idle'), 2000);
    } catch (err) {
      setStatus('idle');
      toast.error(err.response?.data?.message || 'Failed to schedule session');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyDown} className={styles.card}>
      <h3 className={styles.cardTitle}>Schedule a Class Session</h3>

      <fieldset disabled={status === 'submitting'} className={styles.fieldset}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Class</label>
          <select className={styles.input} {...register('classId')}>
            <option value="">Select a class...</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.classId && <span className={styles.errorText}>{errors.classId.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Trainer ID</label>
          <input className={styles.input} placeholder="trainer's UUID" {...register('trainerId')} />
          {errors.trainerId && <span className={styles.errorText}>{errors.trainerId.message}</span>}
        </div>

        <DateTimeField control={control} name="startTime" label="Start Time" error={errors.startTime} />
        <DateTimeField control={control} name="endTime" label="End Time" error={errors.endTime} />

        <button type="submit" className={styles.cardBtn} disabled={status === 'submitting'}>
          {status === 'submitting' && <span className={styles.spinner} />}
          {status === 'submitting' ? 'Scheduling...' : status === 'success' ? '✓ Scheduled' : 'Schedule Session'}
        </button>
      </fieldset>

      {status === 'success' && (
        <div className={styles.successBanner}>✓ Session scheduled successfully</div>
      )}
    </form>
  );
}