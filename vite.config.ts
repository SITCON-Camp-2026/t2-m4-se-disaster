import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const aiReviewPort = env.AI_REVIEW_PORT || "8787";

  return {
    plugins: [react()],
    base: repoName ? `/${repoName}/` : "/",
    server: {
      proxy: {
        "/api": `http://localhost:${aiReviewPort}`,
      },
    },
  };
});
