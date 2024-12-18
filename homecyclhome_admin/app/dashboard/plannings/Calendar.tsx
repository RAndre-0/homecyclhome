"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from '@fullcalendar/core/locales/fr';
import interactionPlugin from '@fullcalendar/interaction';

const events = [{ title: "Intervention", start: new Date() }];

export default function Calendar() {
    return (
        <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            weekends={false}
            events={events}
            eventContent={renderEventContent}
            locale={frLocale}
            selectable={true}
            dateClick={getInfo}
        />
    );
}

function renderEventContent(eventInfo: any) {
    return (
        <>
            <b>{eventInfo.timeText}</b>
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

    alert('Current view: ' + info.view.type);
}
