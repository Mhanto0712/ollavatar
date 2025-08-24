import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const lineSeed = localFont({
  src: [
    {
      path: './fonts/LINESeedTW_OTF_Th.woff2',
      weight: '100',
      style: 'normal',
    },
    {
      path: './fonts/LINESeedTW_OTF_Rg.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: './fonts/LINESeedTW_OTF_Bd.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: './fonts/LINESeedTW_OTF_Eb.woff2',
      weight: '800',
      style: 'normal',
    },
  ],
});

export const metadata: Metadata = {
  title: 'Ollavatar',
  description: 'Your AI Avatar From Ollama',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className='w-full h-full bg-black text-white scrollbar scrollbar-thumb-gray-500 scrollbar-track-gray-500/0'
    >
      <body className={`w-full h-full ${lineSeed.className}`}>{children}</body>
    </html>
  );
}
