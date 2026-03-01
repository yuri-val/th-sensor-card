class ThSensorCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  // ─── HA lifecycle ────────────────────────────────────────────────────────────

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  setConfig(config) {
    if (!config.temperature) throw new Error('[th-sensor-card] "temperature" entity is required');
    if (!config.humidity)    throw new Error('[th-sensor-card] "humidity" entity is required');
    if (!config.battery)     throw new Error('[th-sensor-card] "battery" entity is required');
    this._config = config;

    // ── picture-elements support ─────────────────────────────────────────────
    // Apply style from config to host element (picture-elements positioning).
    // Also set a default width — without it, an absolutely-positioned host
    // has no intrinsic size and the inner div collapses to 0.
    if (config.style) {
      Object.entries(config.style).forEach(([prop, val]) => {
        this.style[prop] = val;
      });
      if (!config.style.width) {
        this.style.width = '150px'; // override via style: { width: '200px' }
      }
    }

    this._render();
  }

  getCardSize() {
    return 3;
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  _getState(entityId) {
    const state = this._hass?.states[entityId];
    if (!state || state.state === 'unavailable' || state.state === 'unknown') return null;
    return state.state;
  }

  _fireMoreInfo(entityId) {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles:  true,
      composed: true,
      detail:   { entityId },
    }));
  }

  _batteryColor(raw) {
    if (raw === null) return 'var(--primary-text-color)';
    const v = parseInt(raw, 10);
    if (v < 15) return 'var(--error-color,   #F44336)';
    if (v < 30) return 'var(--warning-color, #FF9800)';
    return 'var(--success-color, #4CAF50)';
  }

  _tempColor(raw) {
    if (raw === null) return 'var(--primary-text-color)';
    const v = parseFloat(raw);
    if (v <  0)  return '#60a5fa';  // cold  — blue
    if (v < 24)  return 'var(--primary-text-color)';  // comfortable — neutral
    if (v < 32)  return '#fb923c';  // warm  — orange
    return '#f87171';               // hot   — red
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  _render() {
    if (!this._hass || !this._config) return;

    const tRaw = this._getState(this._config.temperature);
    const hRaw = this._getState(this._config.humidity);
    const bRaw = this._getState(this._config.battery);

    const temp   = tRaw !== null ? parseFloat(tRaw).toFixed(1) : '--';
    const hum    = hRaw !== null ? parseFloat(hRaw).toFixed(1) : '--';
    const bat    = bRaw !== null ? `${parseInt(bRaw, 10)}%`    : '--';
    const tempClr = this._tempColor(tRaw);
    const batClr  = this._batteryColor(bRaw);

    const name = this._config.name;
    const bg   = this._config.background;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        /*
         * Plain div instead of <ha-card> — avoids custom-element dependency
         * inside shadow DOM (which breaks rendering in picture-elements).
         * Uses the same HA CSS variables so it looks identical to ha-card.
         */
        .card {
          width: 100%;
          aspect-ratio: 1;
          overflow: hidden;
          container-type: size;
          border-radius: var(--ha-card-border-radius, 12px);
          background: ${bg || 'var(--ha-card-background, var(--card-background-color))'};
          box-shadow: var(--ha-card-box-shadow, none);
          border: 1px solid var(--divider-color, rgba(128,128,128,0.2));
        }

        /* ── Layout ─────────────────────────────────────────────────────────── */
        .wrap {
          height: 100%;
          display: flex;
          flex-direction: column;
          /* no padding here — each section handles its own horizontal padding
             so that dividers can span edge-to-edge without hacks             */
        }

        /* ── Name ───────────────────────────────────────────────────────────── */
        .name {
          padding: 5cqw 5cqw 0;
          font-size: 9cqw;
          font-weight: 400;
          color: var(--secondary-text-color);
          line-height: 1.1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── Temperature ─────────────────────────────────────────────────────── */
        .temp {
          flex: 1;
          padding: 0 5cqw;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1cqw;
        }
        .temp-val {
          font-size: 40cqw;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.02em;
          color: ${tempClr};
        }
        .temp-unit {
          font-size: 10cqw;
          color: var(--secondary-text-color);
          align-self: flex-start;
          padding-top: 3.5cqw;
          line-height: 1;
        }

        /* ── Dividers ────────────────────────────────────────────────────────── */
        .divider-h {
          /* spans full card width — no horizontal padding on .wrap */
          height: 1px;
          background: var(--divider-color, rgba(128,128,128,0.2));
          flex-shrink: 0;
        }
        .divider-v {
          width: 1px;
          height: 14cqw;          /* ~55% of .bottom height, centred by flexbox */
          background: var(--divider-color, rgba(128,128,128,0.2));
          flex-shrink: 0;
        }

        /* ── Bottom row ──────────────────────────────────────────────────────── */
        .bottom {
          display: flex;
          align-items: center;
          height: 36cqw;
          flex-shrink: 0;
        }
        .hum {
          flex: 60;
          padding: 0 4cqw;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }
        .bat {
          flex: 40;
          padding: 0 4cqw;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        /* ── Emoji backgrounds ───────────────────────────────────────────────── */
        .temp, .hum, .bat {
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .temp:hover, .hum:hover, .bat:hover {
          background: var(--divider-color, rgba(128,128,128,0.08));
        }
        .temp::before,
        .hum::before,
        .bat::before {
          position: absolute;
          opacity: 0.25;
          line-height: 1;
          pointer-events: none;
          z-index: 0;
        }
        .temp::before {
          content: '🌡️';
          font-size: 54cqw;
          top: 50%;
          right: -1cqw;
          transform: translateY(-50%);
        }
        .hum::before {
          content: '💧';
          font-size: 28cqw;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        .bat::before {
          content: '🔋';
          font-size: 24cqw;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        /* Keep text above the emoji background */
        .temp > *, .hum > *, .bat > * {
          position: relative;
          z-index: 1;
        }

        /* ── Values ──────────────────────────────────────────────────────────── */
        .hum-val { font-size: 17cqw; font-weight: 800; color: var(--primary-text-color); }
        .bat-val { font-size: 15cqw; font-weight: 800; color: ${batClr}; }
      </style>

      <div class="card">
        <div class="wrap">
          ${name ? `<div class="name">${name}</div>` : ''}

          <div class="temp">
            <span class="temp-val">${temp}</span>
            <span class="temp-unit">°C</span>
          </div>

          <div class="divider-h"></div>

          <div class="bottom">
            <div class="hum">
              <span class="hum-val">${hum}%</span>
            </div>
            <div class="divider-v"></div>
            <div class="bat">
              <span class="bat-val">${bat}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const sr = this.shadowRoot;
    sr.querySelector('.temp').addEventListener('click', () => this._fireMoreInfo(this._config.temperature));
    sr.querySelector('.hum') .addEventListener('click', () => this._fireMoreInfo(this._config.humidity));
    sr.querySelector('.bat') .addEventListener('click', () => this._fireMoreInfo(this._config.battery));
  }
}

customElements.define('th-sensor-card', ThSensorCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type:        'th-sensor-card',
  name:        'TH Sensor Card',
  description: 'Compact temperature, humidity & battery card',
});
