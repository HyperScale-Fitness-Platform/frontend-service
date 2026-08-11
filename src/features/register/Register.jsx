import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import styles from '../Login/Login.module.css';
import apiGatewayClient from '../../utils/api_getway.js';
import { Link, useNavigate } from 'react-router';

const registerSchema = z.object({
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
  photo: z.any()
    .refine((files) => files && files.length > 0, "Photo is required")
    .refine((files) => files?.[0]?.size <= 5 * 1024 * 1024, "Max file size is 5MB")
    .refine(
      (files) => ['image/jpeg', 'image/png', 'image/webp'].includes(files?.[0]?.type),
      "Only .jpg, .png, and .webp formats are supported"
    ),
});

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const passwordValue = watch('password') || '';

  const passwordStrength = (() => {
    let score = 0;
    if (passwordValue.length >= 8) score++;
    if (/[A-Z]/.test(passwordValue)) score++;
    if (/[0-9]/.test(passwordValue)) score++;
    if (/[^A-Za-z0-9]/.test(passwordValue)) score++;
    return score;
  })();

  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['#E4E3DD', '#d93025', '#e8a33d', '#8FBC3F', '#6E9A2F'];

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
      const formData = new FormData();

      // Fields mapped to users + customer_profiles tables
      formData.append('full_name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('phone', data.phone);
      formData.append('date_of_birth', data.date_of_birth);
      formData.append('gender', data.gender);
      formData.append('role', 'customer'); // required NOT NULL column on users table
      if (data.photo && data.photo.length > 0) {
        formData.append('photo', data.photo[0]);
      }

      const response = await apiGatewayClient.post('/auth/register', formData);

      toast.success("Account created successfully! Redirecting...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error("API Error:", error);
      console.error("Server response:", error.response?.data);

      let errorMessage = "Registration failed";
      if (error.response) {
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Server unreachable. Please try again later.";
      }

      setError("email", { type: "server", message: errorMessage });
      toast.error(errorMessage);
    }
  };

  return (
    <div className={styles.page}>
      <Toaster position="top-center" reverseOrder={false} />

      <div className={styles.brandPanel}>
        <div className={styles.brandTop}>
          <div className={styles.logoMark}>P</div>
          <span className={styles.logoText}>HyperScale Fitness Platform</span>
        </div>

        <div className={styles.brandMid}>
          <p className={styles.brandEyebrow}>Join the community</p>
          <h1 className={styles.brandHeadline}>
            Your progress,<br />
            <span>tracked daily.</span>
          </h1>
          <p className={styles.brandSub}>
            Create an account to book sessions, chat with trainers, and follow your nutrition and weight progress in one place.
          </p>
        </div>

        <div className={styles.brandFoot}>
          <div><strong>4.9</strong> member rating</div>
          <div><strong>120+</strong> classes weekly</div>
          <div><strong>35</strong> certified trainers</div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <form className={styles.formWrap} onSubmit={handleSubmit(onSubmit)} noValidate>
          <p className={styles.formHeadEyebrow}>Sign up</p>
          <h2 className={styles.formTitle}>Create your account</h2>
          <p className={styles.formSub}>
            Already a member? <Link to="/login">Log in</Link>
          </p>

          <div className={styles.photoField}>
            <label htmlFor="photo" className={styles.photoDrop}>
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className={styles.photoPreviewImg} />
              ) : (
                <div className={styles.photoPlaceholder}>
                  <span className={styles.photoPlusIcon}>+</span>
                  <span>Add photo</span>
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
              <span className={styles.fieldLabel}>Profile photo</span>
              <span className={styles.photoHint}>JPG, PNG or WEBP · Max 5MB</span>
              {errors.photo && <span className={styles.errorText}>{errors.photo.message}</span>}
            </div>
          </div>

          <div className={styles.sectionLabel}>Basic info</div>

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
              placeholder="you@example.com"
              {...register("email")}
            />
            {errors.email && <span className={styles.errorText}>{errors.email.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="password">Password</label>
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
            {passwordValue.length > 0 && (
              <div className={styles.strengthWrap}>
                <div className={styles.strengthBar}>
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={styles.strengthSeg}
                      style={{
                        background: i < passwordStrength ? strengthColors[passwordStrength] : '#EEEDE7'
                      }}
                    />
                  ))}
                </div>
                <span className={styles.strengthLabel} style={{ color: strengthColors[passwordStrength] }}>
                  {strengthLabels[passwordStrength]}
                </span>
              </div>
            )}
            {errors.password && <span className={styles.errorText}>{errors.password.message}</span>}
          </div>

          <div className={styles.sectionLabel}>Personal details</div>

          <div className={styles.fieldGrid}>
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

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}