"use client";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMemo } from 'react';

// Setup the localizer by providing the moment (or globalize) instance
// to the localizer accessor.
const localizer = momentLocalizer(moment);

interface Interview {
    id: string;
    candidatureId: string;
    interviewerId?: string;
    date: string;
    mode: string;
    type: string;
    status: string;
    result: string;
    notes?: string;
    interviewerName?: string;
    candidateFirstName?: string;
    candidateLastName?: string;
    appliedPosition?: string;
    // Optional opinion fields
    hrOpinion?: string;
    technicalOpinion?: string;
}

interface InterviewCalendarProps {
    interviews: Interview[];
}

export function InterviewCalendar({ interviews }: InterviewCalendarProps) {
    const events = useMemo(() => {
        return interviews.map(interview => {
            const startDate = new Date(interview.date);
            // Assuming interviews last 1 hour by default if no end time is provided
            const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

            return {
                id: interview.id,
                title: `${interview.candidateFirstName} ${interview.candidateLastName} - ${interview.type}`,
                start: startDate,
                end: endDate,
                resource: interview,
                allDay: false
            };
        });
    }, [interviews]);

    const eventStyleGetter = (event: any, start: Date, end: Date, isSelected: boolean) => {
        let backgroundColor = '#3B82F6'; // Default Blue
        if (event.resource.status === 'Completed') {
            if (event.resource.result === 'Passed') backgroundColor = '#10B981'; // Green
            else if (event.resource.result === 'Failed') backgroundColor = '#EF4444'; // Red
            else backgroundColor = '#6B7280'; // Gray
        } else if (event.resource.status === 'Cancelled') {
            backgroundColor = '#EF4444'; // Red
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <div className="h-[600px] w-full bg-white/5 p-4 rounded-xl border border-white/10 text-white">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day', 'agenda']}
                defaultView="month"
                popup
                selectable
                onSelectEvent={(event) => alert(
                    `Candidate: ${event.resource.candidateFirstName} ${event.resource.candidateLastName}\n` +
                    `Interviewer: ${event.resource.interviewerName || 'Unassigned'}\n` +
                    `Type: ${event.resource.type}\n` +
                    `Mode: ${event.resource.mode}\n` +
                    `Status: ${event.resource.status}`
                )}
            />
            {/* Custom CSS overrides for dark mode compatibility if needed */}
            <style jsx global>{`
                .rbc-calendar {
                    color: #d1d5db; /* gray-300 */
                }
                .rbc-toolbar-label {
                    color: white;
                    font-weight: bold;
                }
                .rbc-btn-group button {
                    color: white;
                    background-color: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .rbc-btn-group button:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }
                .rbc-btn-group button.rbc-active {
                    background-color: rgba(255, 255, 255, 0.3);
                    box-shadow: none;
                }
                .rbc-off-range-bg {
                    background-color: rgba(255, 255, 255, 0.05);
                }
                .rbc-today {
                    background-color: rgba(59, 130, 246, 0.1);
                }
                .rbc-header {
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }
                .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .rbc-day-bg {
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                }
                .rbc-month-row {
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </div>
    );
}
