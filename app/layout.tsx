import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blur - Anonymous Chat Rooms",
  description: "Create secure, anonymous chat rooms and share them instantly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              fontSize: '14px',
              fontFamily: 'Outfit, sans-serif',
            },
            success: {
              iconTheme: {
                primary: 'var(--success)',
                secondary: 'var(--bg-elevated)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--error)',
                secondary: 'var(--bg-elevated)',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
