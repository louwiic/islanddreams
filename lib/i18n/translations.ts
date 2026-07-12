import type { Locale } from './config';

const fr = {
  'language.label': 'Choisir la langue',
  'nav.home': 'Accueil', 'nav.shop': 'Boutique', 'nav.discover': 'Découvrir La Réunion',
  'nav.blog': 'Blog', 'nav.about': 'À propos', 'nav.contact': 'Contact', 'nav.account': 'Mon compte',
  'nav.menu': 'Menu',
  'cart.label': 'Panier ({count} article(s))', 'cart.title': 'Panier', 'cart.empty': 'Votre panier est vide',
  'cart.continue': 'Continuer mes achats', 'cart.subtotal': 'Sous-total',
  'cart.shipping': 'Frais de livraison calculés au paiement', 'cart.checkout': 'Commander — {total} €',
  'cart.view': 'Voir le panier complet',
  'footer.shop': 'BOUTIQUE', 'footer.about': 'À PROPOS', 'footer.discover': 'DÉCOUVRIR LA RÉUNION',
  'footer.contact': 'CONTACT', 'footer.viewShop': 'Voir la boutique', 'footer.contactUs': 'Nous contacter',
  'footer.firstOrder': '-10% sur ta première commande + nos nouveautés',
  'footer.newsletterConsent': "En m’inscrivant, j’accepte de recevoir les emails Island Dreams. Désinscription en un clic.",
  'footer.privacy': 'Confidentialité', 'footer.useful': 'Liens utiles',
  'footer.legal': 'Mentions légales', 'footer.privacyPolicy': 'Politique de confidentialité',
  'footer.cookies': 'Politique de cookies', 'footer.terms': 'CGV',
  'footer.thanks': 'Merci ! Vérifie ta boîte mail 🌴', 'footer.made': 'Un site fait à La Réunion (974). 2026 Island Dreams.',
  'cookies.title': 'Gestion des cookies',
  'cookies.description': "Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord, des cookies de mesure d’audience pour améliorer Island Dreams.",
  'cookies.read': 'Lire la politique de cookies', 'cookies.necessary': 'Cookies nécessaires',
  'cookies.necessaryHelp': 'Panier, sécurité, paiement et préférences indispensables.',
  'cookies.analytics': 'Mesure d’audience', 'cookies.analyticsHelp': 'Statistiques anonymisées pour comprendre les pages consultées.',
  'cookies.save': 'Enregistrer', 'cookies.accept': 'Accepter', 'cookies.reject': 'Refuser', 'cookies.customize': 'Personnaliser',
} as const;

type TranslationKey = keyof typeof fr;
type Dictionary = Record<TranslationKey, string>;

const en: Dictionary = {
  ...fr, 'language.label': 'Choose language', 'nav.home': 'Home', 'nav.shop': 'Shop', 'nav.discover': 'Discover Réunion Island', 'nav.about': 'About', 'nav.contact': 'Contact', 'nav.account': 'My account', 'nav.menu': 'Menu',
  'cart.label': 'Cart ({count} item(s))', 'cart.title': 'Cart', 'cart.empty': 'Your cart is empty', 'cart.continue': 'Continue shopping', 'cart.subtotal': 'Subtotal', 'cart.shipping': 'Shipping calculated at checkout', 'cart.checkout': 'Checkout — {total} €', 'cart.view': 'View full cart',
  'footer.shop': 'SHOP', 'footer.about': 'ABOUT', 'footer.discover': 'DISCOVER RÉUNION ISLAND', 'footer.contact': 'CONTACT', 'footer.viewShop': 'Visit the shop', 'footer.contactUs': 'Contact us', 'footer.firstOrder': '10% off your first order + our latest arrivals', 'footer.newsletterConsent': 'By subscribing, I agree to receive Island Dreams emails. Unsubscribe in one click.', 'footer.privacy': 'Privacy', 'footer.useful': 'Useful links', 'footer.legal': 'Legal notice', 'footer.privacyPolicy': 'Privacy policy', 'footer.cookies': 'Cookie policy', 'footer.terms': 'Terms of sale', 'footer.thanks': 'Thank you! Check your inbox 🌴', 'footer.made': 'A website made in Réunion Island (974). 2026 Island Dreams.',
  'cookies.title': 'Cookie settings', 'cookies.description': 'We use cookies required to operate the website and, with your consent, audience measurement cookies to improve Island Dreams.', 'cookies.read': 'Read the cookie policy', 'cookies.necessary': 'Necessary cookies', 'cookies.necessaryHelp': 'Cart, security, payment and essential preferences.', 'cookies.analytics': 'Audience measurement', 'cookies.analyticsHelp': 'Anonymous statistics to understand which pages are viewed.', 'cookies.save': 'Save', 'cookies.accept': 'Accept', 'cookies.reject': 'Reject', 'cookies.customize': 'Customize',
};

const pt: Dictionary = {
  ...en, 'language.label': 'Escolher idioma', 'nav.home': 'Início', 'nav.shop': 'Loja', 'nav.discover': 'Descobrir a Ilha da Reunião', 'nav.about': 'Sobre nós', 'nav.account': 'A minha conta',
  'cart.label': 'Carrinho ({count} artigo(s))', 'cart.title': 'Carrinho', 'cart.empty': 'O seu carrinho está vazio', 'cart.continue': 'Continuar a comprar', 'cart.subtotal': 'Subtotal', 'cart.shipping': 'Envio calculado no pagamento', 'cart.checkout': 'Finalizar compra — {total} €', 'cart.view': 'Ver carrinho completo',
  'footer.shop': 'LOJA', 'footer.about': 'SOBRE NÓS', 'footer.discover': 'DESCOBRIR A ILHA DA REUNIÃO', 'footer.viewShop': 'Ver a loja', 'footer.contactUs': 'Contacte-nos', 'footer.firstOrder': '10% de desconto na primeira encomenda + novidades', 'footer.newsletterConsent': 'Ao subscrever, aceito receber emails da Island Dreams. Cancele com um clique.', 'footer.privacy': 'Privacidade', 'footer.useful': 'Links úteis', 'footer.legal': 'Aviso legal', 'footer.privacyPolicy': 'Política de privacidade', 'footer.cookies': 'Política de cookies', 'footer.terms': 'Termos de venda', 'footer.thanks': 'Obrigado! Consulte a sua caixa de entrada 🌴', 'footer.made': 'Um site criado na Ilha da Reunião (974). 2026 Island Dreams.',
  'cookies.title': 'Gestão de cookies', 'cookies.description': 'Utilizamos cookies necessários ao funcionamento do site e, com o seu consentimento, cookies de medição de audiência para melhorar a Island Dreams.', 'cookies.read': 'Ler a política de cookies', 'cookies.necessary': 'Cookies necessários', 'cookies.necessaryHelp': 'Carrinho, segurança, pagamento e preferências essenciais.', 'cookies.analytics': 'Medição de audiência', 'cookies.analyticsHelp': 'Estatísticas anónimas para compreender as páginas visitadas.', 'cookies.save': 'Guardar', 'cookies.accept': 'Aceitar', 'cookies.reject': 'Recusar', 'cookies.customize': 'Personalizar',
};

const de: Dictionary = {
  ...en, 'language.label': 'Sprache wählen', 'nav.home': 'Startseite', 'nav.shop': 'Shop', 'nav.discover': 'La Réunion entdecken', 'nav.about': 'Über uns', 'nav.account': 'Mein Konto',
  'cart.label': 'Warenkorb ({count} Artikel)', 'cart.title': 'Warenkorb', 'cart.empty': 'Ihr Warenkorb ist leer', 'cart.continue': 'Weiter einkaufen', 'cart.subtotal': 'Zwischensumme', 'cart.shipping': 'Versand wird an der Kasse berechnet', 'cart.checkout': 'Zur Kasse — {total} €', 'cart.view': 'Vollständigen Warenkorb anzeigen',
  'footer.shop': 'SHOP', 'footer.about': 'ÜBER UNS', 'footer.discover': 'LA RÉUNION ENTDECKEN', 'footer.viewShop': 'Zum Shop', 'footer.contactUs': 'Kontakt', 'footer.firstOrder': '10 % auf Ihre erste Bestellung + Neuheiten', 'footer.newsletterConsent': 'Mit der Anmeldung stimme ich E-Mails von Island Dreams zu. Abmeldung mit einem Klick.', 'footer.privacy': 'Datenschutz', 'footer.useful': 'Nützliche Links', 'footer.legal': 'Impressum', 'footer.privacyPolicy': 'Datenschutzerklärung', 'footer.cookies': 'Cookie-Richtlinie', 'footer.terms': 'AGB', 'footer.thanks': 'Danke! Prüfen Sie Ihren Posteingang 🌴', 'footer.made': 'Eine Website aus La Réunion (974). 2026 Island Dreams.',
  'cookies.title': 'Cookie-Einstellungen', 'cookies.description': 'Wir verwenden notwendige Cookies für den Betrieb der Website und mit Ihrer Zustimmung Cookies zur Reichweitenmessung, um Island Dreams zu verbessern.', 'cookies.read': 'Cookie-Richtlinie lesen', 'cookies.necessary': 'Notwendige Cookies', 'cookies.necessaryHelp': 'Warenkorb, Sicherheit, Zahlung und notwendige Einstellungen.', 'cookies.analytics': 'Reichweitenmessung', 'cookies.analyticsHelp': 'Anonyme Statistiken zu den besuchten Seiten.', 'cookies.save': 'Speichern', 'cookies.accept': 'Akzeptieren', 'cookies.reject': 'Ablehnen', 'cookies.customize': 'Anpassen',
};

const es: Dictionary = {
  ...en, 'language.label': 'Elegir idioma', 'nav.home': 'Inicio', 'nav.shop': 'Tienda', 'nav.discover': 'Descubrir la isla de Reunión', 'nav.about': 'Quiénes somos', 'nav.account': 'Mi cuenta',
  'cart.label': 'Carrito ({count} artículo(s))', 'cart.title': 'Carrito', 'cart.empty': 'Tu carrito está vacío', 'cart.continue': 'Seguir comprando', 'cart.subtotal': 'Subtotal', 'cart.shipping': 'Envío calculado al pagar', 'cart.checkout': 'Finalizar compra — {total} €', 'cart.view': 'Ver carrito completo',
  'footer.shop': 'TIENDA', 'footer.about': 'QUIÉNES SOMOS', 'footer.discover': 'DESCUBRIR LA ISLA DE REUNIÓN', 'footer.viewShop': 'Ver la tienda', 'footer.contactUs': 'Contáctanos', 'footer.firstOrder': '10 % en tu primer pedido + novedades', 'footer.newsletterConsent': 'Al suscribirme, acepto recibir emails de Island Dreams. Baja con un clic.', 'footer.privacy': 'Privacidad', 'footer.useful': 'Enlaces útiles', 'footer.legal': 'Aviso legal', 'footer.privacyPolicy': 'Política de privacidad', 'footer.cookies': 'Política de cookies', 'footer.terms': 'Condiciones de venta', 'footer.thanks': '¡Gracias! Revisa tu bandeja de entrada 🌴', 'footer.made': 'Un sitio creado en la isla de Reunión (974). 2026 Island Dreams.',
  'cookies.title': 'Gestión de cookies', 'cookies.description': 'Usamos cookies necesarias para el funcionamiento del sitio y, con tu consentimiento, cookies de medición de audiencia para mejorar Island Dreams.', 'cookies.read': 'Leer la política de cookies', 'cookies.necessary': 'Cookies necesarias', 'cookies.necessaryHelp': 'Carrito, seguridad, pago y preferencias esenciales.', 'cookies.analytics': 'Medición de audiencia', 'cookies.analyticsHelp': 'Estadísticas anónimas para conocer las páginas visitadas.', 'cookies.save': 'Guardar', 'cookies.accept': 'Aceptar', 'cookies.reject': 'Rechazar', 'cookies.customize': 'Personalizar',
};

export const translations: Record<Locale, Dictionary> = { fr, en, pt, de, es };
export type { TranslationKey };
