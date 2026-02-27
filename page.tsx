import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rebate Optimizer MVP",
  description: "Grower-facing rebate optimizer (modeled assumptions)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
