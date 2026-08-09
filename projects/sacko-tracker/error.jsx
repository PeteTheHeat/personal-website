"use client";

import "./sacko.css";

export default function SackoTrackerError({ reset }) {
  return (
    <main className="sacko-page sacko-error-page">
      <section className="sacko-error-card" role="alert" aria-labelledby="sacko-error-title">
        <p>The official Sacko challenge</p>
        <h1 id="sacko-error-title">Tracker taking a breather</h1>
        <p>
          Dave&rsquo;s score could not be loaded right now. Try the tracker again in a
          moment.
        </p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}
