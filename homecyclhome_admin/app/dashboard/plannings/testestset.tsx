"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from "@fullcalendar/core/locales/fr";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useState, useEffect } from "react";
import { apiService } from "@/services/api-service";

// Interface pour un technicien
interface Technicien {
    id: number;
    first_name: string;
    last_name: string;
}

// Interface pour une intervention
interface Intervention {
    id: number;
    debut: string; // Date de début au format ISO
    type_intervention: { nom: string };
    technicien: { id: number };
}

// Fonction principale du calendrier
export default function Calendar() {
    const [techniciens, setTechniciens] = useState<Technicien[]>([]); // Liste des techniciens
    const [selectedTechnicien, setSelectedTechnicien] = useState<number | null>(null); // Technicien sélectionné
    const [events, setEvents] = useState<any[]>([]); // Liste des événements à afficher sur le calendrier

    // Récupérer la liste des techniciens
    useEffect(() => {
        const fetchTechniciens = async () => {
            try {
                const data = await apiService("users/ROLE_TECHNICIEN", 'GET');
                setTechniciens(data); // Remplir la liste des techniciens
            } catch (error) {
                console.error("Erreur lors de la récupération des techniciens", error);
            }
        };

        fetchTechniciens();
    }, []);

    // Récupérer les interventions d'un technicien sélectionné
    const fetchInterventions = async (technicienId: number) => {
        try {
            const data = await apiService(`interventions/technicien/${technicienId}`, 'GET');
            const formattedEvents = data.map((intervention: Intervention) => ({
                title: `${intervention.type_intervention.nom} (${intervention.debut})`,
                start: intervention.debut,
                extendedProps: {
                    technicienId: intervention.technicien.id,
                },
            }));
            setEvents(formattedEvents); // Mettre à jour les événements du calendrier
        } catch (error) {
            console.error("Erreur lors de la récupération des interventions", error);
        }
    };

    // Gérer le changement de technicien
    const handleTechnicienChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const technicienId = Number(event.target.value);
        setSelectedTechnicien(technicienId);

        if (technicienId) {
            fetchInterventions(technicienId); // Récupérer les interventions du technicien sélectionné
        } else {
            setEvents([]); // Vider le calendrier si aucun technicien n'est sélectionné
        }
    };

    return (
        <div>
            <select onChange={handleTechnicienChange} value={selectedTechnicien ?? ""}>
                <option value="">Sélectionner un technicien</option>
                {techniciens.map((technicien) => (
                    <option key={technicien.id} value={technicien.id}>
                        {technicien.first_name} {technicien.last_name}
                    </option>
                ))}
            </select>

            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                weekends={false}
                events={events}
                eventContent={renderEventContent}
                locale={frLocale}
                selectable={true}
                dateClick={getInfo}
                allDaySlot={false}
                slotMinTime={"08:00:00"}
                slotMaxTime={"20:00:00"}
                height={"100%"}
                eventClick={eventClick}
            />
        </div>
    );
}

// Rendu du contenu des événements dans le calendrier
function renderEventContent(eventInfo: any) {
    return (
        <>
            <b>{eventInfo.timeText}</b>
            <i>{eventInfo.event.title}</i>
        </>
    );
}

// Gérer le clic sur une date du calendrier
function getInfo(info: any) {
    alert(
        'Clicked on: ' + info.dateStr + '\n' +
        'Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY + '\n' +
        'Current view: ' + info.view.type
    );
}

// Gérer le clic sur un événement
function eventClick(info: any) {
    alert('Event: ' + info.event.title);
    console.log(info);
    console.log(info.event._instance.range.start.getHours());

    // Modifier la couleur de la bordure de l'événement
    info.el.style.borderColor = 'red';
}
