import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevOps Ref — Command Reference for DevOps Engineers",
  description:
    "Searchable, categorized reference for DevOps commands with detailed flag breakdowns, real-world examples, and expected outputs. Covers Linux, Bash, Docker, Kubernetes, Terraform, Git, Networking, and Ansible.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistMono.variable} antialiased font-mono`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
