"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from '@fullcalendar/core/locales/fr';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useState, useEffect } from "react";
import { apiService } from "@/services/api-service";
import { Technicien, Intervention } from "@/types/types";
import { useCookies } from "react-cookie";
import jwt from "jsonwebtoken";
import dayjs from 'dayjs';

export default function Calendar() {
    const [interventions, setInterventions] = useState<Intervention[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [cookies] = useCookies(["token"]);

    // Récupération de l'id utilisateur
    useEffect(() => {
        const fetchUserId = () => {
          try {
            const token = cookies.token;
            if (!token) {throw new Error("Token non trouvé");}
            const { id } = jwt.decode(token) as { id: string };
            if (!id) {throw new Error("ID utilisateur introuvable");}
            setUserId(id);
          } catch (error) {console.error("Erreur lors de la récupération de l'ID utilisateur :", error);}
        };
    
        fetchUserId();
      }, [cookies.token]);

    // Récupération des interventions du technicien
    useEffect(() => {
        const fetchInterventions = async () => {
          if (!userId) return; // Ne pas lancer la requête tant que l'id utilisateur est absent
          try {
            const data = await apiService(`interventions/technicien/${userId}`, "GET");
            setInterventions(data);
          } catch (error) {
            console.error("Erreur lors de la récupération des interventions :", error);
          }
        };
    
        fetchInterventions();
      }, [userId]);

    return (
        <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
        initialView="timeGridDay"
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