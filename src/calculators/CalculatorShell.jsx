import React, { Suspense } from "react";
import { useParams } from "react-router-dom";
import { CALCULATORS } from "./registry";

export default function CalculatorShell() {
  const { slug } = useParams();
  const found = CALCULATORS.find((c) => c.slug === slug);

  if (!found) {
    return (
      <div className="max-w-3xl mx-auto my-10 p-6 bg-white rounded-2xl border">
        <h2 className="text-xl font-semibold text-gray-900">Not found</h2>
        <p className="text-gray-600 mt-2">Unknown calculator: {slug}</p>
      </div>
    );
  }

  const Comp = found.component;
  const title = found.title;

  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto my-10 p-6 bg-white rounded-2xl border">
          <div className="animate-pulse text-gray-500">Loading {title}…</div>
        </div>
      }
    >
      <Comp title={title} />
    </Suspense>
  );
}
