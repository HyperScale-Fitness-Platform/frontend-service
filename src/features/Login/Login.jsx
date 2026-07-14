import React, { useState } from 'react';
import { Link } from 'react-router'; 
import styles from './Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call auth API
  };

  return (
    <div className={styles.page}>

      {/* Brand / signature panel */}
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

      {/* Form panel */}
      <div className={styles.formPanel}>
        <form className={styles.formWrap} onSubmit={handleSubmit}>
          <p className={styles.formHeadEyebrow}>Sign in</p>
          <h2 className={styles.formTitle}>Log in to your account</h2>
          
          {/* 2. Replaced <a> with <Link> */}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.rowBetween}>
            <Link className={styles.linkMuted} to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className={styles.submitBtn}>Log in</button>
        </form>
      </div>
    </div>
  );
}