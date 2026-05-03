const HEADER = `
<div style="background:#2a5a3a;padding:24px;text-align:center;">
  <h1 style="color:#f5efe0;font-size:24px;margin:0;font-family:Georgia,serif;">Island Dreams · 974</h1>
  <p style="color:#EA9C36;font-size:12px;margin:4px 0 0;letter-spacing:2px;">SOUVENIRS DE LA RÉUNION</p>
</div>`;

const FOOTER = `
<div style="background:#f5efe0;padding:20px;text-align:center;font-size:12px;color:#1a2e3b99;">
  <p style="margin:0;">Island Dreams — Souvenirs illustrés de La Réunion</p>
  <p style="margin:4px 0 0;">contact@islanddreams.re · islanddreams.re</p>
</div>`;

function wrap(content: string) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,Arial,sans-serif;">
<div style="max-width:600px;margin:20px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
${HEADER}
<div style="padding:28px 24px;">
${content}
</div>
${FOOTER}
</div>
</body>
</html>`;
}

// ─── Newsletter bienvenue ──────────────────────────────────────────

export function newsletterWelcome(email: string) {
  return {
    subject: 'Bienvenue dans la famille Island Dreams ! 🌴',
    html: wrap(`
      <h2 style="color:#1a2e3b;font-size:20px;margin:0 0 12px;">Merci de nous rejoindre !</h2>
      <p style="color:#555;line-height:1.6;">
        Ou lé bien arrivé dans la famille Island Dreams.<br>
        Pour te remercier, voici ton code promo exclusif :
      </p>
      <div style="background:#2a5a3a;color:#f5efe0;text-align:center;padding:16px;border-radius:8px;margin:20px 0;">
        <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Ton code promo</p>
        <p style="margin:8px 0 0;font-size:28px;font-weight:bold;letter-spacing:4px;color:#EA9C36;">BIENVENUE10</p>
        <p style="margin:6px 0 0;font-size:13px;color:#f5efe0cc;">-10% sur ta première commande</p>
      </div>
      <p style="color:#555;line-height:1.6;">
        Découvre nos magnets, stickers, serviettes et bien plus sur
        <a href="https://islanddreams.re/boutique" style="color:#2a5a3a;font-weight:bold;">notre boutique</a>.
      </p>
      <p style="color:#999;font-size:12px;margin-top:20px;">
        Tu reçois cet email car ${email} a été inscrit à notre newsletter.
      </p>
    `),
  };
}

// ─── Confirmation de commande ──────────────────────────────────────

type OrderItem = { name: string; quantity: number; price: number };
type OrderData = {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  shippingAddress?: string;
};

export function orderConfirmation(order: OrderData) {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;color:#333;">${item.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;color:#555;">x${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;color:#333;font-weight:bold;">${(item.price * item.quantity).toFixed(2)} €</td>
      </tr>`
    )
    .join('');

  return {
    subject: `Commande confirmée #${order.orderNumber} — Island Dreams`,
    html: wrap(`
      <h2 style="color:#1a2e3b;font-size:20px;margin:0 0 4px;">Commande confirmée !</h2>
      <p style="color:#2a5a3a;font-weight:bold;margin:0 0 16px;">Commande #${order.orderNumber}</p>
      <p style="color:#555;line-height:1.6;">
        Merci ${order.customerName} ! Nous avons bien reçu ta commande et nous la préparons.
      </p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr style="border-bottom:2px solid #2a5a3a;">
            <th style="text-align:left;padding:8px 0;color:#1a2e3b;font-size:13px;">Produit</th>
            <th style="text-align:center;padding:8px 0;color:#1a2e3b;font-size:13px;">Qté</th>
            <th style="text-align:right;padding:8px 0;color:#1a2e3b;font-size:13px;">Prix</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px 0;text-align:right;font-weight:bold;color:#1a2e3b;">Total</td>
            <td style="padding:12px 0;text-align:right;font-weight:bold;font-size:18px;color:#2a5a3a;">${order.total.toFixed(2)} €</td>
          </tr>
        </tfoot>
      </table>

      ${order.shippingAddress ? `<p style="color:#555;font-size:13px;">Adresse de livraison : ${order.shippingAddress}</p>` : ''}

      <p style="color:#555;line-height:1.6;">
        Tu recevras un email avec le suivi de livraison dès l'expédition.<br>
        Des questions ? Réponds directement à cet email.
      </p>
    `),
  };
}

// ─── Notification admin — nouveau contact ──────────────────────────

type ContactData = {
  nom: string;
  email: string;
  telephone?: string;
  objet: string;
  message: string;
};

export function contactNotification(contact: ContactData) {
  return {
    subject: `Nouveau message de ${contact.nom} — ${contact.objet}`,
    html: wrap(`
      <h2 style="color:#1a2e3b;font-size:20px;margin:0 0 16px;">Nouveau message reçu</h2>
      <table style="width:100%;font-size:14px;">
        <tr><td style="padding:6px 0;color:#999;width:100px;">Nom</td><td style="color:#333;font-weight:bold;">${contact.nom}</td></tr>
        <tr><td style="padding:6px 0;color:#999;">Email</td><td style="color:#333;">${contact.email}</td></tr>
        ${contact.telephone ? `<tr><td style="padding:6px 0;color:#999;">Tél</td><td style="color:#333;">${contact.telephone}</td></tr>` : ''}
        <tr><td style="padding:6px 0;color:#999;">Objet</td><td style="color:#333;font-weight:bold;">${contact.objet}</td></tr>
      </table>
      <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;color:#333;line-height:1.6;">
        ${contact.message.replace(/\n/g, '<br>')}
      </div>
      <a href="https://islanddreams.re/admin/messages" style="display:inline-block;background:#2a5a3a;color:#f5efe0;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:bold;">
        Voir dans l'admin
      </a>
    `),
  };
}

// ─── Notification admin — nouvelle commande ────────────────────────

export function orderNotificationAdmin(order: OrderData) {
  const itemsList = order.items
    .map((i) => `${i.name} x${i.quantity} — ${(i.price * i.quantity).toFixed(2)} €`)
    .join('<br>');

  return {
    subject: `Nouvelle commande #${order.orderNumber} — ${order.total.toFixed(2)} €`,
    html: wrap(`
      <h2 style="color:#1a2e3b;font-size:20px;margin:0 0 8px;">Nouvelle commande !</h2>
      <p style="color:#2a5a3a;font-weight:bold;font-size:16px;margin:0 0 16px;">#${order.orderNumber} — ${order.total.toFixed(2)} €</p>
      <p style="color:#555;"><strong>Client :</strong> ${order.customerName}</p>
      ${order.shippingAddress ? `<p style="color:#555;"><strong>Adresse :</strong> ${order.shippingAddress}</p>` : ''}
      <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;color:#333;line-height:1.8;font-size:14px;">
        ${itemsList}
      </div>
      <a href="https://islanddreams.re/admin/commandes" style="display:inline-block;background:#2a5a3a;color:#f5efe0;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:13px;font-weight:bold;">
        Voir la commande
      </a>
    `),
  };
}
