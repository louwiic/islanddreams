export default function BoutiqueLoading() {
  return (
    <main>
      <div className="bg-jungle-800 pt-24 pb-4" />

      <div className="pb-16 px-4 pt-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          {/* Titre skeleton */}
          <div className="flex justify-center mb-8">
            <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          {/* Barre filtres skeleton */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div className="h-10 w-full md:w-72 bg-gray-200 rounded-xl animate-pulse" />
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
          </div>

          {/* Catégories skeleton */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-24 bg-gray-200 rounded-full animate-pulse" />
            ))}
          </div>

          {/* Grille produits skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-xl bg-gray-200 mb-3" />
                <div className="h-3 w-16 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded mb-1" />
                <div className="h-4 w-2/3 bg-gray-200 rounded mb-2" />
                <div className="h-5 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
