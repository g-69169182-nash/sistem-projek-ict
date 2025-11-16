import "./globals.css";

export const metadata = {
  title: "Sistem Projek ICT",
  description: "Sistem Rekod Penggunaan Makmal ICT",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
