import React, { useMemo, useState } from "react";
import { CALCULATORS, CATEGORIES } from "./registry";

function Card({ item }) {
  return (
    <a
      href={`/calculators/${item.slug}`}
      className="block rounded-xl border p-4 hover:shadow-sm transition bg-white"
    >
      <div className="text-sm text-gray-500">{item.category}</div>
      <div className="mt-1 font-semibold text-gray-900">{item.title}</div>
      {item.tags?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {item.tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border text-gray-700"
            >
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </a>
  );
}

export default function CalculatorIndex() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const list = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return CALCULATORS.filter((c) => {
      const inCat = cat === "All" || c.category === cat;
      const inText =
        !ql ||
        c.title.toLowerCase().includes(ql) ||
        c.tags?.some((t) => t.toLowerCase().includes(ql));
      return inCat && inText;
    });
  }, [q, cat]);

  return (
    <div className="max-w-7xl mx-auto my-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900">Financial Calculators</h1>
      <p className="text-gray-600 mt-1">
        Browse by category or search. Tools load instantly with code-splitting.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search calculators…"
          className="w-full md:w-80 rounded-md border p-2"
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="rounded-md border p-2 bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((item) => (
          <Card key={item.slug} item={item} />
        ))}
      </div>
    </div>
  );
}
