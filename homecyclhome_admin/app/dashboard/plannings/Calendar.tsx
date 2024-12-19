"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import frLocale from '@fullcalendar/core/locales/fr';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid'

const events = [{ title: "Intervention", start: new Date("2024-12-19, 19:00:00") }];

export default function Calendar() {
    return (
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
}

function eventClick(info) {
    alert('Event: ' + info.event.title);
    console.log(info);
    console.log(info.event._instance.range.start.getHours());
    

    // change the border color just for fun
    info.el.style.borderColor = 'red';
  }
