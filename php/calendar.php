<?php
// Save-the-date file. Mirrors calendarFile() in js/custom.js: keep the
// two in step.
header('Content-Type: text/calendar; charset=utf-8');
header('Content-Disposition: attachment; filename="yvonne-and-henry.ics"');

$lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Yvonne and Henry//Wedding//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    'TZID:Africa/Douala',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0100',
    'TZNAME:WAT',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE',
    // White wedding, 1:30 pm to 4:00 pm.
    'BEGIN:VEVENT',
    'UID:yvonne-and-henry-wedding-20261219T133000@wedding.local',
    'DTSTAMP:' . gmdate('Ymd\THis\Z'),
    'DTSTART;TZID=Africa/Douala:20261219T133000',
    'DTEND;TZID=Africa/Douala:20261219T160000',
    'SUMMARY:Yvonne and Henry: white wedding',
    'LOCATION:Presbyterian Church Buea Station\, Buea\, Cameroon',
    'DESCRIPTION:White wedding of Yvonne and Henry at the Presbyterian Church Buea Station.',
    'END:VEVENT',
    // Reception from 5:00 pm. No end time was given, so none is set.
    'BEGIN:VEVENT',
    'UID:yvonne-and-henry-reception-20261219T170000@wedding.local',
    'DTSTAMP:' . gmdate('Ymd\THis\Z'),
    'DTSTART;TZID=Africa/Douala:20261219T170000',
    'SUMMARY:Yvonne and Henry: reception',
    'LOCATION:NASLA Multipurpose Hall\, Buea\, Cameroon',
    'DESCRIPTION:Reception for Yvonne and Henry at NASLA Multipurpose Hall.',
    'END:VEVENT',
    'END:VCALENDAR',
];

echo implode("\r\n", $lines) . "\r\n";
