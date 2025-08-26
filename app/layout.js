import "./globals.css";
import Nav from "@/components/Nav";
import { AuthProvider } from "@/components/AuthProvider";
import CookieBanner from "@/components/CookieBanner";

export const metadata = {
  title: "Aula",
  description: "Sitio del aula - MVP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Nav />
          <main className="container py-6">{children}</main>
          <CookieBanner />
          <footer className="container py-10 text-sm text-gray-500">
            <hr className="my-6" />
            <p>&copy; {new Date().getFullYear()} Aula - Proyecto educativo.</p>
            <p><a className="link" href="/privacidad">Privacidad</a> · <a className="link" href="/cookies">Cookies</a></p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
