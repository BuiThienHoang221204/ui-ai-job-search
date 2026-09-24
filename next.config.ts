import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

// 'self' chứ không 'none': khung xem trước CV là iframe srcDoc ngay trong app, và nó thừa hưởng CSP của trang cha.
const FRAME_ANCESTORS = "'self'";

const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: `frame-ancestors ${FRAME_ANCESTORS}; base-uri 'self'; object-src 'none'; form-action 'self'`,
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // HSTS chỉ ở production: đặt trên localhost là trình duyệt ép https cho mọi cổng localhost suốt một năm.
  ...(process.env.NODE_ENV === "production"
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
