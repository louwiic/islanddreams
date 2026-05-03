import type { Metadata } from 'next';
import { TimelineAPropos } from '@/components/sections/apropos/TimelineAPropos';
import { AProposAnimations } from '@/components/sections/apropos/AProposAnimations';

export const metadata: Metadata = {
  title: 'Notre histoire — Island Dreams 974',
  description: "Découvre l'histoire d'Island Dreams, la boutique de souvenirs exclusifs à l'effigie des communes de La Réunion.",
};

export default function AProposPage() {
  return (
    <>
      <AProposAnimations />
      <TimelineAPropos />
    </>
  );
}
