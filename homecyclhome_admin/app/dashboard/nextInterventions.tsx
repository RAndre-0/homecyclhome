"use client"

import { useEffect, useState } from "react"
import { apiService } from "@/services/api-service"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface NextIntervention {
    intervention_id: number;
    adresse: string;
    debut: string;
    fin: string;
    technicien_prenom: string;
    technicien_nom: string;
    type_intervention: string;
}

export function NextInterventions() {
    const [loading, setLoading] = useState(true);
    const [interventions, setInterventions] = useState<NextIntervention[]>([]);
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchInterventions = async () => {
            try {
                setLoading(true);
                const data = await apiService("interventions/next-interventions", "GET");
                setInterventions(data);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                console.error("Erreur lors du chargement des interventions:", err);
            }
        };

        fetchInterventions();
    }, []);

    if (loading) {
        return (
            <Card>
            <CardHeader>
              <CardTitle>Chargement des interventions...</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Chargement en cours...</div>
            </CardContent>
          </Card>
        )
    }

    if (error) {
        return (
          <Card>
            <CardHeader>
              <CardTitle>Erreur</CardTitle>
            </CardHeader>
            <CardContent>
              <div>{error}</div>
            </CardContent>
          </Card>
        )
      }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Prochaines interventions</CardTitle>
            </CardHeader>
            <CardContent>
                <ul>
                    {interventions.map((intervention) => (
                        <div key={intervention.intervention_id} className={`mb-4 rounded-lg p-3 border-x-4 flex flex-row justify-between ${intervention.type_intervention === "Maintenance" ? "border-emerald-400" : "border-cyan-200"}`}>
                            <div>
                                <p><strong>{intervention.type_intervention}</strong></p>
                                <p>{intervention.technicien_prenom} {intervention.technicien_nom}</p>
                                <p>{intervention.adresse}</p>
                                <p>{new Date(intervention.debut).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
