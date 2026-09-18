// src/components/CuencaSelector.tsx
"use client";

import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useTelemetry } from "@/context/TelemetryContext";

interface CuencaOption {
  value: string;
  label: string;
}

export default function CuencaSelector() {
  const [options, setOptions] = useState<CuencaOption[]>([]);
  const { setUbigeo } = useTelemetry();

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    fetch(`${apiBase}/api/cuencas/macro`)
      .then((res) => res.json())
      .then((data) => {
        // Assuming data is an array of { ubigeo, nombre }
        const opts = data.map((c: any) => ({ value: c.ubigeo, label: c.nombre }));
        setOptions(opts);
      })
      .catch(() => setOptions([]));
  }, []);

  const handleChange = (selected: CuencaOption | null) => {
    if (selected) setUbigeo(selected.value);
  };

  return (
    <div className="w-full max-w-sm mb-4">
      <Select
        options={options}
        placeholder="Seleccionar cuenca..."
        onChange={handleChange}
        classNamePrefix="react-select"
        isClearable
      />
    </div>
  );
}
