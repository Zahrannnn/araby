import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Nedx - CRM",
  description: "Streamline your business operations with our comprehensive management solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  )
}
