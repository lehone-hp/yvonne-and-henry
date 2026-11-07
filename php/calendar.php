<?php
// Save-the-date file. Mirrors calendarFile() in js/custom.js: keep the
// two in step. Times are PLACEHOLDERS until the real ones are confirmed.
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
    'BEGIN:VEVENT',
    'UID:yvonne-and-henry-20261219T100000@wedding.local',
    'DTSTAMP:' . gmdate('Ymd\THis\Z'),
    'DTSTART;TZID=Africa/Douala:20261219T100000',
    'DTEND;TZID=Africa/Douala:20261219T220000',
    'SUMMARY:Yvonne and Henry are getting married',
    'LOCATION:Presbyterian Church Buea Station\, Buea\, Cameroon',
    'DESCRIPTION:White wedding at the Presbyterian Church Buea Station\, then the reception at NASLA Multipurpose Hall. Times to be confirmed.',
    'END:VEVENT',
    'END:VCALENDAR',
];

echo implode("\r\n", $lines) . "\r\n";
