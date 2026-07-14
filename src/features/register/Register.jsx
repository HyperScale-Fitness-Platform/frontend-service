import React, { useState } from 'react'
import styles from '../Login/Login.module.css' 
export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: call register API
  }

  return (
    <div className={styles.page}>
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
        <form className={styles.formWrap} onSubmit={handleSubmit}>
          <p className={styles.formHeadEyebrow}>Sign up</p>
          <h2 className={styles.formTitle}>Create your account</h2>
          <p className={styles.formSub}>
            Already a member? <a href="/login">Log in</a>
          </p>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="name">Full name</label>
            <input
              id="name" name="name" type="text" className={styles.input}
              placeholder="Jane Doe" value={form.name} onChange={handleChange} required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email" className={styles.input}
              placeholder="you@example.com" value={form.email} onChange={handleChange} required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password" className={styles.input}
              placeholder="••••••••" value={form.password} onChange={handleChange} required
            />
          </div>


          <button type="submit" className={styles.submitBtn}>Create account</button>


        </form>
      </div>
    </div>
  )
}