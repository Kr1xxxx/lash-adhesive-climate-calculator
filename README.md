# Lash Adhesive Climate Calculator

A free room-temperature and relative-humidity reference tool for professional lash artists, created by [COMELYLASH](https://comelylash.com/).

**Use the live calculator:** [comelylash.com/pages/lash-adhesive-climate-calculator](https://comelylash.com/pages/lash-adhesive-climate-calculator)

## What it does

The calculator helps lash artists compare actual room readings with the verified COMELYLASH All-Climate Lash Adhesive working range.

- Celsius control: 10–35°C in 1°C increments
- Fahrenheit control: 50–95°F in 1°F increments
- Relative humidity: 10%–90% RH
- Adhesive setting-time options: 0.3s and 0.5s
- Direct numeric temperature entry
- Accessible live results and responsive mobile layout

The result has three levels:

1. **Balanced conditions** — both readings are inside the standard reference range.
2. **Within the all-climate range** — both readings are inside the verified wider range, but at least one is outside the standard reference zone.
3. **Outside the recommended range** — at least one reading is outside the verified working range.

## Reference ranges

The tool uses the current COMELYLASH All-Climate Lash Adhesive specifications:

- Verified working range: **18–28°C / 25%–75% RH**
- Standard reference range: **23–27°C / 45%–55% RH**

This tool provides working guidance, not a performance guarantee. Always follow the adhesive label and measure conditions near the lash bed with a digital hygrometer.

## Privacy

The calculator runs entirely in the browser. It does not use cookies, local storage, analytics events, accounts, uploads, or server-side calculations.

## Run locally

Open index.html directly, or start a simple local server:

    python3 -m http.server 8000

After the command starts, open `http://localhost:8000` in a browser on the same computer. This address is only for a local preview; use the live COMELYLASH calculator link above for the public tool.

## Test

The calculator has no runtime dependencies.

    npm test

## Project files

- index.html — standalone accessible page
- styles.css — responsive presentation
- calculator.js — calculation logic and browser behavior
- calculator.test.mjs — Node test suite

© COMELYLASH. All rights reserved.
