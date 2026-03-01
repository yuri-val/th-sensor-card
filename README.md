# TH Sensor Card

A compact, square Lovelace card for Home Assistant that displays temperature, humidity, and battery level in a single tile.

Scales cleanly at any size using CSS container queries — works equally well as a standalone card or placed inside `picture-elements` over a floorplan.

## Screenshots

| Dark | Light | Custom background |
|:---:|:---:|:---:|
| ![Dark theme](assets/dark.png) | ![Light theme](assets/light.png) | ![Custom background](assets/custom-bg.png) |

| Battery warning | Battery critical | picture-elements |
|:---:|:---:|:---:|
| ![Battery warning](assets/battery-warning.png) | ![Battery critical](assets/battery-critical.png) | ![picture-elements](assets/picture-elements.png) |

| Real example |
|:---:|
| ![Real example](assets/real-example.png) |
---

## Features

- Square tile with large temperature value as the primary focus
- Humidity and battery in a split bottom row
- Emoji backgrounds (🌡️ 💧 🔋) as subtle decorative watermarks
- Battery color thresholds — green / orange / red
- Click any section to open the entity history dialog
- Optional card title (`name`)
- Optional custom background color (`background`)
- `picture-elements` compatible — accepts `style` for absolute positioning
- Responds to HA dark/light theme via CSS variables

---

## Installation

### HACS (recommended)

1. Open HACS → **Frontend**
2. Click the three-dot menu → **Custom repositories**
3. Add this repository URL, category **Lovelace**
4. Find **TH Sensor Card** in the list and install it

### Manual

1. Copy `th-sensor-card.js` to `/config/www/`
2. Add the resource in **Settings → Dashboards → Resources**:

```yaml
url: /local/th-sensor-card.js
type: module
```

---

## Configuration

| Option        | Type     | Required | Description                                               |
|---------------|----------|----------|-----------------------------------------------------------|
| `temperature` | `string` | ✅        | Entity ID of the temperature sensor                       |
| `humidity`    | `string` | ✅        | Entity ID of the humidity sensor                          |
| `battery`     | `string` | ✅        | Entity ID of the battery sensor                           |
| `name`        | `string` |           | Optional card title shown at the top                     |
| `background`  | `string` |           | Custom CSS color for the card background                  |
| `style`       | `object` |           | CSS properties applied to the host element (picture-elements positioning) |

---

## Examples

### Standalone card

```yaml
type: custom:th-sensor-card
temperature: sensor.bedroom_temperature
humidity: sensor.bedroom_humidity
battery: sensor.bedroom_battery
name: Bedroom
```

### Custom background

```yaml
type: custom:th-sensor-card
temperature: sensor.bedroom_temperature
humidity: sensor.bedroom_humidity
battery: sensor.bedroom_battery
name: Bedroom
background: "#1a2744"
```

### Inside picture-elements (floorplan)

```yaml
type: picture-elements
image: /local/floorplan.png
elements:
  - type: custom:th-sensor-card
    temperature: sensor.bedroom_temperature
    humidity: sensor.bedroom_humidity
    battery: sensor.bedroom_battery
    name: Bedroom
    style:
      left: 42%
      top: 14%
      scale: 35%
```

---

## Temperature color thresholds

| Range      | Color   |
|------------|---------|
| < 0 °C     | 🔵 blue `#60a5fa` |
| 0 – 24 °C  | neutral (`--primary-text-color`) |
| 24 – 32 °C | 🟠 orange `#fb923c` |
| > 32 °C    | 🔴 red `#f87171` |

---

## Battery color thresholds

| Level      | Color   |
|------------|---------|
| > 30 %     | 🟢 green (`--success-color`) |
| 15 – 30 %  | 🟡 orange (`--warning-color`) |
| < 15 %     | 🔴 red (`--error-color`) |

---

## Development & preview

Open `preview.html` directly in a browser to test the card with mock data without needing a running Home Assistant instance. It includes:

- Live sliders for temperature, humidity, and battery
- Toggle for `unavailable` state
- Toggle for card name and custom background
- Dark / light theme switch

---

## License

MIT
