import { getShippingZones } from '@/lib/actions/shipping';
import { ShippingManager } from '@/components/admin/ShippingManager';

export default async function LivraisonPage() {
  const zones = await getShippingZones();
  return <ShippingManager initialZones={zones} />;
}
