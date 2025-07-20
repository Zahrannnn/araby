import type { Metadata } from "next";
import "./globals.css";
import { Providers } from './providers'


export const metadata: Metadata = {
  title: "Nedx - CRM",
  description: "Streamline your business operations with our comprehensive management solution",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
