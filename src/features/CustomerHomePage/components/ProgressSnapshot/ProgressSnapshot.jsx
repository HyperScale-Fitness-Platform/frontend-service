import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import progressApi from "../../../Progress/progressApi";
import styles from "./ProgressSnapshot.module.css";

export default function ProgressSnapshot() {
  const navigate = useNavigate();

  const customerId = localStorage.getItem("userId");

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    if (!customerId) {
      setLoading(false);
      return;
    }

    try {
      const response =
        await progressApi.getInBodyHistory(
          customerId,
          {
            page: 1,
            limit: 20,
          }
        );

      const history =
        response?.data ||
        response?.records ||
        response?.results ||
        response ||
        [];

      setRecords(
        Array.isArray(history) ? history : []
      );
    } catch (error) {
      console.error(
        "Failed to load progress history:",
        error
      );

      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  const sortedRecords = useMemo(() => {
    return [...records].sort(
      (a, b) =>
        new Date(a.test_date) -
        new Date(b.test_date)
    );
  }, [records]);

  const latest =
    sortedRecords.length > 0
      ? sortedRecords[sortedRecords.length - 1]
      : null;

  const previous =
    sortedRecords.length > 1
      ? sortedRecords[sortedRecords.length - 2]
      : null;

  const weightChange = getChange(
    latest?.weight_kg,
    previous?.weight_kg
  );

  const bodyFatChange = getChange(
    latest?.body_fat_pct,
    previous?.body_fat_pct
  );

  const muscleChange = getChange(
    latest?.skeletal_muscle_mass_kg,
    previous?.skeletal_muscle_mass_kg
  );

  const scoreChange = getChange(
    latest?.inbody_score,
    previous?.inbody_score
  );

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.loading}>
          Loading your progress...
        </div>
      </section>
    );
  }

  if (!latest) {
    return (
      <section className={styles.emptySection}>
        <div>
          <span className={styles.eyebrow}>
            YOUR PROGRESS
          </span>

          <h2>Start tracking your progress</h2>

          <p>
            Add your InBody measurements and turn
            your fitness journey into measurable
            progress.
          </p>

          <button
            className={styles.primaryButton}
            onClick={() => navigate("/progress")}
          >
            Add your first InBody
            <span>→</span>
          </button>
        </div>

        <div className={styles.emptyVisual}>
          <div>+</div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>
            YOUR PROGRESS
          </span>

          <h2>Progress snapshot</h2>

          <p>
            A clear view of how your body is
            changing over time.
          </p>
        </div>

        <button
          className={styles.viewButton}
          onClick={() => navigate("/progress")}
        >
          View full progress
          <span>→</span>
        </button>
      </div>

      <div className={styles.metrics}>
        <Metric
          label="Weight"
          value={latest.weight_kg}
          unit="kg"
          change={weightChange}
          type="weight"
          icon="W"
        />

        <Metric
          label="Body fat"
          value={latest.body_fat_pct}
          unit="%"
          change={bodyFatChange}
          type="fat"
          icon="%"
        />

        <Metric
          label="Skeletal muscle"
          value={latest.skeletal_muscle_mass_kg}
          unit="kg"
          change={muscleChange}
          type="muscle"
          icon="M"
        />

        <Metric
          label="InBody score"
          value={latest.inbody_score}
          unit="/100"
          change={scoreChange}
          type="score"
          icon="★"
        />
      </div>

      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div>
            <span>WEIGHT TREND</span>

            <strong>
              {formatNumber(latest.weight_kg)}
              <small> kg</small>
            </strong>
          </div>

          <div className={styles.lastTest}>
            <span>LAST TEST</span>
            <strong>
              {formatDate(latest.test_date)}
            </strong>
          </div>
        </div>

        <WeightChart records={sortedRecords} />
      </div>

      <div className={styles.compositionGrid}>
        <CompositionCard
          title="Body composition"
          label="Body fat"
          value={latest.body_fat_pct}
          unit="%"
          change={bodyFatChange}
          records={sortedRecords}
          field="body_fat_pct"
          lowerIsBetter
        />

        <CompositionCard
          title="Muscle development"
          label="Skeletal muscle"
          value={latest.skeletal_muscle_mass_kg}
          unit="kg"
          change={muscleChange}
          records={sortedRecords}
        />
      </div>

      <div className={styles.footer}>
        <div>
          <span>TRACKING</span>
          <strong>
            {records.length}{" "}
            {records.length === 1
              ? "measurement"
              : "measurements"}
          </strong>
        </div>

        <button
          onClick={() => navigate("/progress")}
        >
          Open progress dashboard →
        </button>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  unit,
  change,
  type,
  icon,
}) {
  const good =
    type === "weight" || type === "fat"
      ? change < 0
      : change > 0;

  return (
    <div className={styles.metric}>
      <div className={styles.metricTop}>
        <span>{label}</span>

        <i className={styles[`icon${type}`]}>
          {icon}
        </i>
      </div>

      <div className={styles.metricValue}>
        <strong>{formatNumber(value)}</strong>
        <small>{unit}</small>
      </div>

      {change !== null ? (
        <div
          className={`${styles.change} ${
            change === 0
              ? styles.neutral
              : good
              ? styles.good
              : styles.bad
          }`}
        >
          {change > 0
            ? "↑"
            : change < 0
            ? "↓"
            : "→"}

          {" "}

          {Math.abs(change).toFixed(1)}
          {unit === "%" ? "%" : " kg"}
        </div>
      ) : (
        <div className={styles.first}>
          First measurement
        </div>
      )}
    </div>
  );
}

function CompositionCard({
  title,
  label,
  value,
  unit,
  change,
  records,
  field,
  lowerIsBetter = false,
}) {
  const points = records
    .filter(
      (record) =>
        record[field] !== undefined &&
        record[field] !== null
    )
    .slice(-6);

  const good =
    lowerIsBetter ? change < 0 : change > 0;

  return (
    <div className={styles.compositionCard}>
      <div className={styles.compositionHeader}>
        <div>
          <span>{title}</span>

          <strong>
            {formatNumber(value)}
            <small> {unit}</small>
          </strong>
        </div>

        {change !== null && (
          <div
            className={
              change === 0
                ? styles.compositionNeutral
                : good
                ? styles.compositionGood
                : styles.compositionBad
            }
          >
            {change > 0 ? "+" : ""}
            {change.toFixed(1)}
            {unit === "%" ? "%" : " kg"}
          </div>
        )}
      </div>

      <div className={styles.miniLabel}>
        {label}
      </div>

      <MiniChart
        records={points}
        field={field}
      />
    </div>
  );
}

function WeightChart({ records }) {
  const points = records
    .filter(
      (record) =>
        record.weight_kg !== undefined &&
        record.weight_kg !== null
    )
    .slice(-8);

  if (points.length < 2) {
    return (
      <div className={styles.chartEmpty}>
        Add another measurement to see your
        weight trend.
      </div>
    );
  }

  const width = 900;
  const height = 190;

  return (
    <div className={styles.chartWrapper}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className={styles.chart}
      >
        <line
          x1="0"
          y1="45"
          x2={width}
          y2="45"
          className={styles.gridLine}
        />

        <line
          x1="0"
          y1="95"
          x2={width}
          y2="95"
          className={styles.gridLine}
        />

        <line
          x1="0"
          y1="145"
          x2={width}
          y2="145"
          className={styles.gridLine}
        />

        <path
          d={createAreaPath(
            points,
            "weight_kg",
            width,
            height
          )}
          className={styles.area}
        />

        <path
          d={createLinePath(
            points,
            "weight_kg",
            width,
            height
          )}
          className={styles.line}
        />

        {points.map((point, index) => {
          const position =
            getPointPosition(
              points,
              "weight_kg",
              index,
              width,
              height
            );

          return (
            <circle
              key={`${point.test_date}-${index}`}
              cx={position.x}
              cy={position.y}
              r="4"
              className={styles.point}
            />
          );
        })}
      </svg>

      <div className={styles.chartDates}>
        {points.map((point, index) => (
          <span key={index}>
            {formatShortDate(
              point.test_date
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniChart({ records, field }) {
  if (records.length < 2) {
    return (
      <div className={styles.miniEmpty}>
        Not enough data yet
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 400 90"
      preserveAspectRatio="none"
      className={styles.miniChart}
    >
      <path
        d={createLinePath(
          records,
          field,
          400,
          90
        )}
        className={styles.miniLine}
      />

      {records.map((record, index) => {
        const position =
          getPointPosition(
            records,
            field,
            index,
            400,
            90
          );

        return (
          <circle
            key={index}
            cx={position.x}
            cy={position.y}
            r="3"
            className={styles.miniPoint}
          />
        );
      })}
    </svg>
  );
}

function createLinePath(
  records,
  field,
  width = 800,
  height = 180
) {
  if (!records.length) return "";

  return records
    .map((record, index) => {
      const point = getPointPosition(
        records,
        field,
        index,
        width,
        height
      );

      return `${index === 0 ? "M" : "L"} ${
        point.x
      } ${point.y}`;
    })
    .join(" ");
}

function createAreaPath(
  records,
  field,
  width,
  height
) {
  const line = createLinePath(
    records,
    field,
    width,
    height
  );

  const first = getPointPosition(
    records,
    field,
    0,
    width,
    height
  );

  const last = getPointPosition(
    records,
    field,
    records.length - 1,
    width,
    height
  );

  return `${line} L ${last.x} ${height} L ${first.x} ${height} Z`;
}

function getPointPosition(
  records,
  field,
  index,
  width,
  height
) {
  const values = records.map((record) =>
    Number(record[field])
  );

  const min = Math.min(...values);
  const max = Math.max(...values);

  const range =
    max - min === 0 ? 1 : max - min;

  const paddingX = 12;
  const paddingY = 22;

  const x =
    records.length === 1
      ? width / 2
      : paddingX +
        (index / (records.length - 1)) *
          (width - paddingX * 2);

  const y =
    height -
    paddingY -
    ((values[index] - min) / range) *
      (height - paddingY * 2);

  return { x, y };
}

function getChange(current, previous) {
  if (
    current === undefined ||
    current === null ||
    previous === undefined ||
    previous === null
  ) {
    return null;
  }

  const change =
    Number(current) - Number(previous);

  return Number.isFinite(change)
    ? change
    : null;
}

function formatNumber(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return value;
  }

  return number % 1 === 0
    ? number
    : number.toFixed(1);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
}

function formatShortDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
}