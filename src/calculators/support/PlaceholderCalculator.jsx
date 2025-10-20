import React from "react";

export default function PlaceholderCalculator({ title = "Calculator", notes }) {
  return (
    <div className="max-w-3xl mx-auto my-8 p-6 bg-white rounded-2xl border">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-gray-600">
        This calculator is scaffolded and ready for implementation.
      </p>
      {notes ? <p className="mt-2 text-sm text-gray-500">{notes}</p> : null}
      <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm">
        <ul className="list-disc list-inside space-y-1 text-gray-700">
          <li>Add inputs, math, and charts here.</li>
          <li>Follow the style of existing calculators for UX consistency.</li>
          <li>Write pure functions for math; unit test them.</li>
        </ul>
      </div>
    </div>
  );
}
