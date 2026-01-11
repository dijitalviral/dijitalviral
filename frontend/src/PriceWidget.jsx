import { useEffect, useMemo, useState } from "react";

export default function PriceWidget({ symbol }) {
  const [tick, setTick] = useState(null);

  const wsUrl = useMemo(() => {
    const base = "ws://localhost:8000/ws/prices";
    return `${base}?symbol=${encodeURIComponent(symbol)}`;
  }, [symbol]);

  useEffect(() => {
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      // backend loop'u alive tutmak için arada mesaj gönderiyoruz
      ws.send("ping");
      const t = setInterval(() => ws.readyState === 1 && ws.send("ping"), 5000);
      ws._pingTimer = t;
    };

    ws.onmessage = (evt) => {
      try {
        setTick(JSON.parse(evt.data));
      } catch {}
    };

    ws.onerror = () => {};
    ws.onclose = () => {
      if (ws._pingTimer) clearInterval(ws._pingTimer);
    };

    return () => {
      if (ws._pingTimer) clearInterval(ws._pingTimer);
      ws.close();
    };
  }, [wsUrl]);

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, width: 320 }}>
      <div style={{ fontSize: 14, color: "#666" }}>Sözleşme</div>
      <div style={{ fontSize: 18, fontWeight: 700 }}>{symbol}</div>

      <div style={{ marginTop: 12, display: "flex", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#666" }}>Last</div>
          <div style={{ fontSize: 20 }}>{tick ? tick.last : "-"}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#666" }}>Bid</div>
          <div style={{ fontSize: 16 }}>{tick ? tick.bid : "-"}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#666" }}>Ask</div>
          <div style={{ fontSize: 16 }}>{tick ? tick.ask : "-"}</div>
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: "#888" }}>
        {tick ? tick.ts : ""}
      </div>
    </div>
  );
}
