import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Inbox Deleter",
  description: "Permanently delete or trash an entire Gmail mailbox.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
