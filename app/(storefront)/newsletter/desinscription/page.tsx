import Link from 'next/link';

export const metadata = {
  title: 'Désinscription newsletter — Island Dreams',
  robots: { index: false, follow: false },
};

export default async function DesinscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const success = status === 'ok';

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6 py-20">
      <div className="max-w-md w-full text-center">
        {success ? (
          <>
            <div className="w-16 h-16 rounded-full bg-jungle-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-jungle-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-ink mb-3">Désinscription confirmée</h1>
            <p className="text-gray-500 leading-relaxed mb-8">
              Tu as bien été désinscrit(e) de notre newsletter.
              Tu ne recevras plus d&apos;emails marketing de notre part.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-ink mb-3">Lien invalide</h1>
            <p className="text-gray-500 leading-relaxed mb-8">
              Le lien de désinscription est invalide ou a expiré.
              Si tu souhaites te désinscrire, contacte-nous directement.
            </p>
          </>
        )}
        <Link
          href="/"
          className="inline-block bg-jungle-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-jungle-700 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
