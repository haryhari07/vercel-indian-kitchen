import Link from 'next/link';
import Image from 'next/image';
import { State } from '../data/types';

interface StateCardProps {
  state: State;
  priority?: boolean;
}

export default function StateCard({ state, priority = false }: StateCardProps) {
  return (
    <Link href={`/${state.slug}`} className="group block overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow bg-white">
      <div className="h-48 bg-gray-200 relative overflow-hidden">
        <Image 
          src={state.imageUrl} 
          alt={state.name} 
          fill
          priority={priority}
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
            <h3 className="text-white text-xl font-bold">{state.name}</h3>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-orange-600 font-semibold mb-2">{state.region}</p>
        <p className="text-gray-600 text-sm line-clamp-3">{state.description}</p>
      </div>
    </Link>
  );
}
