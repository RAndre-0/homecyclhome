"use client";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api-service";
import { TypeIntervention } from "@/types/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { DeleteModelDialog } from "./DeleteModelDialog";
import { X, Clock, Timer } from "lucide-react";

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
    const [newModelName, setNewModelName] = useState("");
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

    const createModel = async () => {
        if (newModelName.length > 2) {
            try {
                const newModel = await apiService("modeles-planning", "POST", { name: newModelName });
                setModels([...models, newModel]);
                setNewModelName("");
                toast({ title: "Succès", description: "Modèle créé avec succès." });
            } catch (error) {
                toast({ title: "Erreur", description: "Échec de la création du modèle." });
            }
        } else {
            toast({ title: "Erreur", description: "3 caractères minimum." });
        }
    };

    const removeIntervention = async (interventionId: number) => {
        try {
            await apiService(`modele-interventions/${interventionId}`, "DELETE");
    
            if (selectedModel) {
                const updatedInterventions = selectedModel.modeleInterventions.filter(
                    (intervention) => intervention.id !== interventionId
                );
    
                setSelectedModel({ ...selectedModel, modeleInterventions: updatedInterventions });
    
                setModels(models.map(model => 
                    model.id === selectedModel.id 
                        ? { ...model, modeleInterventions: updatedInterventions } 
                        : model
                ));
            }
    
            toast({ title: "Succès", description: "Intervention supprimée avec succès." });
        } catch (error) {
            toast({ title: "Erreur", description: "Échec de la suppression de l'intervention." });
        }
    };
    

    if (loading) {
        return <div>Chargement en cours...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="p-5 border rounded-lg">
                <input type="text" value={newModelName} onChange={(e) => setNewModelName(e.target.value)} placeholder="Nom du modèle" className="border p-2 me-5" />
                <Button onClick={createModel}>Nouveau modèle</Button>
            </div>
            <div className="flex flex-row gap-5">
                <div className="p-5 w-1/3 border rounded-lg flex flex-col gap-5">
                    <h1 className="border-b pb-2 text-3xl font-semibold">Modèles</h1>
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
                            <h2 className="border-b pb-2 text-3xl font-semibold mb-4">Interventions du modèle: {selectedModel.name}</h2>
                            {selectedModel.modeleInterventions.map((intervention) => (
                                <div key={intervention.id} className={`mb-4 rounded-lg p-3 border-x-4 flex flex-row justify-between ${intervention.typeIntervention.nom === "Maintenance" ? "border-emerald-400" : "border-cyan-200"}`}>
                                    <div>
                                        <p>{intervention.typeIntervention.nom}</p>
                                        <div className="flex">
                                            <div className="flex items-center justify-start mr-4">
                                                <Clock className="mr-2" />
                                                <p>{new Date(intervention.interventionTime).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                            <div className="flex items-center justify-start">
                                                <Timer className="mr-2" />
                                                <p>{formatDuration(String(intervention.typeIntervention.duree))}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <X className="cursor-pointer" onClick={() => removeIntervention(intervention.id)}></X>
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
