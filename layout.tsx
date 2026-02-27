:root { color-scheme: light; }
* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  background: #f7f9fc;
  color: #111827;
}

a { color: inherit; }
.container { max-width: 1200px; margin: 0 auto; padding: 28px; }

.card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 2px 10px rgba(17, 24, 39, 0.05);
}

.grid { display: grid; gap: 16px; }
.grid2 { grid-template-columns: 1.2fr 1fr; }
.grid3 { grid-template-columns: repeat(3, minmax(0,1fr)); }
@media (max-width: 1000px) { .grid2, .grid3 { grid-template-columns: 1fr; } }

.h1 { font-size: 24px; margin: 0 0 8px; }
.sub { color: #6b7280; margin: 0 0 14px; }

label { display: block; font-size: 13px; color: #374151; margin-bottom: 6px; }

input, select, button, textarea {
  width: 100%;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  background: #ffffff;
  color: #111827;
  padding: 8px 10px;
  font-size: 13px;
}

select:disabled, input:disabled { background: #f3f4f6; color: #6b7280; }

button {
  cursor: pointer;
  background: #2563eb;
  border: 1px solid #1d4ed8;
  color: #ffffff;
  font-weight: 600;
  padding: 9px 12px;
}
button:hover { background: #1d4ed8; }
button:disabled { opacity: 0.6; cursor: not-allowed; }

.row { display:flex; gap: 10px; align-items:center; }
.row > * { flex: 1; }

.pill {
  display:inline-block;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  font-size: 12px;
  color: #374151;
}

.table { width:100%; border-collapse: collapse; }
.table th, .table td { padding: 10px; border-bottom: 1px solid #e5e7eb; text-align:left; vertical-align: middle; }
.table th { color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: 0.02em; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

/* Tight per-category control inside the crop table */
.intentCell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.intentCell input[type="checkbox"]{
  width: 16px;
  height: 16px;
  margin: 0;
}

.intentCell select{
  width: 78px;
  padding: 6px 8px;
  font-size: 12px;
  border-radius: 10px;
}

/* Crop row cards (modern SaaS) */
.cropCard {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px;
}

.cropCardHeader {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
}

.cropHeaderLeft {
  display: grid;
  grid-template-columns: 1fr 160px;
  gap: 12px;
  width: 100%;
}

@media (max-width: 680px) {
  .cropHeaderLeft { grid-template-columns: 1fr; }
  .cropCardHeader { align-items: stretch; }
}

.acresWrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.acUnit {
  font-size: 12px;
  color: #6b7280;
  padding: 0 8px 0 0;
}

.cropHeaderRight { display: flex; gap: 10px; }

.dangerBtn {
  width: auto;
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 9px 12px;
}

.dangerBtn:hover { background: #fecaca; }

/* Intent chips */
.intentGrid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 920px) {
  .intentGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 520px) {
  .intentGrid { grid-template-columns: 1fr; }
}

.intentChip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
}

.intentChip.on {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.intentChipLeft {
  display: flex;
  align-items: center;
  gap: 10px;
  width: auto;
  margin: 0;
  font-weight: 600;
  color: #111827;
}

.intentChipLeft input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 0;
}

.intentChip select {
  width: 92px;
  padding: 6px 8px;
  font-size: 12px;
  border-radius: 10px;
}
