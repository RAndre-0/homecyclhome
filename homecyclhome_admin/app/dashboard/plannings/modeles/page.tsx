"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api-service";
import { TypeIntervention } from "@/types/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DeleteModelDialog } from "./DeleteModelDialog";

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
    const { toast } = useToast();

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
        return date.toISOString().substring(11, 16);
    };
    
    const deleteModel = async (id: number) => {
        try {
            await apiService(`modeles-planning/${id}`, "DELETE");
            setModels(models.filter((model) => model.id !== id));
            toast({ title: "Succès", description: "Modèle de planning supprimé avec succès." });
        } catch (error) {
            console.error("Erreur lors de la supression du modèle", error);
        }
    }

    if (loading) {
        return <div>Chargement en cours...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="p-5 border rounded-lg">
                <Button>Nouveau modèle</Button>
            </div>
            <div className="flex flex-row gap-5">
                <div className="p-5 w-1/3 border rounded-lg flex flex-col gap-5">
                    <h1>Modèles</h1>
                    {models.map((model) => (
                        <div className="flex items-center justify-between">
                            <Button key={model.id} onClick={() => setSelectedModel(model)}>{model.name}</Button>
                            <DeleteModelDialog modelId={model.id} onDelete={() => setModels(models.filter(m => m.id !== model.id))} />
                        </div>
                    ))}
                </div>
                <div className="w-2/3 p-5 border rounded-lg">
                    {selectedModel ? (
                        <div>
                            <h2>Détails du modèle: {selectedModel.name}</h2>
                            {selectedModel.modeleInterventions.map((intervention) => (
                                <div key={intervention.id} className={`mb-4 rounded-lg p-3 ${intervention.typeIntervention.nom === "Maintenance" ? "bg-emerald-400" : "bg-cyan-200"}`}>
                                    <p>Heure: {new Date(intervention.interventionTime).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</p>
                                    <p>Type: {intervention.typeIntervention.nom}</p>
                                    <p>Durée: {formatDuration(String(intervention.typeIntervention.duree))}</p>
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
