import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ارزیابی و ارزش‌گذاری پروژه DropAgentXBot | کدها، قابلیت‌ها و قیمت دلاری",
  description: "سامانه هوشمند بررسی ارزش سورس‌کد، ساختار فایل‌ها، کدهای پیاده‌سازی شده، کمبودها و قیمت‌گذاری دلاری تک‌تک ماژول‌های DropAgentXBot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="dark">
      <body className="bg-[#0B0F17] text-slate-100 min-h-screen selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
