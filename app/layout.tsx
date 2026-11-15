import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "EditAI — Your footage, finished.",
  description:
    "A complete AI video editing studio. Edit, caption, transcribe and export your videos in your browser.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
