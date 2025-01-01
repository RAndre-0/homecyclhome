"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { apiService } from "@/services/api-service";
import { Technicien } from "@/types/types";

interface TechnicienSelectorProps {
  onTechnicienChange: (technicien: Technicien | null) => void;
}

export default function TechnicienSelector({ onTechnicienChange }: TechnicienSelectorProps) {
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
  const [selectedTechnicienId, setSelectedTechnicienId] = useState<string>("default");

  useEffect(() => {
    const fetchTechniciens = async () => {
      try {
        const data = await apiService("users/ROLE_TECHNICIEN", "GET");
        setTechniciens(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des techniciens", error);
      }
    };
    fetchTechniciens();
  }, []);

  const handleSelectChange = (value: string) => {
    setSelectedTechnicienId(value);
    const technicien = techniciens.find((t) => t.id === parseInt(value, 10));
    onTechnicienChange(technicien || null);
  };

  return (
    <Select onValueChange={handleSelectChange} value={selectedTechnicienId}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Technicien" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="default" disabled>
          Sélectionner un technicien
        </SelectItem>
        {techniciens.map((technicien) => (
          <SelectItem key={technicien.id} value={technicien.id.toString()}>
            {technicien.first_name} {technicien.last_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
