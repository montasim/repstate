//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  ...tanstackConfig,
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/components/ui/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@hugeicons/*", "lucide-react", "react-icons", "react-icons/*"],
              message:
                "Import icons from '@/components/ui/icons' so the app uses the shared Hugeicons system.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/domain/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-*",
                "@mediapipe/*",
                "@tanstack/*",
                "@/components/*",
                "@/features/*/application/*",
                "@/features/*/infrastructure/*",
                "@/features/*/ui/*",
                "../application/*",
                "../infrastructure/*",
                "../ui/*",
              ],
              message: "domain must stay pure.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        "window",
        "document",
        "navigator",
        "performance",
        "requestAnimationFrame",
      ],
    },
  },
  {
    files: ["src/features/**/application/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-*",
                "@mediapipe/*",
                "@tanstack/*",
                "@/components/*",
                "@/features/*/infrastructure/*",
                "@/features/*/ui/*",
                "../infrastructure/*",
                "../ui/*",
              ],
              message: "application depends on domain and ports only.",
            },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        "window",
        "document",
        "navigator",
        "performance",
        "requestAnimationFrame",
      ],
    },
  },
  {
    ignores: ["eslint.config.js", ".prettierrc", "dist/**", "public/**", "src/routeTree.gen.ts", "scripts/**"],
  },
]
