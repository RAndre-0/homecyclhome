"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from '@fullcalendar/core/locales/fr';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useState, useEffect } from "react";
import { apiService } from "@/services/api-service";
import { Technicien, Intervention } from "@/types/types";

export default function Calendar() {
    const [interventions, setInterventions] = useState<Intervention[]>([]);

        // Récupérer les interventions du technicien
        useEffect(() => {
            const fetchInterventions = async () => {
                try {
                    const data = await apiService(`interventions/technicien/${selectedTechnicien.id}`, 'GET');
                    setInterventions(data);
                } catch (error) {
                    console.error("Erreur lors de la récupération des interventions", error);
                }
            };
            fetchInterventions();
        }, []);

    return (
        <h1>CALENDAR</h1>
    );
}