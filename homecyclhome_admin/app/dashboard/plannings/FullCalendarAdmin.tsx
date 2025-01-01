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

interface CalendarProps {
  selectedTechnicien: Technicien | null;
}

export default function FullCalendarAdmin({ selectedTechnicien }: CalendarProps) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);

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

  return (
    <FullCalendar
      plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
      initialView="timeGridWeek"
      weekends={false}
      events={interventions.map((intervention) => ({
        title: intervention.type_intervention.nom,
        start: intervention.debut,
        end: dayjs(intervention.debut)
          .add(dayjs(intervention.type_intervention.duree).get("minute"), "minute")
          .toISOString(),
        color: intervention.client ? "#3e69a0" : "#757575",
      }))}
      eventContent={renderEventContent}
      locale={frLocale}
      selectable={true}
      allDaySlot={false}
      slotMinTime={"09:00:00"}
      slotMaxTime={"18:00:00"}
      height={"100%"}
    />
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
