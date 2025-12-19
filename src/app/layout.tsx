import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider, ThemeStyleProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Trip Planner",
  description: "Plan your perfect trip with AI",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          themes={["light", "dark"]}
          storageKey="fuzionai-theme"
          disableTransitionOnChange
        >
          <ThemeStyleProvider>
            <div id="root">
              {children}
              <Toaster richColors />
            </div>
          </ThemeStyleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
