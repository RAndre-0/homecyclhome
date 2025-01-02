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
import CreateInterventionsDialog from "./CreateInterventionsDialog";
import TechnicienSelector from "@/components/technicien-selector";

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

  return (
    <>
      <div className="flex justify-between">
        <TechnicienSelector onTechnicienChange={setSelectedTechnicien} />
          <div className="flex gap-5">
            <DeleteInterventionsDialog />
            <CreateInterventionsDialog />
          </div>
      </div>
      <FullCalendarAdmin selectedTechnicien={selectedTechnicien} />
    </>
  );
}
