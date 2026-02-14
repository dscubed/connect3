import { cn } from '@/lib/utils';
import Image, { StaticImageData } from 'next/image';

export type CardProps = {
  className?: string;
  backgroundImage: string | StaticImageData;
  children: React.ReactNode;
};

export default function BaseCard({ className, backgroundImage, children }: CardProps) {
  return (
    <div className={cn(`w-full h-full relative`, className)}>
      <Image
        src={backgroundImage}
        alt="Background"
        fill
        className="object-cover"
      />
      
      <div className="relative z-10 flex flex-col gap-4 items-center justify-center w-full h-full p-4">
        {children}
      </div>
    </div>
  );
}
