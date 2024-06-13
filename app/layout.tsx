import './globals.css';
import { Inter } from 'next/font/google';
import 'tailwindcss/tailwind.css';
import Link from 'next/link';
import React from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Facebook Manager',
  description: 'Created by Kobe!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>
        <nav className="bg-blue-500 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="text-white font-bold text-xl">MyApp</div>
            <div className="flex space-x-4">
              <Link href="/" legacyBehavior>
                <a className="text-white hover:text-gray-200">Home</a>
              </Link>
              <Link href="/campaigns" legacyBehavior>
                <a className="text-white hover:text-gray-200">Campaigns</a>
              </Link>
              <Link href="/edit-campaigns" legacyBehavior>
                <a className="text-white hover:text-gray-200">Edit Campaigns</a>
              </Link>
              {/* Add more links here as needed */}
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
