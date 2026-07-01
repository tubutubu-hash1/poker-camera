const http = require("http");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 3000);
const rooms = new Map();
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;

const html = String.raw`<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Poker Camera Pair</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #10231d;
      --panel: #172f27;
      --panel-2: #203a31;
      --text: #eef7f2;
      --muted: #a8bbb2;
      --line: #3c5b50;
      --accent: #f2c14e;
      --danger: #ff776e;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      background: radial-gradient(circle at 50% 0%, #1f4b3d 0, var(--bg) 44rem);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main {
      width: min(1120px, calc(100vw - 28px));
      margin: 0 auto;
      padding: 22px 0 34px;
    }
    h1 { margin: 0 0 14px; font-size: clamp(30px, 5vw, 50px); }
    section {
      background: color-mix(in srgb, var(--panel) 92%, black);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 14px;
    }
    .role-grid, .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    button, select, input {
      width: 100%;
      border-radius: 7px;
      border: 1px solid var(--line);
      background: var(--panel-2);
      color: var(--text);
      padding: 11px 10px;
      font: inherit;
      min-height: 44px;
    }
    button { cursor: pointer; font-weight: 800; }
    button.primary {
      background: var(--accent);
      border-color: var(--accent);
      color: #201800;
    }
    .code {
      font-size: clamp(42px, 10vw, 90px);
      font-weight: 900;
      letter-spacing: .08em;
      text-align: center;
      padding: 14px;
      border-radius: 8px;
      background: rgba(0,0,0,.2);
      border: 1px solid rgba(255,255,255,.1);
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(5, minmax(64px, 1fr));
      gap: 10px;
      margin: 12px 0;
    }
    .card {
      aspect-ratio: 5 / 7;
      border-radius: 8px;
      border: 2px solid #e8efe9;
      background: #f8fbf8;
      color: #101613;
      display: grid;
      place-items: center;
      font-size: clamp(28px, 6vw, 58px);
      font-weight: 900;
      box-shadow: 0 10px 20px rgba(0,0,0,.22);
    }
    .card.empty {
      background: rgba(255,255,255,.06);
      color: rgba(255,255,255,.32);
      border-color: rgba(255,255,255,.22);
      box-shadow: none;
