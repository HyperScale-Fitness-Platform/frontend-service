import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import styles from './Login.module.css';
import apiGatewayClient from '../../utils/api_getway';

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await apiGatewayClient.post('/auth/login', data);

      if (res.data && res.data.token) {
        // Changed key to customerToken
        localStorage.setItem('customerToken', res.data.token);
      }

      toast.success("Login successful! Redirecting...");

      setTimeout(() => {
        navigate('/customerHomePage');
      }, 1000);

    } catch (error) {
      console.error("API Error:", error);

      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid email or password";

      toast.error(backendMessage);

      setError("email", { type: "server", message: backendMessage });
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
          <p className={styles.brandEyebrow}>Welcome back</p>
          <h1 className={styles.brandHeadline}>
            Train smarter.<br />
            Track <span>everything.</span>
          </h1>
          <p className={styles.brandSub}>
            Log in to check your progress, book your next session, and see who's training right now.
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
          <p className={styles.formHeadEyebrow}>Sign in</p>
          <h2 className={styles.formTitle}>Log in to your account</h2>

          <p className={styles.formSub}>
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>

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

          <div className={styles.rowBetween}>
            <Link className={styles.linkMuted} to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}