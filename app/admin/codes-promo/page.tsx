import { getAdminPromotions } from '@/lib/actions/promotions';
import { PromotionsClient } from './PromotionsClient';

export default async function PromotionsPage() {
  return <PromotionsClient initialPromotions={await getAdminPromotions()} />;
}
