import React, { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin, Tag, ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import api from '../services/api';
import { LibraryEvent } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Badge } from '../components/Badge';

export const Calendar: React.FC = () => {
  const [events, setEvents] = useState<LibraryEvent[]>([]);
  const [dueDates, setDueDates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getCalendar()
      .then((res) => {
        if (res.success && res.data) {
          setEvents(res.data.events || []);
          setDueDates(res.data.user_due_dates || []);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // October 2026 starts on Thursday (1st) and has 31 days.
  // Days of week: Sun, Mon, Tue, Wed, Thu, Fri, Sat
  // 1st of Oct 2026: Thursday (offset 4 from Sunday)
  const daysInMonth = 31;
  const startDayOffset = 4; // Thursday

  const daysArray = [];
  for (let i = 0; i < startDayOffset; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  // Map dates to events & dues
  const eventDateMap: { [day: number]: LibraryEvent[] } = {};
  for (const ev of events) {
    const day = parseInt(ev.event_date.split('-')[2]?.split(' ')[0], 10);
    if (!eventDateMap[day]) eventDateMap[day] = [];
    eventDateMap[day].push(ev);
  }

  const dueDateMap: { [day: number]: any[] } = {};
  for (const due of dueDates) {
    const day = parseInt(due.due_at.split('-')[2]?.split(' ')[0], 10);
    if (!dueDateMap[day]) dueDateMap[day] = [];
    dueDateMap[day].push(due);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Library Academic Calendar</h1>
        <p className="page-subtitle">
          Track return deadlines, research workshops, orientations, and university book exhibits.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading academic schedule..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28, alignItems: 'start' }}>
          {/* Calendar Grid View */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy)' }}>
                  October 2026
                </h3>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Semester 7 (Fall Session)
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', marginRight: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                  Campus Event
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--warning)' }} />
                  Book Due
                </span>
              </div>
            </div>

            {/* Day Header Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center', marginBottom: 12 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Cells */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {daysArray.map((day, idx) => {
                if (!day) {
                  return <div key={`empty-${idx}`} style={{ height: 68, backgroundColor: 'transparent' }} />;
                }

                const hasEvent = !!eventDateMap[day];
                const hasDue = !!dueDateMap[day];
                const isToday = day === 6; // Context date is Oct 6, 2026

                return (
                  <div
                    key={`day-${day}`}
                    style={{
                      height: 72,
                      padding: 6,
                      borderRadius: 'var(--radius-md)',
                      border: isToday ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isToday ? 'var(--primary-light)' : 'var(--surface)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: isToday ? 800 : 600,
                          color: isToday ? 'var(--primary)' : 'var(--navy)',
                        }}
                      >
                        {day}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: '0.625rem', fontWeight: 700, color: 'var(--primary)' }}>Today</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {hasDue && (
                        <div
                          style={{
                            fontSize: '0.625rem',
                            padding: '1px 4px',
                            borderRadius: 4,
                            backgroundColor: 'var(--warning-bg)',
                            color: 'var(--warning)',
                            fontWeight: 700,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }}
                          title={`Due: ${dueDateMap[day][0].book_title}`}
                        >
                          ⏰ Due
                        </div>
                      )}
                      {hasEvent && (
                        <div
                          style={{
                            fontSize: '0.625rem',
                            padding: '1px 4px',
                            borderRadius: 4,
                            backgroundColor: 'var(--primary-light)',
                            color: 'var(--primary)',
                            fontWeight: 700,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                          }}
                          title={eventDateMap[day][0].title}
                        >
                          📌 Event
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Events Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ padding: 20 }}>
              <div className="card-header" style={{ padding: '0 0 14px 0', borderBottom: '1px solid var(--border)' }}>
                <h3 className="card-title" style={{ fontSize: '1rem' }}>
                  🎯 Featured Campus Events
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 14 }}>
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    style={{
                      padding: 14,
                      backgroundColor: 'var(--bg)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Badge variant="primary">{ev.category || 'Workshop'}</Badge>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {ev.event_date.split(' ')[0]}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
                      {ev.title}
                    </h4>

                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
                      {ev.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--navy)', fontWeight: 500 }}>
                      <MapPin size={13} color="var(--primary)" />
                      <span>{ev.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
