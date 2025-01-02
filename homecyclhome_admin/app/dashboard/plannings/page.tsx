"use client";

import { useState, useEffect } from "react";
import FullCalendarAdmin from "./FullCalendarAdmin";
import TechnicienMultiSelect from "@/components/technicien-multi-select"; // Import du nouveau composant
import { Technicien } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiService } from "@/services/api-service";
import DeleteInterventionsDialog from "./DeleteInterventionsDialog";

export default function Plannings() {
  const [selectedTechnicien, setSelectedTechnicien] = useState<Technicien | null>(null);
  const [techniciensList, setTechniciensList] = useState<{ value: string; label: string }[]>([]);
  const [selectedTechniciens, setSelectedTechniciens] = useState<string[]>([]);

  // Récupération des techniciens depuis l'API
  useEffect(() => {
    const fetchTechniciens = async () => {
      try {
        const data = await apiService("users/ROLE_TECHNICIEN", "GET");
        const options = data.map((technicien: Technicien) => ({
          value: technicien.id.toString(),
          label: `${technicien.first_name} ${technicien.last_name}`,
        }));
        setTechniciensList(options);
      } catch (error) {
        console.error("Erreur lors de la récupération des techniciens", error);
      }
    };
    fetchTechniciens();
  }, []);

  // Fonction pour sauvegarder les techniciens sélectionnés
  const handleSave = () => {
    console.log("Techniciens sélectionnés :", selectedTechniciens);
    // Vous pouvez envoyer la requête ici avec `selectedTechniciens`
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <Label>Techniciens</Label>
          <TechnicienMultiSelect
            onChange={setSelectedTechniciens} // Passage de la fonction onChange
            maxCount={5} // Limite à 5 techniciens sélectionnés
          />
        </div>
        <Button variant="default" onClick={handleSave} className="w-full">
          Sauvegarder les techniciens
        </Button>
      </div>
      <DeleteInterventionsDialog />
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Créer des interventions</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle>Créer des interventions</DialogTitle>
            <DialogDescription>
              Faites des changements ici. Cliquez sur sauvegarder quand c'est fini.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input id="name" value="Pedro Duarte" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Nom d'utilisateur
              </Label>
              <Input id="username" value="@peduarte" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <FullCalendarAdmin selectedTechnicien={selectedTechnicien} />
    </>
  );
}
