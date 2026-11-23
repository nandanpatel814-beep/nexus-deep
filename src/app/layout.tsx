import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NexusDeep — Autonomous Deep Research Engine',
  description:
    'Free and open-source alternative to $200/mo Deep Research. Multi-agent inquiry decomposition, live source grounding, and executive intelligence dossiers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#070b12] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
