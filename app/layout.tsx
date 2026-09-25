import type { Metadata } from "next";
import { K2D } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "./components/SmoothScrollProvider";
import Loading from "./components/ui/Loading";

const k2d = K2D({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-k2d",
});

export const metadata: Metadata = {
  title: "QPhase",
  description:
    "The compiler that proves it didn't break your circuit — and tells you, with real numbers, how far the answer drifts on real hardware.",
  keywords: ["AI", "Quantum", "Finance", "Biology", "Research"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${k2d.variable} h-dvh antialiased`}
    >
      <body className="min-h-full w-full flex flex-col">
        <Loading>
          <SmoothScrollProvider>
            {/* <CursorEffect /> */}
            {children}
          </SmoothScrollProvider>
        </Loading>
      </body>
    </html>
  );
}
