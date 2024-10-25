import Navbar from "@/components/myComponents/Navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <Navbar />
    {children}
    </>
  );
}
