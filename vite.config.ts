import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/Amirdigi/", // ⚠️ اسم ریپازیتوری گیت‌هابت رو اینجا بذار
});