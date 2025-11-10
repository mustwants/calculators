import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import CalculatorIndex from "./CalculatorIndex";
import CalculatorShell from "./CalculatorShell";

export default function CalculatorsRouter() {
  return (
    <Routes>
      <Route path="/" element={<CalculatorIndex />} />
      <Route path=":slug" element={<CalculatorShell />} />
      <Route path="*" element={<Navigate to="/calculators" replace />} />
    </Routes>
  );
}
