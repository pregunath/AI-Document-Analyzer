import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Clearframe | AI Document Analyzer',
  description: 'Turn dense documents into clear decisions.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
