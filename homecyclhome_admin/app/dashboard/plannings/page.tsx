"use client";

import { useState } from "react";
import FullCalendarAdmin from "./FullCalendarAdmin";
import TechnicienSelector from "@/components/technicien-selector";
import { Technicien } from "@/types/types";


export default function Plannings() {
  const [selectedTechnicien, setSelectedTechnicien] = useState<Technicien | null>(null);
  const [date, setDate] = useState<Date>()

  return (
    <>
      <TechnicienSelector onTechnicienChange={setSelectedTechnicien} />
      <FullCalendarAdmin selectedTechnicien={selectedTechnicien} />
    </>
  );
}
