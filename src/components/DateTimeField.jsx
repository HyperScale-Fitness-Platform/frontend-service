import { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import styles from './DateTimeField.module.css';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ['00', '15', '30', '45'];

export default function DateTimeField({ control, name, label, error }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => <Picker field={field} />}
      />
      {error && <span className={styles.errorText}>{error.message}</span>}
    </div>
  );
}

function Picker({ field }) {
  const [parts, setParts] = useState(() => parseValue(field.value));

  const update = (patch) => {
    const next = { ...parts, ...patch };
    setParts(next);
    field.onChange(toISOString(next));
  };

  return (
    <div className={styles.row}>
      <input
        type="date"
        className={styles.dateInput}
        value={parts.date}
        onChange={(e) => update({ date: e.target.value })}
      />
      <select
        className={styles.select}
        value={parts.hour}
        onChange={(e) => update({ hour: e.target.value })}
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>{h}</option>
        ))}
      </select>
      <span className={styles.colon}>:</span>
      <select
        className={styles.select}
        value={parts.minute}
        onChange={(e) => update({ minute: e.target.value })}
      >
        {MINUTES.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <select
        className={styles.selectAmPm}
        value={parts.ampm}
        onChange={(e) => update({ ampm: e.target.value })}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}

function parseValue(isoString) {
  if (!isoString) {
    return { date: '', hour: '', minute: '00', ampm: 'AM' };
  }
  const d = new Date(isoString);
  let hour = d.getHours();
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;

  return {
    date: d.toISOString().slice(0, 10),
    hour,
    minute: String(d.getMinutes()).padStart(2, '0'),
    ampm,
  };
}

function toISOString({ date, hour, minute, ampm }) {
  if (!date) return '';
  let h = Number(hour);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;

  const d = new Date(date);
  d.setHours(h, Number(minute), 0, 0);
  return d.toISOString();
}