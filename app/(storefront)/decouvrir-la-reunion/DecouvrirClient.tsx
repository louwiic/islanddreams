'use client';

import { useState } from 'react';
import { CarteInteractive } from '@/components/sections/CarteInteractive';

type Commune = {
  id: string;
  name: string;
  region: string;
  postalCode: string;
  description: string;
  tag: string;
  color: string;
};

type Props = {
  communes: Commune[];
  regions: string[];
};

export function DecouvrirClient({ communes }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setActiveId(id === activeId ? null : id);
  };

  const activeCommune = communes.find((c) => c.id === activeId) ?? null;

  return (
    <section className="w-full">
      <CarteInteractive
        onSelect={handleSelect}
        activeId={activeId}
        activeCommune={activeCommune}
      />
    </section>
  );
}
