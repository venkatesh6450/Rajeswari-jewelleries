// ╔══════════════════════════════════════════════════════════╗
// ║       Rajeswari Silver's — Jewellery Billing System      ║
// ║       Gold & Silver Retail Billing · No GST              ║
// ╚══════════════════════════════════════════════════════════╝

import { useState, useEffect } from "react";

// ─── UTILITIES ────────────────────────────────────────────────────
const genId = () => Math.random().toString(36).slice(2, 11);
const genInvNo = () => {
  const d = new Date();
  return `RS${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`;
};
const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const fmtDate = (d = new Date()) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const calcItem = ({ weight, rate, wastage, making }) => {
  const w = parseFloat(weight) || 0;
  const r = parseFloat(rate) || 0;
  const wp = parseFloat(wastage) || 0;
  const mc = parseFloat(making) || 0;
  const metalVal = w * r;
  const wastageAmt = metalVal * (wp / 100);
  const total = metalVal + wastageAmt + mc;
  return { metalVal, wastageAmt, total };
};

const freshItem = (gRate, sRate) => ({
  id: genId(),
  name: "",
  metal: "Gold",
  purity: "22K",
  weight: "",
  rate: gRate,
  wastage: "",
  making: "",
});

const loadData = () => {
  try { return JSON.parse(localStorage.getItem("rs_invoices") || "[]"); }
  catch { return []; }
};

// ─── GLOBAL CSS ───────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'DM Sans', system-ui, sans-serif; background: #FEF9F2; color: #2C1810; }
.sf { font-family: 'Cormorant Garamond', Georgia, serif !important; }

.gold-btn {
  background: linear-gradient(135deg, #D4AF37 0%, #9E7B0E 100%);
  color: white; border: none; cursor: pointer; border-radius: 10px;
  font-weight: 500; transition: all .2s;
  display: inline-flex; align-items: center; gap: 8px;
  font-family: 'DM Sans', sans-serif;
}
.gold-btn:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(212,175,55,.35); }
.gold-btn:active { transform: translateY(0); }
.gold-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }

.sec-btn {
  background: white; border: 1.5px solid #D4AF37; color: #9E7B0E;
  border-radius: 10px; cursor: pointer; font-weight: 500;
  transition: all .2s; font-family: 'DM Sans', sans-serif;
}
.sec-btn:hover { background: rgba(212,175,55,.08); }

.ghost-btn {
  background: transparent; border: 1.5px solid rgba(212,175,55,.3);
  color: #D4AF37; border-radius: 8px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; transition: all .2s;
}
.ghost-btn:hover { background: rgba(212,175,55,.1); }

.inp {
  width: 100%; padding: 9px 12px;
  border: 1.5px solid #E8DCC8; border-radius: 8px;
  background: white; font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: #2C1810; outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.inp:focus { border-color: #D4AF37; box-shadow: 0 0 0 3px rgba(212,175,55,.12); }
.inp::placeholder { color: #C8B88A; }

.card {
  background: white; border: 1px solid rgba(212,175,55,.2);
  border-radius: 16px; box-shadow: 0 2px 16px rgba(0,0,0,.05);
}

.item-row:hover { background: rgba(212,175,55,.04) !important; }
.inv-row-alt { background: rgba(254,249,242,.7) !important; }

@keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
.fade-up { animation: fadeUp .35s ease forwards; }
.fade-up-2 { animation: fadeUp .35s ease .08s both; }
.fade-up-3 { animation: fadeUp .35s ease .16s both; }

::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 4px; }
::-webkit-scrollbar-track { background: transparent; }

@media (max-width: 600px) {
  .hide-mobile { display: none !important; }
  .full-mobile { width: 100% !important; }
}

/* ── PRINT STYLES ──────────────────────────────────── */
@media print {
  .no-print { display: none !important; }
  body { background: white !important; }
  .invoice-wrap {
    box-shadow: none !important; border: none !important;
    border-radius: 0 !important; max-width: 100% !important; margin: 0 !important;
  }
  @page { size: A4 portrait; margin: 12mm 15mm; }
}
`;

// ─── HEADER ───────────────────────────────────────────────────────
function Header({ screen, onBack, subtitle }) {
  return (
    <header
      style={{
        background: "linear-gradient(135deg,#1A0F0A 0%,#2C1810 100%)",
        padding: "16px 24px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
        position: "sticky",
        top: 0,
        zIndex: 100,
        boxShadow: "0 4px 24px rgba(0,0,0,.28)",
      }}
    >
      {onBack && (
        <button
          onClick={onBack}
          className="ghost-btn"
          style={{ padding: "6px 14px", fontSize: 13, whiteSpace: "nowrap" }}
        >
          ← Back
        </button>
      )}
      <div style={{ flex: 1 }}>
        <h1
          className="sf"
          style={{
            color: "#D4AF37",
            fontSize: onBack ? 20 : 26,
            fontWeight: 600,
            letterSpacing: "0.5px",
            lineHeight: 1.2,
          }}
        >
          Rajeswari Silver's
        </h1>
        {subtitle && (
          <p style={{ color: "rgba(212,175,55,.55)", fontSize: 12, marginTop: 2 }}>
            {subtitle}
          </p>
        )}
      </div>
      <div
        style={{
          textAlign: "right",
          background: "rgba(212,175,55,.1)",
          borderRadius: 8,
          padding: "6px 12px",
        }}
      >
        <p style={{ color: "#D4AF37", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase" }}>
          Gold &amp; Silver
        </p>
        <p style={{ color: "rgba(212,175,55,.5)", fontSize: 10 }}>Jewellery</p>
      </div>
    </header>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────
function Dashboard({ goldRate, setGoldRate, silverRate, setSilverRate, onCreate, invoices, onView }) {
  const [search, setSearch] = useState("");

  const filtered = search
    ? invoices.filter(
        (i) =>
          i.customer.mobile.includes(search) ||
          i.customer.name.toLowerCase().includes(search.toLowerCase()) ||
          i.invoiceNo.toLowerCase().includes(search.toLowerCase())
      )
    : invoices.slice(0, 30);

  const totalSales = invoices.reduce((s, inv) =>
    s + inv.items.reduce((ss, item) => ss + calcItem(item).total, 0), 0);

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 16px" }}>
      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 12,
          marginBottom: 20,
        }}
        className="fade-up"
      >
        {[
          { label: "Total Invoices", value: invoices.length, icon: "📄", color: "#D4AF37" },
          {
            label: "Today's Bills",
            value: invoices.filter((i) => i.date === fmtDate()).length,
            icon: "📅",
            color: "#A0A0B8",
          },
          { label: "Total Sales (₹)", value: `₹${fmtINR(totalSales)}`, icon: "💰", color: "#6BAA75" },
        ].map((s) => (
          <div
            key={s.label}
            className="card"
            style={{ padding: "16px 18px", textAlign: "center" }}
          >
            <p style={{ fontSize: 22 }}>{s.icon}</p>
            <p style={{ fontWeight: 700, fontSize: 18, color: "#2C1810", marginTop: 4 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 11, color: "#9E7B0E", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Rate Setup + Create */}
      <div className="card fade-up-2" style={{ padding: "28px", marginBottom: 20 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 className="sf" style={{ fontSize: 23, color: "#2C1810", fontWeight: 600 }}>
            Today's Metal Rates
          </h2>
          <p style={{ color: "#9E7B0E", fontSize: 13, marginTop: 4 }}>
            Set daily rates · They auto-fill in all new invoices
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Gold */}
          <div
            style={{
              background: "linear-gradient(135deg,#FFFBEF,#FFF3C4)",
              border: "1.5px solid #D4AF37",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#D4AF37,#9E7B0E)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: "0 3px 10px rgba(212,175,55,.4)",
                }}
              >
                G
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#2C1810" }}>Gold Rate</p>
                <p style={{ fontSize: 11, color: "#9E7B0E" }}>per gram (₹)</p>
              </div>
            </div>
            <input
              className="inp"
              type="number"
              value={goldRate}
              onChange={(e) => setGoldRate(e.target.value)}
              placeholder="e.g. 7500"
              style={{ fontSize: 20, fontWeight: 700, textAlign: "right", borderColor: "#D4AF37" }}
            />
          </div>

          {/* Silver */}
          <div
            style={{
              background: "linear-gradient(135deg,#F5F5FA,#EBEBF5)",
              border: "1.5px solid #A8A8C0",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#A8A8C0,#6868A0)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: "0 3px 10px rgba(168,168,192,.4)",
                }}
              >
                S
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#2C1810" }}>Silver Rate</p>
                <p style={{ fontSize: 11, color: "#6868A0" }}>per gram (₹)</p>
              </div>
            </div>
            <input
              className="inp"
              type="number"
              value={silverRate}
              onChange={(e) => setSilverRate(e.target.value)}
              placeholder="e.g. 90"
              style={{ fontSize: 20, fontWeight: 700, textAlign: "right", borderColor: "#A8A8C0" }}
            />
          </div>
        </div>

        <button
          className="gold-btn"
          onClick={onCreate}
          style={{ width: "100%", padding: "15px", fontSize: 16, justifyContent: "center", borderRadius: 12 }}
        >
          <span style={{ fontSize: 22, lineHeight: 1 }}>+</span> Create New Invoice
        </button>
      </div>

      {/* History */}
      <div className="card fade-up-3" style={{ padding: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <h2 className="sf" style={{ fontSize: 21, color: "#2C1810", fontWeight: 600 }}>
            Invoice History
          </h2>
          <span
            style={{
              background: "rgba(212,175,55,.12)",
              color: "#9E7B0E",
              padding: "4px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {invoices.length} records
          </span>
        </div>

        <input
          className="inp"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍  Search by name, mobile or invoice number..."
          style={{ marginBottom: 16 }}
        />

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#C8B88A" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
            <p style={{ fontWeight: 500 }}>{search ? "No invoices found" : "No invoices yet"}</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>
              {search ? "Try a different search" : "Create your first invoice above"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map((inv) => {
              const total = inv.items.reduce((s, item) => s + calcItem(item).total, 0);
              return (
                <div
                  key={inv.id}
                  onClick={() => onView(inv)}
                  style={{
                    padding: "14px 18px",
                    border: "1px solid #F0E8D8",
                    borderRadius: 10,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all .18s",
                    background: "white",
                    gap: 12,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#D4AF37";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(212,175,55,.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#F0E8D8";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#FEF0C8,#D4AF37)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#7A5200",
                      flexShrink: 0,
                    }}
                  >
                    {(inv.customer.name || "W").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: "#2C1810" }}>
                      {inv.customer.name || "Walk-in Customer"}
                    </p>
                    <p style={{ fontSize: 12, color: "#9E7B0E", marginTop: 2 }}>
                      #{inv.invoiceNo} · {inv.customer.mobile || "—"} · {inv.date}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 16, color: "#2C1810" }}>
                      ₹{fmtINR(total)}
                    </p>
                    <p style={{ fontSize: 11, color: "#C8B88A", marginTop: 2 }}>
                      {inv.items.length} item{inv.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BILLING FORM ─────────────────────────────────────────────────
function BillingForm({ bill, goldRate, silverRate, onBack, onSave }) {
  const [customer, setCustomer] = useState(bill.customer);
  const [items, setItems] = useState(bill.items);

  const setCust = (k, v) => setCustomer((p) => ({ ...p, [k]: v }));

  const addItem = () => setItems((p) => [...p, freshItem(goldRate, silverRate)]);

  const removeItem = (id) => setItems((p) => p.filter((i) => i.id !== id));

  const updateItem = (id, key, val) => {
    setItems((p) =>
      p.map((i) => {
        if (i.id !== id) return i;
        const u = { ...i, [key]: val };
        if (key === "metal") u.rate = val === "Gold" ? goldRate : silverRate;
        return u;
      })
    );
  };

  const totals = items.reduce(
    (acc, item) => {
      const { metalVal, wastageAmt, total } = calcItem(item);
      return {
        metalVal: acc.metalVal + metalVal,
        wastageAmt: acc.wastageAmt + wastageAmt,
        making: acc.making + (parseFloat(item.making) || 0),
        total: acc.total + total,
      };
    },
    { metalVal: 0, wastageAmt: 0, making: 0, total: 0 }
  );

  const handleSave = () => {
    if (!customer.name.trim()) {
      alert("Please enter the customer name to proceed.");
      return;
    }
    onSave({ ...bill, customer, items, goldRate, silverRate });
  };

  const inputStyle = { padding: "7px 8px", fontSize: 13 };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>
      {/* Customer */}
      <div className="card fade-up" style={{ padding: "24px", marginBottom: 16 }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#2C1810",
            marginBottom: 18,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            style={{
              width: 26,
              height: 26,
              background: "linear-gradient(135deg,#D4AF37,#9E7B0E)",
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            1
          </span>
          Customer Details
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label
              style={{ display: "block", fontSize: 12, color: "#9E7B0E", fontWeight: 500, marginBottom: 6 }}
            >
              Customer Name *
            </label>
            <input
              className="inp"
              type="text"
              value={customer.name}
              onChange={(e) => setCust("name", e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label
              style={{ display: "block", fontSize: 12, color: "#9E7B0E", fontWeight: 500, marginBottom: 6 }}
            >
              Mobile Number
            </label>
            <input
              className="inp"
              type="tel"
              value={customer.mobile}
              onChange={(e) => setCust("mobile", e.target.value)}
              placeholder="10-digit mobile"
              maxLength={10}
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card fade-up-2" style={{ padding: "24px", marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#2C1810",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                background: "linear-gradient(135deg,#D4AF37,#9E7B0E)",
                borderRadius: "50%",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              2
            </span>
            Item Details
            <span
              style={{
                background: "rgba(212,175,55,.15)",
                color: "#9E7B0E",
                padding: "2px 10px",
                borderRadius: 12,
                fontSize: 12,
              }}
            >
              {items.length} item{items.length > 1 ? "s" : ""}
            </span>
          </h3>
          <button className="sec-btn" onClick={addItem} style={{ padding: "8px 18px", fontSize: 13 }}>
            + Add Item
          </button>
        </div>

        <div style={{ overflowX: "auto", marginBottom: 20 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
            <thead>
              <tr style={{ background: "linear-gradient(135deg,#1A0F0A,#2C1810)" }}>
                {[
                  ["Item Name", "left", 130],
                  ["Metal", "left", 80],
                  ["Purity", "left", 75],
                  ["Weight (g)", "right", 90],
                  ["Rate (₹/g)", "right", 100],
                  ["Wastage %", "right", 85],
                  ["Making (₹)", "right", 100],
                  ["Item Total", "right", 110],
                  ["", "center", 40],
                ].map(([h, align, w]) => (
                  <th
                    key={h}
                    style={{
                      padding: "11px 10px",
                      color: "#D4AF37",
                      fontSize: 11,
                      fontWeight: 600,
                      textAlign: align,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      minWidth: w,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const { metalVal, wastageAmt, total } = calcItem(item);
                const w = parseFloat(item.weight) || 0;
                return (
                  <tr
                    key={item.id}
                    className="item-row"
                    style={{ borderBottom: "1px solid #F5EDD8", background: "white" }}
                  >
                    <td style={{ padding: "7px 8px" }}>
                      <input
                        className="inp"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, "name", e.target.value)}
                        placeholder="e.g. Necklace"
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ padding: "7px 8px" }}>
                      <select
                        className="inp"
                        value={item.metal}
                        onChange={(e) => updateItem(item.id, "metal", e.target.value)}
                        style={inputStyle}
                      >
                        <option>Gold</option>
                        <option>Silver</option>
                      </select>
                    </td>
                    <td style={{ padding: "7px 8px" }}>
                      <select
                        className="inp"
                        value={item.purity}
                        onChange={(e) => updateItem(item.id, "purity", e.target.value)}
                        style={inputStyle}
                      >
                        <option>22K</option>
                        <option>24K</option>
                        <option>18K</option>
                        <option>916</option>
                        <option>999</option>
                        <option>925</option>
                        <option>Coin</option>
                        <option>Biscuit</option>
                      </select>
                    </td>
                    <td style={{ padding: "7px 8px" }}>
                      <input
                        className="inp"
                        type="number"
                        value={item.weight}
                        onChange={(e) => updateItem(item.id, "weight", e.target.value)}
                        placeholder="0.000"
                        style={{ ...inputStyle, textAlign: "right" }}
                        step="0.001"
                        min="0"
                      />
                    </td>
                    <td style={{ padding: "7px 8px" }}>
                      <input
                        className="inp"
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, "rate", e.target.value)}
                        placeholder="0.00"
                        style={{ ...inputStyle, textAlign: "right" }}
                        min="0"
                      />
                    </td>
                    <td style={{ padding: "7px 8px" }}>
                      <input
                        className="inp"
                        type="number"
                        value={item.wastage}
                        onChange={(e) => updateItem(item.id, "wastage", e.target.value)}
                        placeholder="0"
                        style={{ ...inputStyle, textAlign: "right" }}
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </td>
                    <td style={{ padding: "7px 8px" }}>
                      <input
                        className="inp"
                        type="number"
                        value={item.making}
                        onChange={(e) => updateItem(item.id, "making", e.target.value)}
                        placeholder="0.00"
                        style={{ ...inputStyle, textAlign: "right" }}
                        min="0"
                      />
                    </td>
                    <td style={{ padding: "7px 12px", textAlign: "right" }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "#2C1810", whiteSpace: "nowrap" }}>
                        ₹{fmtINR(total)}
                      </p>
                      {w > 0 && (
                        <p style={{ fontSize: 10, color: "#C8B88A", marginTop: 2, whiteSpace: "nowrap" }}>
                          M: ₹{fmtINR(metalVal)}
                        </p>
                      )}
                    </td>
                    <td style={{ padding: "7px 6px", textAlign: "center" }}>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: "rgba(220,53,69,.1)",
                            border: "none",
                            color: "#DC3545",
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            cursor: "pointer",
                            fontSize: 18,
                            lineHeight: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Running Total */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              background: "linear-gradient(135deg,#FFFBEF,#FFF3C4)",
              border: "1.5px solid rgba(212,175,55,.4)",
              borderRadius: 12,
              padding: "20px 24px",
              minWidth: 290,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "#9E7B0E",
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Summary
            </p>
            {[
              ["Metal Value", totals.metalVal],
              ["Wastage Amount", totals.wastageAmt],
              ["Making Charges", totals.making],
            ].map(([label, val]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  fontSize: 13,
                  color: "#6B4C2A",
                }}
              >
                <span>{label}</span>
                <span>₹{fmtINR(val)}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: "2px solid #D4AF37",
                paddingTop: 12,
                marginTop: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span className="sf" style={{ fontSize: 20, fontWeight: 700, color: "#2C1810" }}>
                Grand Total
              </span>
              <span style={{ fontSize: 22, fontWeight: 700, color: "#2C1810" }}>
                ₹{fmtINR(totals.total)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
        <button className="sec-btn" onClick={onBack} style={{ padding: "12px 28px", fontSize: 14 }}>
          Cancel
        </button>
        <button
          className="gold-btn"
          onClick={handleSave}
          style={{ padding: "12px 36px", fontSize: 15, justifyContent: "center" }}
        >
          Generate Invoice →
        </button>
      </div>
    </div>
  );
}

// ─── INVOICE VIEW ─────────────────────────────────────────────────
function InvoiceView({ bill, onBack, onNew }) {
  const totals = bill.items.reduce(
    (acc, item) => {
      const { metalVal, wastageAmt, total } = calcItem(item);
      return {
        metalVal: acc.metalVal + metalVal,
        wastageAmt: acc.wastageAmt + wastageAmt,
        making: acc.making + (parseFloat(item.making) || 0),
        total: acc.total + total,
      };
    },
    { metalVal: 0, wastageAmt: 0, making: 0, total: 0 }
  );

  return (
    <div>
      {/* Toolbar */}
      <div
        className="no-print"
        style={{
          background: "white",
          borderBottom: "1px solid #F0E8D8",
          padding: "12px 24px",
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="sec-btn" onClick={onBack} style={{ padding: "9px 20px", fontSize: 13 }}>
            ← Dashboard
          </button>
          <button className="sec-btn" onClick={onNew} style={{ padding: "9px 20px", fontSize: 13 }}>
            + New Invoice
          </button>
        </div>
        <button
          className="gold-btn"
          onClick={() => window.print()}
          style={{ padding: "10px 28px", fontSize: 14, justifyContent: "center" }}
        >
          🖨&nbsp; Print / Save as PDF
        </button>
      </div>

      {/* Invoice Paper */}
      <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px 60px" }}>
        <div
          className="card invoice-wrap fade-up"
          style={{ overflow: "hidden", borderRadius: 16, padding: 0 }}
        >
          {/* ── INVOICE HEADER ── */}
          <div
            style={{
              background: "linear-gradient(135deg,#1A0F0A 0%,#2C1810 70%,#3D1F10 100%)",
              padding: "30px 36px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative rings */}
            {[["-40px", "-40px", 120], [null, "-30px", 90, null, "-30px"], [null, null, null, "-15px", "60px"]].map(
              (_, i) => null
            )}
            <div
              style={{
                position: "absolute",
                top: -40,
                right: -40,
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: "1px solid rgba(212,175,55,.2)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -20,
                left: -20,
                width: 90,
                height: 90,
                borderRadius: "50%",
                border: "1px solid rgba(212,175,55,.15)",
              }}
            />
            <div style={{ position: "relative" }}>
              <h1
                className="sf"
                style={{
                  fontSize: 40,
                  color: "#D4AF37",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  marginBottom: 6,
                }}
              >
                Rajeswari Silver's
              </h1>
              <p
                style={{
                  color: "rgba(212,175,55,.65)",
                  fontSize: 12,
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                Gold &nbsp;·&nbsp; Silver Jewellery &nbsp;·&nbsp; Coins &amp; Biscuits
              </p>
              <div
                style={{
                  height: 1,
                  background:
                    "linear-gradient(to right,transparent,rgba(212,175,55,.5),transparent)",
                  marginBottom: 10,
                }}
              />
              <p style={{ color: "rgba(212,175,55,.4)", fontSize: 11 }}>Retail Billing Invoice</p>
            </div>
          </div>

          {/* ── META ── */}
          <div
            style={{
              background: "#FEF9F2",
              padding: "20px 32px",
              borderBottom: "1px solid #F0E8D8",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 11,
                  color: "#9E7B0E",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Invoice To
              </p>
              <p style={{ fontWeight: 700, fontSize: 20, color: "#2C1810" }}>
                {bill.customer.name || "Walk-in Customer"}
              </p>
              {bill.customer.mobile && (
                <p style={{ fontSize: 13, color: "#6B4C2A", marginTop: 4 }}>
                  Mobile: {bill.customer.mobile}
                </p>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: 11,
                  color: "#9E7B0E",
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                Invoice Details
              </p>
              <p style={{ fontWeight: 700, fontSize: 20, color: "#2C1810" }}>#{bill.invoiceNo}</p>
              <p style={{ fontSize: 13, color: "#6B4C2A", marginTop: 4 }}>Date: {bill.date}</p>
            </div>
          </div>

          {/* ── RATE BAR ── */}
          <div
            style={{
              background: "rgba(212,175,55,.06)",
              padding: "10px 32px",
              borderBottom: "1px solid #F0E8D8",
              display: "flex",
              gap: 32,
              flexWrap: "wrap",
            }}
          >
            <p style={{ fontSize: 12, color: "#9E7B0E" }}>
              Gold Rate:{" "}
              <strong style={{ color: "#2C1810" }}>₹{fmtINR(bill.goldRate)}/g</strong>
            </p>
            <p style={{ fontSize: 12, color: "#9E7B0E" }}>
              Silver Rate:{" "}
              <strong style={{ color: "#2C1810" }}>₹{fmtINR(bill.silverRate)}/g</strong>
            </p>
          </div>

          {/* ── ITEMS TABLE ── */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg,#1A0F0A,#2C1810)" }}>
                  {[
                    ["#", "center"],
                    ["Description", "left"],
                    ["Metal / Purity", "center"],
                    ["Weight (g)", "right"],
                    ["Rate (₹)", "right"],
                    ["Metal Value", "right"],
                    ["Wastage", "right"],
                    ["Making", "right"],
                    ["Amount", "right"],
                  ].map(([h, a]) => (
                    <th
                      key={h}
                      style={{
                        padding: "12px 14px",
                        color: "#D4AF37",
                        fontSize: 11,
                        fontWeight: 600,
                        textAlign: a,
                        letterSpacing: "0.5px",
                        textTransform: "uppercase",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bill.items.map((item, idx) => {
                  const { metalVal, wastageAmt, total } = calcItem(item);
                  const w = parseFloat(item.weight) || 0;
                  const wp = parseFloat(item.wastage) || 0;
                  const mc = parseFloat(item.making) || 0;
                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: "1px solid #F5EDD8",
                        background: idx % 2 === 0 ? "white" : "#FFFDF7",
                      }}
                    >
                      <td
                        style={{
                          padding: "13px 14px",
                          color: "#C8A84A",
                          fontSize: 13,
                          textAlign: "center",
                          fontWeight: 600,
                        }}
                      >
                        {idx + 1}
                      </td>
                      <td style={{ padding: "13px 14px" }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: "#2C1810" }}>
                          {item.name || "—"}
                        </p>
                      </td>
                      <td style={{ padding: "13px 14px", textAlign: "center" }}>
                        <span
                          style={{
                            background:
                              item.metal === "Gold"
                                ? "rgba(212,175,55,.15)"
                                : "rgba(168,168,192,.2)",
                            color: item.metal === "Gold" ? "#9E7B0E" : "#5555A0",
                            padding: "3px 10px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            display: "inline-block",
                            marginBottom: 3,
                          }}
                        >
                          {item.metal}
                        </span>
                        <p style={{ fontSize: 11, color: "#C8B88A" }}>{item.purity}</p>
                      </td>
                      <td
                        style={{
                          padding: "13px 14px",
                          textAlign: "right",
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#2C1810",
                        }}
                      >
                        {w.toFixed(3)}
                      </td>
                      <td style={{ padding: "13px 14px", textAlign: "right", fontSize: 13, color: "#6B4C2A" }}>
                        ₹{fmtINR(parseFloat(item.rate) || 0)}
                      </td>
                      <td style={{ padding: "13px 14px", textAlign: "right", fontSize: 13, color: "#6B4C2A" }}>
                        ₹{fmtINR(metalVal)}
                      </td>
                      <td style={{ padding: "13px 14px", textAlign: "right", fontSize: 13, color: "#6B4C2A" }}>
                        {wp > 0 ? (
                          <>
                            <p style={{ fontWeight: 500 }}>{wp}%</p>
                            <p style={{ fontSize: 11, color: "#C8B88A" }}>₹{fmtINR(wastageAmt)}</p>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={{ padding: "13px 14px", textAlign: "right", fontSize: 13, color: "#6B4C2A" }}>
                        {mc > 0 ? `₹${fmtINR(mc)}` : "—"}
                      </td>
                      <td
                        style={{
                          padding: "13px 14px",
                          textAlign: "right",
                          fontWeight: 700,
                          fontSize: 15,
                          color: "#2C1810",
                        }}
                      >
                        ₹{fmtINR(total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── TOTALS ── */}
          <div
            style={{
              padding: "20px 32px 24px",
              background: "#FEF9F2",
              borderTop: "1px solid #F0E8D8",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <div style={{ width: 300 }}>
              {[
                ["Metal Value", totals.metalVal],
                ["Wastage Charges", totals.wastageAmt],
                ["Making Charges", totals.making],
              ].map(([label, val]) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "7px 0",
                    borderBottom: "1px solid #F0E8D8",
                    fontSize: 14,
                    color: "#6B4C2A",
                  }}
                >
                  <span>{label}</span>
                  <span>₹{fmtINR(val)}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 18px",
                  background: "linear-gradient(135deg,#1A0F0A,#2C1810)",
                  borderRadius: 10,
                  marginTop: 10,
                }}
              >
                <span className="sf" style={{ fontSize: 22, color: "#D4AF37", fontWeight: 600 }}>
                  Grand Total
                </span>
                <span style={{ fontSize: 24, fontWeight: 700, color: "white" }}>
                  ₹{fmtINR(totals.total)}
                </span>
              </div>
            </div>
          </div>

          {/* ── FOOTER ── */}
          <div
            style={{
              background: "linear-gradient(135deg,#1A0F0A,#2C1810)",
              padding: "22px 32px",
              textAlign: "center",
            }}
          >
            <p className="sf" style={{ fontSize: 20, color: "#D4AF37", fontWeight: 500, marginBottom: 6 }}>
              Thank you for your purchase!
            </p>
            <p style={{ fontSize: 12, color: "rgba(212,175,55,.5)", letterSpacing: "2px" }}>
              PLEASE VISIT AGAIN · WE VALUE YOUR TRUST
            </p>
            <div
              style={{
                height: 1,
                background:
                  "linear-gradient(to right,transparent,rgba(212,175,55,.3),transparent)",
                margin: "12px 0",
              }}
            />
            <p style={{ fontSize: 11, color: "rgba(212,175,55,.35)" }}>
              This is a computer-generated invoice · No signature required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [goldRate, setGoldRate] = useState(7500);
  const [silverRate, setSilverRate] = useState(90);
  const [invoices, setInvoices] = useState(loadData);
  const [currentBill, setCurrentBill] = useState(null);

  useEffect(() => {
    localStorage.setItem("rs_invoices", JSON.stringify(invoices));
  }, [invoices]);

  const handleCreate = () => {
    setCurrentBill({
      id: genId(),
      invoiceNo: genInvNo(),
      date: fmtDate(),
      customer: { name: "", mobile: "" },
      items: [freshItem(goldRate, silverRate)],
      goldRate,
      silverRate,
    });
    setScreen("billing");
  };

  const handleSave = (bill) => {
    setInvoices((prev) => {
      const exists = prev.find((i) => i.id === bill.id);
      return exists ? prev.map((i) => (i.id === bill.id ? bill : i)) : [bill, ...prev];
    });
    setCurrentBill(bill);
    setScreen("invoice");
  };

  const subtitles = {
    dashboard: "Gold & Silver Jewellery · Retail",
    billing: `New Invoice · ${fmtDate()}`,
    invoice: currentBill ? `Invoice #${currentBill.invoiceNo}` : "",
  };

  return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", background: "#FEF9F2" }}>
        <Header
          screen={screen}
          onBack={screen !== "dashboard" ? () => setScreen("dashboard") : null}
          subtitle={subtitles[screen]}
        />

        {screen === "dashboard" && (
          <Dashboard
            goldRate={goldRate}
            setGoldRate={setGoldRate}
            silverRate={silverRate}
            setSilverRate={setSilverRate}
            onCreate={handleCreate}
            invoices={invoices}
            onView={(bill) => {
              setCurrentBill(bill);
              setScreen("invoice");
            }}
          />
        )}

        {screen === "billing" && currentBill && (
          <BillingForm
            bill={currentBill}
            goldRate={goldRate}
            silverRate={silverRate}
            onBack={() => setScreen("dashboard")}
            onSave={handleSave}
          />
        )}

        {screen === "invoice" && currentBill && (
          <InvoiceView
            bill={currentBill}
            onBack={() => setScreen("dashboard")}
            onNew={handleCreate}
          />
        )}
      </div>
    </>
  );
}
