import Image from 'next/image';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-[101] flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Image
            src="/my logo.png"
            alt="Code-X Logo"
            width={80}
            height={80}
            className="animate-pulse"
        />
    </div>
  );
}
