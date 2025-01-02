import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TechnicienMultiSelect from "./TechnicienMultiSelect";
import DateRangePicker from "./DateRangePicker";
import { Input } from "@/components/ui/input";
import { apiService } from "@/services/api-service";

export default function CreateInterventionsDialog({ techniciensList }: { techniciensList: { value: string; label: string }[] }) {
  const [selectedTechniciens, setSelectedTechniciens] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });
  const [planningModel, setPlanningModel] = useState<string>("");

  const handleCreate = async () => {
    try {
      await apiService("interventions/create", "POST", {
        techniciens: selectedTechniciens,
        dateRange,
        planningModel,
      });
      console.log("Interventions créées avec succès");
    } catch (error) {
      console.error("Erreur lors de la création des interventions", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Créer des interventions</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer des interventions</DialogTitle>
          <DialogDescription>
            Sélectionnez les techniciens, la plage de dates et un modèle de planning.
          </DialogDescription>
        </DialogHeader>
        <TechnicienMultiSelect techniciensList={techniciensList} onChange={setSelectedTechniciens} />
        <DateRangePicker value={dateRange} onChange={setDateRange} />
        <Input
          placeholder="Modèle de planning"
          value={planningModel}
          onChange={(e) => setPlanningModel(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={handleCreate}>Créer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
