import "./globals.css";

export const metadata = {
  title: "HK Traffic Sign Catalogue",
  description: "Catalogue of Hong Kong Traffic Signs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
