# Rajeswari Silver's — Jewellery Billing System

A professional, production-ready jewellery billing web application for gold & silver retail shops.

---

## ✨ Features

- **Dashboard** with daily gold/silver rate inputs
- **Dynamic invoice creation** with multiple items
- **Real-time calculations** — metal value, wastage, making charges
- **Professional A4 invoice** ready for print or PDF
- **Invoice history** with search by name or mobile
- **Local storage persistence** — invoices saved in the browser
- **Mobile responsive** design

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed ([Download here](https://nodejs.org))

### Installation & Run

```bash
# 1. Navigate to the project folder
cd RajeswariSilvers

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

The app will open at **http://localhost:3000** in your browser.

---

## 📦 Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder. You can deploy it to any static hosting (Netlify, Vercel, GitHub Pages, etc.)

---

## 💡 How to Use

### Step 1 — Set Today's Rates
On the Dashboard, enter:
- **Gold Rate** (₹ per gram)
- **Silver Rate** (₹ per gram)

These auto-fill into new invoices.

### Step 2 — Create Invoice
Click **"Create New Invoice"** and fill in:
- Customer name & mobile
- Add items (name, metal type, purity, weight, wastage %, making charges)

### Step 3 — Generate & Print
Click **"Generate Invoice"** to see the professional invoice preview.
Click **"Print / Save as PDF"** to print or download as PDF.

---

## 🧮 Pricing Formula

```
Metal Value    = Weight (g)  ×  Rate (₹/g)
Wastage Amount = Metal Value × (Wastage % / 100)
Item Total     = Metal Value + Wastage + Making Charges
Grand Total    = Sum of all Item Totals
```

---

## 📁 Project Structure

```
RajeswariSilvers/
├── index.html          ← App entry HTML
├── package.json        ← Dependencies & scripts
├── vite.config.js      ← Vite configuration
└── src/
    ├── main.jsx        ← React root mount
    ├── index.css       ← Global reset
    └── App.jsx         ← Complete application (all components)
```

---

## 🛠 Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18  | UI framework |
| Vite 5    | Build tool & dev server |
| CSS-in-JS | Custom gold-themed styling |
| localStorage | Invoice persistence |
| Intl API  | Indian currency formatting |
| window.print() | Print / PDF generation |

---

## 📖 Component Overview

| Component | Description |
|-----------|-------------|
| `App` | Root component, manages screens & state |
| `Header` | Sticky top bar with shop name |
| `Dashboard` | Rate inputs, stats, invoice history |
| `BillingForm` | Customer + dynamic item entry |
| `InvoiceView` | Print-ready A4 invoice |

---

## 🖨 Printing as PDF

1. Open any invoice
2. Click **"Print / Save as PDF"**
3. In the print dialog, select **"Save as PDF"** as the destination
4. Page size: A4 Portrait

---

## 💾 Data Storage

All invoices are stored in **browser localStorage** under the key `rs_invoices`. This means:
- Data is saved between sessions on the same device/browser
- Data does NOT sync between devices
- Clearing browser data will erase invoices

For production use, consider connecting to a backend (Node.js + MongoDB recommended).

---

*Built with ♥ for Rajeswari Silver's*
