import "./globals.css";

export const metadata = {
  title: "Rekod Penggunaan Makmal ICT",
  description: "Sistem Rekod Penggunaan Makmal ICT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ms">
      <body className="bg-[#e9eefb] text-[#0f1c3f] antialiased">
        {children}
      </body>
    </html>
  );
}
