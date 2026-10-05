import { getFreeShipping, getShippingZones } from '@/lib/actions/shipping';
import { ShippingManager } from '@/components/admin/ShippingManager';

export default async function LivraisonPage() {
  const [zones, freeShipping] = await Promise.all([getShippingZones(), getFreeShipping()]);
  return <ShippingManager initialZones={zones} freeShipping={freeShipping} />;
}
