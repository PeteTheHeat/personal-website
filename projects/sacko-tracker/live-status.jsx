"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

function formatCountdown(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function CompletedStatus({ completedBeforeDeadline }) {
  return (
    <div className="sacko-live-status sacko-live-status-complete">
      <span className="sacko-live-label">Challenge complete</span>
      <strong>
        {completedBeforeDeadline === true && "Before the deadline"}
        {completedBeforeDeadline === false && "After the deadline"}
        {completedBeforeDeadline === null && "Target crushed"}
      </strong>
      <span className="sacko-state-announcement" role="status" aria-live="polite">
        Challenge complete.
      </span>
    </div>
  );
}

export default function LiveStatus({ status, endAt, completedBeforeDeadline }) {
  const router = useRouter();
  const [millisecondsLeft, setMillisecondsLeft] = useState(null);
  const refreshedAtDeadline = useRef(false);

  useEffect(() => {
    if (status !== "active" || !endAt) {
      setMillisecondsLeft(null);
      return undefined;
    }

    const deadline = new Date(endAt).getTime();

    const updateCountdown = () => {
      const next = Math.max(0, deadline - Date.now());
      setMillisecondsLeft(next);

      if (next === 0 && !refreshedAtDeadline.current) {
        refreshedAtDeadline.current = true;
        router.refresh();
      }
    };

    updateCountdown();
    const countdownInterval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(countdownInterval);
  }, [endAt, router, status]);

  useEffect(() => {
    if (status !== "active") {
      return undefined;
    }

    const refreshInterval = window.setInterval(() => router.refresh(), 15_000);
    return () => window.clearInterval(refreshInterval);
  }, [router, status]);

  if (status === "complete") {
    return <CompletedStatus completedBeforeDeadline={completedBeforeDeadline} />;
  }

  if (status === "time-expired" || millisecondsLeft === 0) {
    return (
      <div className="sacko-live-status sacko-live-status-expired">
        <span className="sacko-live-label">Final status</span>
        <strong>Time expired</strong>
        <span className="sacko-state-announcement" role="status" aria-live="polite">
          Challenge time expired.
        </span>
      </div>
    );
  }

  if (status === "not-started") {
    return (
      <div className="sacko-live-status">
        <span className="sacko-live-label">Challenge status</span>
        <strong>Not started</strong>
        <span className="sacko-state-announcement" role="status" aria-live="polite">
          Challenge not started.
        </span>
      </div>
    );
  }

  const countdown =
    millisecondsLeft === null ? "--:--:--" : formatCountdown(millisecondsLeft);

  return (
    <div className="sacko-live-status">
      <span className="sacko-live-label">Time left</span>
      <span className="sacko-countdown" aria-label={`Time remaining ${countdown}`}>
        {countdown}
      </span>
    </div>
  );
}
