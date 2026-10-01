import type { Metadata } from "next";
import "@mdrbx/nerv-ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "NERV Operations Console",
  description: "Staff console for the refx osu! server",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Fira+Code:wght@400;500;700&family=Barlow+Condensed:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-nerv-black text-nerv-orange antialiased">{children}</body>
    </html>
  );
}
