import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-vazirmatn",
});

export const metadata: Metadata = {
  title: "زرین‌پال آنالیتیکس | هوش مصنوعی تحلیل پرداخت",
  description: "پلتفرم هوش مصنوعی تحلیل پرداخت برای پذیرندگان زرین‌پال",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className={`${vazirmatn.className} antialiased`}>{children}</body>
    </html>
  );
}
