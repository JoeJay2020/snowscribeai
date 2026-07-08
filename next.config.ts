import type { NextConfig } from "next";
import fs from "fs";

const projectRoot = fs.realpathSync.native(process.cwd());
const isWindows = process.platform === "win32";

// Windows-only: normalize path casing so Webpack doesn't load duplicate React/Next modules.
function normalizeWindowsPathCasing(root: string) {
  const rootLower = root.toLowerCase();

  const normalize = (filePath: string | undefined) => {
    if (!filePath) return filePath;
    if (filePath.toLowerCase().startsWith(rootLower)) {
      return root + filePath.slice(root.length);
    }
    return filePath;
  };

  return {
    apply(compiler: {
      hooks: {
        normalModuleFactory: {
          tap: (
            name: string,
            fn: (nmf: {
              hooks: {
                afterResolve: {
                  tap: (
                    name: string,
                    handler: (result: { resource?: string; context?: string } | undefined) => void
                  ) => void;
                };
              };
            }) => void
          ) => void;
        };
      };
    }) {
      compiler.hooks.normalModuleFactory.tap(
        "NormalizeWindowsPathCasing",
        (nmf) => {
          nmf.hooks.afterResolve.tap("NormalizeWindowsPathCasing", (result) => {
            if (!result) return;
            if (result.resource) result.resource = normalize(result.resource)!;
            if (result.context) result.context = normalize(result.context)!;
          });
        }
      );
    },
  };
}

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      "frame-src 'self' https://accounts.google.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: projectRoot,
  // Keep Firebase Admin and JWT deps external so Vercel Node runtime loads them natively.
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
  turbopack: {
    root: projectRoot,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const existing = config.externals;
      const packages = ["firebase-admin", "jwks-rsa", "jose"];
      config.externals = [
        ...(Array.isArray(existing) ? existing : [existing]).filter(Boolean),
        ...packages,
      ];
    }
    if (isWindows) {
      config.context = projectRoot;
      config.resolve.alias = {
        ...config.resolve.alias,
        "@": projectRoot,
      };
      config.plugins.push(normalizeWindowsPathCasing(projectRoot));
    }
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
