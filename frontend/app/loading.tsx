import Image from 'next/image';

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-primary">
      <div className="animate-pulse-fast">
        <Image 
          src="/icon.png" 
          alt="Loading..." 
          width={300} 
          height={150}
          priority
        />
      </div>
    </div>
  )
}