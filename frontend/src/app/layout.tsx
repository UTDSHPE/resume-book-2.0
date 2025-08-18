import "./globals.css";
import { DM_Sans } from 'next/font/google'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans", // optional: CSS variable
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"], // customize as needed
});

export const metadata = {
  title: "ResumeBook",
  description: "ResumeBook by UTD SHPE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" date-theme="light" className={inter.variable}>
      <body className='font-sans'>
        <main>{children}</main>
      </body>
    </html>
  );
}
