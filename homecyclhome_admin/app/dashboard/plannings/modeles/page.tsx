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

    if (loading) {
        return <div>Chargement en cours...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div>
                <h1>Modèles</h1>
                {models.map((model) => (
                    <div key={model.id} onClick={() => setSelectedModel(model)}>
                        <h2>{model.name}</h2>
                        {selectedModel && selectedModel.id === model.id && (
                            <div>
                                {model.modeleInterventions.map((intervention) => (
                                    <div key={intervention.id}>
                                        <p>Heure: {new Date(intervention.interventionTime).toLocaleTimeString()}</p>
                                        <p>Type: {intervention.typeIntervention.nom}</p>
                                        <p>Durée: {new Date(intervention.typeIntervention.duree).toLocaleTimeString()}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
