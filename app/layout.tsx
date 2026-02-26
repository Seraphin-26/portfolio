import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NARIVELOSON Seraphin — Fullstack JS Developer",
  description: "Portfolio of NARIVELOSON Seraphin, a Fullstack JavaScript developer specialized in React, Next.js and Node.js.",
  openGraph: {
    title: "NARIVELOSON Seraphin — Fullstack JS Developer",
    description: "Crafting digital experiences at the intersection of performance and aesthetics.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{children}</body>
    </html>
  );
}
