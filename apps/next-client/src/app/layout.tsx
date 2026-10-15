import { type ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Mulish } from 'next/font/google';
import './globals.css';

const mulish = Mulish({
  variable: '--font-mulish',
  subsets: ['latin'],
});

const defaultTitle = 'Fastor';

export const metadata: Metadata = {
  title: {
    template: `%s | ${defaultTitle}`,
    default: defaultTitle,
  },
  description: 'Order food from restaurants near you'
};

export const viewport: Viewport = {
  themeColor: '#e8601f'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${mulish.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
