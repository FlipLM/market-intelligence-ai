'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AutoDiscoverDfButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDiscover = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/niches/discover-region', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: 'DF' }),
      });
      const data = await res.json();
      if (data.success) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDiscover}
      disabled={loading}
      className="inline-flex items-center justify-center gap-2 h-9 px-3.5 rounded-md bg-[#ededed] hover:bg-white text-[#0c0d0e] font-medium text-xs transition duration-150 cursor-pointer disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0c0d0e]" />
          <span>Pesquisando DF...</span>
        </>
      ) : (
        <span>Analisar Nichos do DF</span>
      )}
    </button>
  );
}
