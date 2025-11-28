import React from 'react';
import { PosterMetadata } from '../types';

interface CalendarLinksProps {
  metadata: PosterMetadata;
}

const CalendarLinks: React.FC<CalendarLinksProps> = ({ metadata }) => {
  const generateGoogleCalendarLink = (title: string, dateIso: string, details: string) => {
    // Basic validation for YYYYMMDD
    if (!dateIso || dateIso.length < 8) return null;
    
    // Construct the link
    // dates=YYYYMMDD/YYYYMMDD (End date is usually start date + 1 day for all day events if not specified)
    // We assume single day all-day event for simplicity unless AI gave ranges (which we simplify to start date here)
    const startDate = dateIso.substring(0, 8);
    // Simple logic to add 1 day for end date would require date parsing, 
    // for safety we just use the same day or let user edit. 
    // Format: YYYYMMDDT000000Z for UTC or just YYYYMMDD for all day.
    const dates = `${startDate}/${startDate}`; 
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: title,
      details: `${details}\n\nLink: ${metadata.link}`,
      location: metadata.location,
      dates: dates
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const regLink = generateGoogleCalendarLink(
    `Deadline: ${metadata.competitionName}`, 
    metadata.registrationDeadlineIso, 
    `Deadline pendaftaran lomba ${metadata.competitionName}.`
  );

  const eventLink = generateGoogleCalendarLink(
    `Event: ${metadata.competitionName}`, 
    metadata.eventDateIso, 
    `Pelaksanaan lomba ${metadata.competitionName}.`
  );

  if (!regLink && !eventLink) return null;

  return (
    <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-5">
      <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Simpan ke Google Calendar
      </h3>
      <div className="flex flex-col sm:flex-row gap-3">
        {regLink && (
           <a 
             href={regLink} 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
           >
             Simpan Deadline Pendaftaran
           </a>
        )}
        {eventLink && (
           <a 
             href={eventLink} 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
           >
             Simpan Tanggal Pelaksanaan
           </a>
        )}
      </div>
      <p className="text-xs text-indigo-400 mt-2">
        *Pastikan format tanggal terbaca dengan benar (YYYYMMDD) untuk fungsi ini.
      </p>
    </div>
  );
};

export default CalendarLinks;