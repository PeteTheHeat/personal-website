"use client";

import { useState } from "react";
import { drinkMenus } from "./menu-data";

const menuOptions = Object.entries(drinkMenus);

function SegmentedControl({ activeMenu, onChange }) {
  return (
    <div className="ba-segmented-control" role="group" aria-label="Choose a drinks menu">
      <span
        className="ba-segmented-indicator"
        data-position={activeMenu === "alcoholic" ? "first" : "second"}
        aria-hidden="true"
      />
      {menuOptions.map(([key, menu]) => (
        <button
          type="button"
          key={key}
          className="ba-segmented-option"
          aria-pressed={activeMenu === key}
          onClick={() => onChange(key)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onChange(key);
            }
          }}
        >
          {menu.label}
        </button>
      ))}
    </div>
  );
}

function MenuSection({ section, index, menuKey }) {
  const sectionId = `ba-${menuKey}-section-${index + 1}`;

  return (
    <section className="ba-menu-section" aria-labelledby={sectionId}>
      <header className="ba-section-heading">
        <span aria-hidden="true">0{index + 1}</span>
        <h2 id={sectionId}>{section.title}</h2>
        <i aria-hidden="true" />
      </header>

      <div className="ba-drink-grid">
        {section.drinks.map((drink) => (
          <article
            className={`ba-drink${drink.description ? "" : " ba-drink--name-only"}`}
            key={drink.name}
          >
            <div className="ba-drink-heading">
              <h3>{drink.name}</h3>
              <span aria-hidden="true" />
            </div>
            {drink.description ? <p>{drink.description}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

export default function BarArganyMenu() {
  const [activeMenu, setActiveMenu] = useState("alcoholic");
  const menu = drinkMenus[activeMenu];

  return (
    <div className="ba-page">
      <div className="ba-shell">
        <div className="ba-topbar">
          <div className="ba-brand" aria-label="Bar Argany">
            <span className="ba-brand-mark" aria-hidden="true">
              BA
            </span>
            <span className="ba-brand-name">Bar Argany</span>
          </div>
          <SegmentedControl activeMenu={activeMenu} onChange={setActiveMenu} />
        </div>

        <header className="ba-masthead">
          <div className="ba-senyera" aria-hidden="true" />
          <p className="ba-kicker">
            <span>Begudes de la casa</span>
            <i aria-hidden="true" />
            <span>San Francisco</span>
          </p>

          <div className="ba-title-lockup">
            <h1>
              <span>Bar</span>
              <strong>Argany</strong>
            </h1>
            <div className="ba-sun-mark" aria-hidden="true">
              <span>A</span>
            </div>
          </div>

        </header>

        <main className="ba-menu-card">
          <div
            className="ba-menu-panel"
            key={activeMenu}
            aria-label={`${menu.label} drinks`}
            aria-live="polite"
          >
            {menu.sections.map((section, index) => (
              <MenuSection
                section={section}
                index={index}
                menuKey={activeMenu}
                key={section.title}
              />
            ))}
          </div>
        </main>

        <footer className="ba-footer">
          <div className="ba-footer-tile" aria-hidden="true">
            <span />
          </div>
          <p>
            <strong>Salut!</strong>
            <span>Fet a casa · Made at home</span>
          </p>
          <div className="ba-footer-tile" aria-hidden="true">
            <span />
          </div>
        </footer>
      </div>
    </div>
  );
}
