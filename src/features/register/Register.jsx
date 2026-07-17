import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import styles from '../Login/Login.module.css';
import apiGatewayClient from '../../utils/api_getway.js'
import { Link, useNavigate } from 'react-router';

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["customer"]).default("customer"),
});

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'customer' }
  });

  const onSubmit = async (data) => {
    try {
      await apiGatewayClient.post('/auth/register', data);

      toast.success("Account created successfully! Redirecting...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error("API Error:", error);
      const backendMessage = error.response?.data?.message || "Registration failed";
      setError("email", { type: "server", message: backendMessage });
    }
  };
  return (
    <div className={styles.page}>
      {/* 3. Drop the Toaster component anywhere in the render tree */}
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
          <div><strong>4.9</strong>member rating</div>
          <div><strong>120+</strong>classes weekly</div>
          <div><strong>35</strong>certified trainers</div>
        </div>
      </div>

      <div className={styles.formPanel}>
        <form className={styles.formWrap} onSubmit={handleSubmit(onSubmit)}>
          <p className={styles.formHeadEyebrow}>Sign up</p>
          <h2 className={styles.formTitle}>Create your account</h2>
          <p className={styles.formSub}>
            Already a member? <a href="/login">Log in</a>
          </p>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="name">Full name</label>
            <input
              id="name"
              type="text"
              className={styles.input}
              placeholder="Jane Doe"
              {...register("name")}
            />
            {/* 4. Use the new CSS class instead of inline styles */}
            {errors.name && (
              <span className={styles.errorText}>{errors.name.message}</span>
            )}
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
            {errors.email && (
              <span className={styles.errorText}>{errors.email.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <span className={styles.errorText}>{errors.password.message}</span>
            )}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}