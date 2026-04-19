import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "IntelliTest - AI-Powered Exam Paper Generator",
  description:
    "Generate professional exam question papers for West Bengal board, JEE Mains, JEE Advanced, and WBJEE using AI. Built for Bengali medium math teachers.",
  keywords: [
    "exam paper generator",
    "AI question paper",
    "WBBSE",
    "WBCHSE",
    "JEE",
    "math exam",
    "West Bengal",
    "IntelliTest",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className} style={{ minHeight: "100vh" }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
