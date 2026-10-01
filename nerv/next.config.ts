import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // knex requires() every dialect driver at load (tedious, pg, ...);
  // keep it external so those optional requires never get bundled.
  serverExternalPackages: ["knex"],
};

export default nextConfig;
