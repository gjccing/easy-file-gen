import { defineConfig } from "@solidjs/start/config";
import ViteYaml from "@modyfi/vite-plugin-yaml";

export default defineConfig({
  vite: { plugins: [ViteYaml()] },
});
