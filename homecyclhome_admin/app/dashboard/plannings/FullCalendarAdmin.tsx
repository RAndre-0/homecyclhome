"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from "@fullcalendar/core/locales/fr";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useEffect, useState } from "react";
import { apiService } from "@/services/api-service";
import { Intervention, Technicien } from "@/types/types";
import dayjs from "dayjs";
import InterventionDetailsDialog from './InterventionDetailsDialog';

interface CalendarProps {
  selectedTechnicien: Technicien | null;
}

export default function FullCalendarAdmin({ selectedTechnicien }: CalendarProps) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  // Récupérer les interventions d'un technicien
  useEffect(() => {
    if (selectedTechnicien) {
      const fetchInterventions = async () => {
        try {
          const data = await apiService(
            `interventions/technicien/${selectedTechnicien.id}`,
            "GET"
          );
          setInterventions(data);
        } catch (error) {
          console.error("Erreur lors de la récupération des interventions", error);
        }
      };
      fetchInterventions();
    } else {
      setInterventions([]);
    }
  }, [selectedTechnicien]);

  const handleEventClick = (info: any) => {
    info.jsEvent.preventDefault(); // Empêche la navigation par défaut
    const clickedIntervention = interventions.find(intervention => intervention.id === parseInt(info.event.id));
    if (clickedIntervention) {
        setSelectedIntervention(clickedIntervention);
        setDialogOpen(true);
    }
};

  return (
    <>
    <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="timeGridWeek"
        weekends={false}
        events={interventions.map((intervention) => ({
            id: intervention.id.toString(),
            title: intervention.type_intervention?.nom ?? 'Intervention',
            start: intervention.debut,
            end: dayjs(intervention.debut)
                .add(dayjs(intervention.type_intervention?.duree ?? 'PT0M').get("minute"), "minute")
                .toISOString(),
            color: intervention.client ? "#3e69a0" : "#757575",
        }))}
        eventClick={handleEventClick}
        locale={frLocale}
        selectable={true}
        allDaySlot={false}
        slotMinTime={"09:00:00"}
        slotMaxTime={"18:00:00"}
        height={"100%"}
    />
    <InterventionDetailsDialog
        intervention={selectedIntervention}
        isOpen={isDialogOpen}
        onClose={() => setDialogOpen(false)}
    />
</>
  );
}

function renderEventContent(eventInfo: any) {
  return (
    <>
      <b>{eventInfo.timeText}</b>
      <br />
      <i>{eventInfo.event.title}</i>
    </>
  );
}
