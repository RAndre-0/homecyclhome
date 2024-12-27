"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from '@fullcalendar/core/locales/fr';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid'
import { useState, useEffect } from "react";
import { apiService } from "@/services/api-service";
import { Technicien, Intervention } from "@/types/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import dayjs from 'dayjs';

const events = [{ title: "Intervention", start: new Date("2024-12-24, 16:00:00") }];

export default function Calendar() {
    const [techniciens, setTechniciens] = useState<Technicien[]>([]); // Liste des techniciens
    const [selectedTechnicien, setSelectedTechnicien] = useState<Technicien | null>(null); // Technicien sélectionné
    const [interventions, setInterventions] = useState<Intervention[]>([]); // Liste des événements à afficher sur le calendrier

    // Récupérer la liste des techniciens
    useEffect(() => {
        const fetchTechniciens = async () => {
            try {
                const data = await apiService("users/ROLE_TECHNICIEN", 'GET');
                setTechniciens(data);
            } catch (error) {
                console.error("Erreur lors de la récupération des techniciens", error);
            }
        };
        fetchTechniciens();
    }, []);

    // Récupérer les interventions d'un technicien
    useEffect(() => {
        if (selectedTechnicien) {
            const fetchInterventions = async () => {
                try {
                    const data = await apiService(`interventions/technicien/${selectedTechnicien.id}`, 'GET');
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

    const handleTechnicienChange = (value: string) => {
        const technicienIdInt = parseInt(value, 10); // Convertir la valeur en entier
        const technicien = techniciens.find(t => t.id === technicienIdInt);
        setSelectedTechnicien(technicien || null); // Mettre à jour l'état avec le technicien trouvé ou null
    };
    console.log("INTERVENTIONS : ")
    console.log(interventions);

    return (
        <>
            <Select onValueChange={handleTechnicienChange} value={selectedTechnicien?.id ?? "default"}>
                <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Technicien" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="default" disabled>
                        Sélectionner un technicien
                    </SelectItem>
                    {techniciens.map((technicien) => (
                        <SelectItem key={technicien.id} value={technicien.id}>
                            {technicien.first_name} {technicien.last_name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <FullCalendar
                plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                initialView="timeGridWeek"
                weekends={false}
                events={interventions.map(intervention => ({
                    title: intervention.type_intervention.nom,
                    start: intervention.debut,
                    end: dayjs(intervention.debut).add(dayjs(intervention.type_intervention.duree).get('minute'), 'minute').toISOString(),
                    color: intervention.client ? '#3e69a0' : '#757575'
                }))}
                eventContent={renderEventContent}
                locale={frLocale}
                selectable={true}
                dateClick={getInfo}
                allDaySlot={false}
                slotMinTime={"09:00:00"}
                slotMaxTime={"18:00:00"}
                height={"100%"}
                eventClick={eventClick}
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

function getInfo(info) {
    alert(
        'Clicked on: ' + info.dateStr + '\n' +
        'Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY + '\n' +
        'Current view: ' + info.view.type
    );
}

function eventClick(info) {
    alert('Event: ' + info.event.title);
    console.log(info);
    console.log(info.event._instance.range.start.getHours());


    // change the border color just for fun
    info.el.style.borderColor = 'red';
}
