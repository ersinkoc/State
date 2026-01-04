import { Hero } from '@/components/home/Hero';
import { Stats } from '@/components/home/Stats';
import { Features } from '@/components/home/Features';
import { QuickCode } from '@/components/home/QuickCode';

export function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Stats />
      <Features />
      <QuickCode />
    </div>
  );
}
