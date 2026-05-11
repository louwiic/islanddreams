export default function ProduitsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Barre d'actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-9 w-64 bg-gray-100 rounded-lg" />
          <div className="flex gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-24 bg-gray-100 rounded-lg" />
          <div className="h-9 w-24 bg-jungle-100 rounded-lg" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Produit', 'Catégorie', 'Prix', 'Stock', 'Statut', ''].map((h) => (
                <th key={h} className="px-5 py-3 text-left">
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[...Array(8)].map((_, i) => (
              <tr key={i}>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-40 bg-gray-100 rounded" />
                      <div className="h-2.5 w-20 bg-gray-100 rounded" />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3"><div className="h-3 w-16 bg-gray-100 rounded" /></td>
                <td className="px-5 py-3"><div className="h-3 w-12 bg-gray-100 rounded" /></td>
                <td className="px-5 py-3"><div className="h-3 w-8 bg-gray-100 rounded" /></td>
                <td className="px-5 py-3"><div className="h-5 w-16 bg-gray-100 rounded-full" /></td>
                <td className="px-5 py-3"><div className="h-6 w-6 bg-gray-100 rounded-lg" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-5 py-3 border-t border-gray-100">
          <div className="h-3 w-24 bg-gray-100 rounded" />
        </div>
      </div>
    </div>
  );
}
