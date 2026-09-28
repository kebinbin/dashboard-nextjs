import "@/app/ui/global.css";
import { inter } from "./ui/fonts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col`}
      >
        <div className="grow">{children}</div>
        <footer className="flex w-full bg-slate-100 py-10 justify-center">
          Hecho con 🖤 desde PR
        </footer>
      </body>
    </html>
  );
}
