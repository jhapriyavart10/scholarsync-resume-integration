import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'ScholarSync' }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="ScholarSync - Combine resume and academic data" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <span className="text-3xl font-bold text-blue-600">ScholarSync</span>
              </Link>
              <p className="text-gray-500">Combine your professional and academic profiles</p>
            </div>
            <nav>
              <ul className="flex gap-6">
                <li><Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link></li>
                <li><Link href="/about" className="text-gray-700 hover:text-blue-600">About</Link></li>
              </ul>
            </nav>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        
        <footer className="bg-white shadow-inner">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} ScholarSync. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
