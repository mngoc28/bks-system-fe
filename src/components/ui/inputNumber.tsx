import React, { useState } from "react";
import { PropsInput } from "../type";

export default function InputNumber({ value, onChange, placeholder }: PropsInput) {
  const [isFocused, setIsFocused] = useState(false);
  const formatNumber = (str: string) => {
    if (!str) return "";
    const cleaned = str.replace(/,/g, "");
    if (!/^\d+$/.test(cleaned)) return "";
    return Number(cleaned).toLocaleString("en-US");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    
    if (raw === "") {
      onChange("");
      return;
    }
    if (!/^\d+$/.test(raw)) return;
    
    onChange(raw);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };
  
  const displayValue = isFocused ? value : formatNumber(value);

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className="flex h-12 w-full rounded border border-slate-300 bg-white px-4 py-3 text-base text-slate-700 transition-colors placeholder:text-muted-foreground focus-visible:border-slate-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
    />
  );
}
