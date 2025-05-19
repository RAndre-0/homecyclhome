'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AvailabilityCheck() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchSuggestions = async (text: string) => {
    if (text.length < 3) return;
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(text)}&limit=5`);
    const data = await res.json();
    setSuggestions(data.features);
  };

  const handleSelect = (label: string) => {
    setSelectedAddress(label);
    setQuery(label);
    setSuggestions([]);
    setMessage('');
  };

  const handleVerify = async () => {
    const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=1`);
    const data = await res.json();

    if (data.features && data.features.length > 0) {
      setSelectedAddress(data.features[0].properties.label);
      setMessage('✅ Adresse valide et reconnue.');
    } else {
      setSelectedAddress(null);
      setMessage("❌ Adresse introuvable.");
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-4">
            Vérifiez si nous desservons votre adresse
          </h2>

          <div className="relative">
            <Input
              type="text"
              placeholder="Entrez votre adresse"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                fetchSuggestions(e.target.value);
              }}
              className="mb-2"
            />

            {Array.isArray(suggestions) && suggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded shadow">
                {suggestions.map((s) => (
                  <li
                    key={s.properties.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleSelect(s.properties.label)}
                  >
                    {s.properties.label}
                  </li>
                ))}
              </ul>
            )}

          </div>

          <Button className="w-full mt-4 bg-green-500 hover:bg-green-600" onClick={handleVerify}>
            Vérifier
          </Button>

          {message && (
            <p className="text-center text-sm text-gray-700 mt-4">{message}</p>
          )}

          <p className="text-center text-sm text-gray-500 mt-3">
            Nous intervenons actuellement dans la majorité des zones urbaines et périurbaines.
          </p>
        </div>
      </div>
    </section>
  );
}
