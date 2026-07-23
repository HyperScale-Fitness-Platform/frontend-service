import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { getTrainers, createTrainer, updateTrainer, deleteTrainer } from './trainerApi';
import styles from './TrainerManagement.module.css';

const createSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  bio: z.string().optional(),
  gender: z.enum(['male', 'female'], { errorMap: () => ({ message: 'Select a gender' }) }),
  photo_url: z.string().url('Enter a valid URL').optional().or(z.literal('')),
});

const editSchema = createSchema.omit({ password: true }).extend({
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
});

export default function TrainerManagement() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTrainer, setEditingTrainer] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const schema = editingTrainer ? editSchema : createSchema;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const loadTrainers = async () => {
    setLoading(true);
    try {
      const res = await getTrainers();
      setTrainers(res.data?.data ?? res.data ?? []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrainers();
  }, []);

  const openCreateForm = () => {
    setEditingTrainer(null);
    reset({
      email: '',
      password: '',
      full_name: '',
      bio: '',
      gender: undefined,
      photo_url: '',
    });
    setShowForm(true);
  };

  const openEditForm = (trainer) => {
    setEditingTrainer(trainer);
    reset({
      email: trainer.email || '',
      password: '',
      full_name: trainer.full_name || '',
      bio: trainer.bio || '',
      gender: trainer.gender || undefined,
      photo_url: trainer.photo_url || '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTrainer(null);
    reset();
  };

  const onSubmit = async (data) => {
    const payload = { ...data };
    if (editingTrainer && !payload.password) {
      delete payload.password;
    }

    try {
      if (editingTrainer) {
        const id = editingTrainer.id ?? editingTrainer.trainer_id;
        await updateTrainer(id, payload);
        toast.success('Trainer updated');
      } else {
        await createTrainer(payload);
        toast.success('Trainer created');
      }
      closeForm();
      loadTrainers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save trainer');
    }
  };

  const handleDelete = async (trainer) => {
    const id = trainer.id ?? trainer.trainer_id;
    if (!window.confirm(`Delete ${trainer.full_name}? This can't be undone.`)) return;

    setDeletingId(id);
    try {
      await deleteTrainer(id);
      toast.success('Trainer deleted');
      setTrainers((prev) => prev.filter((t) => (t.id ?? t.trainer_id) !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete trainer');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div>
            <div className={styles.eyebrow}>Staff Management</div>
            <h1 className={styles.pageTitle}>Trainers</h1>
            <p className={styles.pageSub}>Add, update, or remove trainer profiles.</p>
          </div>
          <button className={styles.primaryBtn} onClick={openCreateForm}>
            + Add Trainer
          </button>
        </div>

        {showForm && (
          <div className={styles.formOverlayCard}>
            <form onSubmit={handleSubmit(onSubmit)} className={styles.card}>
              <div className={styles.cardEyebrow}>
                {editingTrainer ? 'Edit Trainer' : 'New Trainer'}
              </div>
              <h3 className={styles.cardTitle}>
                {editingTrainer ? editingTrainer.full_name : 'Create a Trainer'}
              </h3>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Full Name</label>
                  <input className={styles.input} placeholder="e.g. Yaseen Hamdy" {...register('full_name')} />
                  {errors.full_name && <span className={styles.errorText}>{errors.full_name.message}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Gender</label>
                  <select className={styles.input} {...register('gender')}>
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                  {errors.gender && <span className={styles.errorText}>{errors.gender.message}</span>}
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Email</label>
                  <input className={styles.input} type="email" placeholder="trainer@gmail.com" {...register('email')} />
                  {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.fieldLabel}>
                    Password {editingTrainer && <span className={styles.optionalTag}>(leave blank to keep)</span>}
                  </label>
                  <input className={styles.input} type="password" placeholder="••••••••" {...register('password')} />
                  {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Photo URL</label>
                <input className={styles.input} placeholder="https://example.com/photo.jpg" {...register('photo_url')} />
                {errors.photo_url && <span className={styles.errorText}>{errors.photo_url.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel}>Bio</label>
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  placeholder="Short professional bio..."
                  rows={3}
                  {...register('bio')}
                />
                {errors.bio && <span className={styles.errorText}>{errors.bio.message}</span>}
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.secondaryBtn} onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className={styles.cardBtn} disabled={isSubmitting}>
                  {isSubmitting && <span className={styles.spinner} />}
                  {isSubmitting
                    ? 'Saving...'
                    : editingTrainer
                    ? 'Save Changes'
                    : 'Create Trainer'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className={styles.listSection}>
          {loading ? (
            <div className={styles.emptyState}>Loading trainers...</div>
          ) : trainers.length === 0 ? (
            <div className={styles.emptyState}>
              No trainers yet. Click <strong>Add Trainer</strong> to create one.
            </div>
          ) : (
            <div className={styles.grid}>
              {trainers.map((trainer) => {
                const id = trainer.id ?? trainer.trainer_id;
                return (
                  <div key={id} className={styles.trainerCard}>
                    <div className={styles.trainerTop}>
                      {trainer.photo_url ? (
                        <img
                          src={trainer.photo_url}
                          alt={trainer.full_name}
                          className={styles.avatar}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className={styles.avatarFallback}>
                          {trainer.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <div className={styles.trainerName}>{trainer.full_name}</div>
                        <div className={styles.trainerEmail}>{trainer.email}</div>
                      </div>
                    </div>

                    {trainer.bio && <p className={styles.trainerBio}>{trainer.bio}</p>}

                    <div className={styles.trainerMeta}>
                      <span className={styles.genderTag}>{trainer.gender}</span>
                    </div>

                    <div className={styles.trainerActions}>
                      <button className={styles.cardBtn} onClick={() => openEditForm(trainer)}>
                        Edit
                      </button>
                      <button
                        className={styles.cancelBtn}
                        onClick={() => handleDelete(trainer)}
                        disabled={deletingId === id}
                      >
                        {deletingId === id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}