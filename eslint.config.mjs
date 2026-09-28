import { FlatCompat } from "@eslint/eslintrc";

// eslint-config-next 15 ships eslintrc-style config, so wrap it with FlatCompat.
// (Next 16's docs import "eslint-config-next/core-web-vitals" directly — that needs v16.)
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"] },
];
