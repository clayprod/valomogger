import next from "eslint-config-next";

const config = [
  {
    ignores: ["generated/**", ".next/**", "node_modules/**"],
  },
  ...next,
];

export default config;
