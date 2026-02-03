"use client";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMemo, useState } from 'react';
import { Clock, X } from 'lucide-react';
import { clsx } from 'clsx';

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

import { View } from 'react-big-calendar';

export function InterviewCalendar({ interviews }: InterviewCalendarProps) {
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());

    const events = useMemo(() => {
        return interviews.map(interview => {
            const startDate = new Date(interview.date);
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

    const eventStyleGetter = (event: any) => {
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
                borderRadius: '6px',
                opacity: 0.9,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '0.8rem',
                padding: '2px 4px'
            }
        };
    };

    const handleSelectSlot = (slotInfo: { start: Date, action: string }) => {
        // If user clicks on a day (not dragging), switch to day view for that day
        if (slotInfo.action === 'click') {
            setDate(slotInfo.start);
            setView('day');
        }
    };

    const handleSelectEvent = (event: any) => {
        setSelectedInterview(event.resource);
    };

    return (
        <div className="h-[750px] w-full bg-gradient-to-br from-slate-900/50 via-blue-900/20 to-purple-900/30 backdrop-blur-sm p-8 rounded-3xl border border-white/10 text-foreground flex flex-col gap-6 shadow-2xl relative overflow-hidden group">
            {/* Animated background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Floating particles */}
            <div className="absolute top-10 left-10 w-3 h-3 bg-blue-400/20 rounded-full animate-pulse" />
            <div className="absolute top-20 right-20 w-2 h-2 bg-purple-400/20 rounded-full animate-pulse delay-300" />
            <div className="absolute bottom-20 left-20 w-2.5 h-2.5 bg-pink-400/20 rounded-full animate-pulse delay-700" />

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day', 'agenda']}
                view={view}
                date={date}
                onNavigate={setDate}
                onView={setView}
                popup
                selectable
                onSelectEvent={handleSelectEvent}
                onSelectSlot={handleSelectSlot}
                className="font-medium relative z-10"
            />

            {/* Enhanced CSS overrides for beautiful calendar styling */}
            <style jsx global>{`
                /* Calendar container */
                .rbc-calendar {
                    color: inherit;
                    font-family: inherit;
                }
                
                /* Toolbar styling */
                .rbc-toolbar {
                    padding: 1rem;
                    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
                    border-radius: 1rem;
                    margin-bottom: 1.5rem;
                    border: 1px solid rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                }
                
                .rbc-toolbar button {
                    color: inherit;
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 0.5rem;
                    padding: 0.5rem 1rem;
                    transition: all 0.3s ease;
                    font-weight: 500;
                    background: rgba(255,255,255,0.05);
                }
                
                .rbc-toolbar button:hover {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
                    border-color: rgba(59, 130, 246, 0.5);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }
                
                .rbc-toolbar button.rbc-active {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3));
                    color: #60a5fa;
                    font-weight: bold;
                    border-color: rgba(59, 130, 246, 0.6);
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
                }
                
                /* Toolbar label (current month/week) */
                .rbc-toolbar-label {
                    font-size: 1.25rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #60a5fa, #a78bfa);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                
                /* Month view grid */
                .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    border-radius: 1rem;
                    overflow: hidden;
                    background: rgba(255,255,255,0.02);
                    backdrop-filter: blur(10px);
                }
                
                /* Header cells (day names) */
                .rbc-header {
                    border-bottom: 2px solid rgba(59, 130, 246, 0.3) !important;
                    background: linear-gradient(180deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
                    padding: 1rem 0.5rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    font-size: 0.75rem;
                    letter-spacing: 0.1em;
                    color: #93c5fd;
                }
                
                /* Day cells */
                .rbc-day-bg {
                    border-color: rgba(255,255,255,0.08) !important;
                    transition: all 0.3s ease;
                }
                
                .rbc-day-bg:hover {
                    background: rgba(59, 130, 246, 0.05);
                }
                
                /* Today highlight */
                .rbc-today {
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15)) !important;
                    position: relative;
                }
                
                .rbc-today::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #60a5fa, #a78bfa);
                    animation: pulse 2s ease-in-out infinite;
                }
                
                /* Date numbers */
                .rbc-date-cell {
                    padding: 0.5rem;
                    text-align: right;
                }
                
                .rbc-date-cell button {
                    font-weight: 600;
                    color: inherit;
                    transition: all 0.2s ease;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.5rem;
                }
                
                .rbc-date-cell button:hover {
                    background: rgba(59, 130, 246, 0.2);
                    transform: scale(1.1);
                }
                
                .rbc-now .rbc-date-cell button {
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    color: white;
                    font-weight: 700;
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
                    animation: pulse 2s ease-in-out infinite;
                }
                
                /* Off-range dates (other months) */
                .rbc-off-range-bg {
                    background-color: rgba(0,0,0,0.1);
                    opacity: 0.4;
                }
                
                .rbc-off-range .rbc-date-cell button {
                    opacity: 0.3;
                }
                
                /* Events */
                .rbc-event {
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    border-radius: 0.5rem !important;
                    padding: 0.25rem 0.5rem;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }
                
                .rbc-event:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
                }
                
                /* Time view styling */
                .rbc-time-content, .rbc-timeslot-group {
                    border-color: rgba(255,255,255,0.08) !important;
                }
                
                .rbc-time-slot {
                    border-top: 1px solid rgba(255,255,255,0.05) !important;
                }
                
                .rbc-current-time-indicator {
                    background-color: #ef4444;
                    height: 2px;
                }
                
                /* Agenda view */
                .rbc-agenda-view table {
                    border-color: rgba(255,255,255,0.1) !important;
                }
                
                .rbc-agenda-date-cell, .rbc-agenda-time-cell {
                    padding: 1rem;
                    font-weight: 600;
                }
                
                .rbc-agenda-event-cell {
                    padding: 0.75rem;
                }
                
                /* Pulse animation */
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }
            `}</style>

            {/* Detail Modal */}
            {selectedInterview && (
                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedInterview(null)}>
                    <div className="modal-card w-full max-w-md p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
                        <div className="px-6 py-6 gradient-premium flex justify-between items-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="p-2.5 bg-white/20 rounded-xl text-white shadow-inner">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">
                                    Interview Details
                                </h2>
                            </div>
                            <button onClick={() => setSelectedInterview(null)} className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all relative z-10">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl ring-1 ring-primary/20 shadow-inner">
                                    {selectedInterview.candidateFirstName?.[0]}{selectedInterview.candidateLastName?.[0]}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-foreground">{selectedInterview.candidateFirstName} {selectedInterview.candidateLastName}</h4>
                                    <p className="text-sm text-muted-foreground font-medium">{selectedInterview.appliedPosition || 'No Position'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                                <div className="bg-secondary/30 p-3 rounded-xl border border-white/5">
                                    <span className="block text-[10px] uppercase text-muted-foreground font-bold mb-1 tracking-wider">Interviewer</span>
                                    <span className="text-foreground font-bold">{selectedInterview.interviewerName || 'Unassigned'}</span>
                                </div>
                                <div className="bg-secondary/30 p-3 rounded-xl border border-white/5">
                                    <span className="block text-[10px] uppercase text-muted-foreground font-bold mb-1 tracking-wider">Type</span>
                                    <span className="text-foreground font-bold">{selectedInterview.type}</span>
                                </div>
                                <div className="bg-secondary/30 p-3 rounded-xl border border-white/5">
                                    <span className="block text-[10px] uppercase text-muted-foreground font-bold mb-1 tracking-wider">Date</span>
                                    <span className="text-foreground font-bold">{new Date(selectedInterview.date).toLocaleDateString()}</span>
                                </div>
                                <div className="bg-secondary/30 p-3 rounded-xl border border-white/5">
                                    <span className="block text-[10px] uppercase text-muted-foreground font-bold mb-1 tracking-wider">Time</span>
                                    <span className="text-foreground font-bold">{new Date(selectedInterview.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 mt-2">
                                <div className="flex justify-between items-center bg-secondary/20 p-3 rounded-xl border border-white/5">
                                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Status</span>
                                    <span className={clsx("px-3 py-1 rounded-full text-xs font-bold border shadow-sm",
                                        selectedInterview.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                            selectedInterview.status === 'Cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' :
                                                'bg-primary/10 border-primary/20 text-primary'
                                    )}>
                                        {selectedInterview.status}
                                    </span>
                                </div>
                                {selectedInterview.result !== 'Pending' && (
                                    <div className="flex justify-between items-center bg-secondary/20 p-3 rounded-xl border border-white/5">
                                        <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Result</span>
                                        <span className={clsx("px-3 py-1 rounded-full text-xs font-bold border shadow-sm",
                                            selectedInterview.result === 'Passed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                                                selectedInterview.result === 'Failed' ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' :
                                                    'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                                        )}>{selectedInterview.result}</span>
                                    </div>
                                )}
                            </div>

                            {selectedInterview.notes && (
                                <div className="mt-6 p-4 bg-muted/30 rounded-2xl border border-border/50 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Clock size={40} />
                                    </div>
                                    <span className="block text-[10px] uppercase text-muted-foreground font-bold mb-2 tracking-wider">Interviewer Notes</span>
                                    <p className="text-sm text-foreground/80 leading-relaxed italic relative z-10 font-medium">"{selectedInterview.notes}"</p>
                                </div>
                            )}

                            <div className="pt-6 flex justify-end">
                                <button
                                    onClick={() => setSelectedInterview(null)}
                                    className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-xl transition-all font-bold text-sm shadow-sm active:scale-95 border border-border/50"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
