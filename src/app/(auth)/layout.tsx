import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-4 py-3">
        <Link href="/" className="flex items-center w-fit">
          <Image src="/Gad logo.jpeg" alt="GadTech" width={120} height={36} className="h-9 w-auto object-contain" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  );
}
