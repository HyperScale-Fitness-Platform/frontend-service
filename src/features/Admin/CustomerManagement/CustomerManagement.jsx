import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import styles from './CustomerManagement.module.css';
import apiGatewayClient from '../../../utils/api_getway';

const customerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  gender: z.enum(["male", "female", "other"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  date_of_birth: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Valid date of birth is required"
  }),
  photo: z.any().optional(),
});

export default function CustomerManagement() {
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(customerSchema)
  });

  const fetchCustomers = async () => {
    setIsLoadingList(true);
    try {
      const response = await apiGatewayClient.get('/api/profiles/customers');
      
      setCustomers(response.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      toast.error("Failed to load customer list.");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handlePhotoChange = (e, onChangeRegister) => {
    onChangeRegister(e);
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const { onChange: photoOnChange, ...photoRegisterRest } = register("photo");

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        role: 'customer',
        phone: data.phone,
        full_name: data.name,
        gender: data.gender,
        photo_url: photoPreview || undefined,
      };

      const response = await apiGatewayClient.post('/auth/register', payload);

      toast.success("Customer account created successfully.");
      reset();
      setPhotoPreview(null);
      
      fetchCustomers();

    } catch (error) {
      console.error("API Error:", error);

      let errorMessage = "Failed to create customer";
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Server unreachable. Please try again later.";
      }

      setError("email", { type: "server", message: errorMessage });
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      return;
    }

    try {
      await apiGatewayClient.delete(`/auth/${customerId}`);
      
      toast.success("Customer deleted successfully.");
      fetchCustomers(); // Refresh the list from the server
    } catch (error) {
      console.error("Delete Error:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete customer";
      toast.error(errorMessage);
    }
  };

  return (
    <div className={styles.page}>
      <Toaster position="top-center" reverseOrder={false} />

      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>Admin · Customers</p>
          <h1 className={styles.title}>Customer management</h1>
          <p className={styles.subtitle}>Create and manage customer accounts for the platform.</p>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Add new customer</h2>
          <p className={styles.cardSub}>Customers cannot self-register. Create their account here.</p>

          <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* <div className={styles.photoField}>
              <label htmlFor="photo" className={styles.photoDrop}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className={styles.photoPreviewImg} />
                ) : (
                  <div className={styles.photoPlaceholder}>
                    <span className={styles.photoPlusIcon}>+</span>
                  </div>
                )}
              </label>
              <input
                id="photo"
                type="file"
                accept="image/jpeg, image/png, image/webp"
                className={styles.photoInputHidden}
                {...photoRegisterRest}
                onChange={(e) => handlePhotoChange(e, photoOnChange)}
              />
              <div className={styles.photoFieldMeta}>
                <span className={styles.fieldLabel}>Profile photo (optional)</span>
                <span className={styles.photoHint}>JPG, PNG or WEBP</span>
              </div>
            </div> */}

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  className={styles.input}
                  placeholder="Jane Doe"
                  {...register("name")}
                />
                {errors.name && <span className={styles.errorText}>{errors.name.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="customer@example.com"
                  {...register("email")}
                />
                {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
              </div>
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="password">Temporary password</label>
                <div className={styles.passwordWrap}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={styles.input}
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((s) => !s)}
                    tabIndex={-1}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  type="tel"
                  className={styles.input}
                  placeholder="+201000000000"
                  {...register("phone")}
                />
                {errors.phone && <span className={styles.errorText}>{errors.phone.message}</span>}
              </div>
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="date_of_birth">Date of birth</label>
                <input
                  id="date_of_birth"
                  type="date"
                  className={styles.input}
                  {...register("date_of_birth")}
                />
                {errors.date_of_birth && <span className={styles.errorText}>{errors.date_of_birth.message}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="gender">Gender</label>
                <select id="gender" className={styles.input} {...register("gender")} defaultValue="">
                  <option value="" disabled>Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && <span className={styles.errorText}>{errors.gender.message}</span>}
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.secondaryBtn} onClick={() => { reset(); setPhotoPreview(null); }}>
                Clear
              </button>
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create customer"}
              </button>
            </div>
          </form>
        </div>

        <div className={styles.card}>
          <div className={styles.listHeader}>
            <div>
              <h2 className={styles.cardTitle}>Recent customers</h2>
              <p className={styles.cardSub}>Newly created accounts appear here.</p>
            </div>
            <button 
              className={styles.refreshBtn} 
              onClick={fetchCustomers} 
              disabled={isLoadingList}
            >
              {isLoadingList ? "Refreshing..." : "Refresh list"}
            </button>
          </div>

          {customers.length === 0 && !isLoadingList ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>👤</span>
              <p>No customers created yet</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Gender</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.photo_url ? (
                        <img src={c.photo_url} alt={c.full_name} className={styles.avatarSm} />
                      ) : (
                        <div className={styles.avatarSmPlaceholder}>
                          {c.full_name ? c.full_name.charAt(0).toUpperCase() : '?'}
                        </div>
                      )}
                    </td>
                    <td>{c.full_name}</td>
                    <td>{c.phone}</td>
                    <td className={styles.capitalize}>{c.gender || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        className={styles.deleteActionBtn} 
                        onClick={() => handleDelete(c.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}