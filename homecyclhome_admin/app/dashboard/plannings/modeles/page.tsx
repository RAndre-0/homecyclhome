"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api-service";
import { TypeIntervention } from "@/types/types";

interface InterventionModel {
    id: number;
    interventionTime: string;
    typeIntervention: TypeIntervention;
}

interface Model {
    id: number;
    name: string;
    modeleInterventions: InterventionModel[];
}

export default function ModelesDePlanning() {
    const [selectedModel, setSelectedModel] = useState<Model | null>(null);
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const data = await apiService("modeles-planning", "GET");
                const detailedModels = await Promise.all(
                    data.map(async (model: { id: number; name: string }) => {
                        const detailedModel = await apiService(`modeles-planning/${model.id}`, "GET");
                        return detailedModel;
                    })
                );
                setModels(detailedModels);
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des interventions", error);
                setError("Erreur lors de la récupération des interventions");
                setLoading(false);
            }
        };
        fetchModels();
    }, []);

    const formatDuration = (duration: string) => {
        const date = new Date(duration);
        if (isNaN(date.getTime())) {
            return "Durée invalide";
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <div>Chargement en cours...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-row gap-5">
                <div className="p-5 w-1/3 border rounded-lg">
                    <h1>Modèles</h1>
                    {models.map((model) => (
                        <div key={model.id} onClick={() => setSelectedModel(model)} className="cursor-pointer">
                            <h2>{model.name}</h2>
                        </div>
                    ))}
                </div>
                <div className="w-2/3 p-5 border rounded-lg">
                    {selectedModel ? (
                        <div>
                            <h2>Détails du modèle: {selectedModel.name}</h2>
                            {selectedModel.modeleInterventions.map((intervention) => (
                                <div key={intervention.id} className="mb-4">
                                    {/* <p>Heure: {new Date(intervention.interventionTime).toLocaleTimeString()}</p> */}
                                    <p>Heure: {new Date(intervention.interventionTime).toLocaleTimeString()}</p>
                                    <p>Type: {intervention.typeIntervention.nom}</p>
                                    <p>Durée: {formatDuration(intervention.typeIntervention.duree)}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Sélectionnez un modèle pour voir les détails</p>
                    )}
                </div>
            </div>
        </div>
    );
}
