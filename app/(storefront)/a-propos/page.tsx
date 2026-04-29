import type { Metadata } from 'next';
import { HeroAPropos } from '@/components/sections/apropos/HeroAPropos';
import { EtincelleBlock } from '@/components/sections/apropos/EtincelleBlock';
import { IdeeBlock } from '@/components/sections/apropos/IdeeBlock';
import { PiliersBlock } from '@/components/sections/apropos/PiliersBlock';
import { FondateurBlock } from '@/components/sections/apropos/FondateurBlock';
import { CollectifBlock } from '@/components/sections/apropos/CollectifBlock';
import { CtaBlock } from '@/components/sections/apropos/CtaBlock';

export const metadata: Metadata = {
  title: 'Notre histoire — Island Dreams 974',
  description: "Découvre l'histoire d'Island Dreams, la boutique de souvenirs exclusifs à l'effigie des communes de La Réunion.",
};

export default function AProposPage() {
  return (
    <>
      <HeroAPropos />
      <EtincelleBlock />
      <IdeeBlock />
      <PiliersBlock />
      <FondateurBlock />
      <CollectifBlock />
      <CtaBlock />
    </>
  );
}
