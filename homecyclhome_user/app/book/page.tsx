'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { fetchAddressCoordinates } from '@/services/banService';
import { apiService } from '@/services/api-service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

interface DecodedToken {
    id: number;
    exp: number;
}

export default function BookPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [message, setMessage] = useState('');
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

    useEffect(() => {
        const token = getCookie('token') as string | undefined;
        if (!token) return;

        try {
            const decoded = jwtDecode<DecodedToken>(token);
            setUserId(decoded.id);
        } catch {
            setUserId(null);
        }
    }, []);

    const fetchSuggestions = async (text: string) => {
        if (text.length < 3) return;

        try {
            const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(text)}&limit=5`);
            const data = await res.json();
            setSuggestions(Array.isArray(data.features) ? data.features : []);
        } catch (error) {
            console.error('Erreur BAN :', error);
            setSuggestions([]);
        }
    };

    const handleSelect = (label: string) => {
        setQuery(label);
        setSuggestions([]);
        setMessage('');
    };

    const handleCheckAddress = async () => {
        setLoading(true);
        setMessage('');
        setSlots([]);

        try {
            const { lat, lon } = await fetchAddressCoordinates(query);

            const result = await apiService('zones/check', 'POST', {
                latitude: lat,
                longitude: lon,
            }, false);

            if (!result.covered) {
                setMessage('❌ Nous ne couvrons pas cette adresse.');
                return;
            }

            setMessage('✅ Cette adresse est couverte ! Chargement des créneaux...');
            const slotData = await apiService(`interventions/available/${result.technicien_id}`, 'GET', undefined, true);
            setSlots(slotData);
            setMessage('✅ Cette adresse est couverte !');
        } catch (err) {
            setMessage('❌ Erreur lors de la vérification.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center text-center px-4">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Connexion requise</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4">Vous devez être connecté pour faire une demande d’intervention à domicile.</p>
                        <Button onClick={() => router.push('/login')}>Se connecter</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Grouper les créneaux par jour
    const groupedSlots = slots.reduce((acc: Record<string, any[]>, slot: any) => {
        const date = new Date(slot.debut).toISOString().split('T')[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(slot);
        return acc;
    }, {});

    return (
        <div className="max-w-xl mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Nouvelle demande d’intervention</h1>

            <div className="relative">
                <Input
                    placeholder="Entrez votre adresse"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        fetchSuggestions(e.target.value);
                    }}
                />
                {suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border rounded shadow max-h-60 overflow-auto">
                        {suggestions.map((s) => (
                            <li
                                key={s.properties.id}
                                onClick={() => handleSelect(s.properties.label)}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            >
                                {s.properties.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Button className="mt-4 w-full" onClick={handleCheckAddress} disabled={loading}>
                {loading ? 'Vérification...' : "Vérifier l'adresse"}
            </Button>

            {message && <p className="mt-4 text-sm text-center">{message}</p>}

            {slots.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-4">Créneaux disponibles</h2>
                    <Accordion type="single" collapsible>
                        {Object.entries(groupedSlots).map(([dateStr, daySlots]) => {
                            const formattedDate = new Date(dateStr).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                            });

                            return (
                                <AccordionItem key={dateStr} value={dateStr}>
                                    <AccordionTrigger>{formattedDate}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {daySlots.map((s) => {
                                                const timeLabel = new Date(s.debut).toLocaleTimeString('fr-FR', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                });
                                                const isSelected = selectedSlotId === s.id;

                                                return (
                                                    <button
                                                        key={s.id}
                                                        onClick={() => setSelectedSlotId(s.id)}
                                                        className={`p-2 border rounded text-sm transition-colors duration-200 ${isSelected
                                                                ? 'bg-green-100 border-green-500'
                                                                : 'bg-white hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        {timeLabel}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>

                    {selectedSlotId && (
                        <p className="mt-4 text-sm text-center text-green-600">
                            Créneau sélectionné :{' '}
                            {new Date(slots.find((s) => s.id === selectedSlotId)?.debut).toLocaleString('fr-FR')}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
