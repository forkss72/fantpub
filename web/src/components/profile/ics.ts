/** iCalendar text: backslash, semicolon, comma and newline are escaped (RFC 5545 §3.3.11). */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

const enc = new TextEncoder();

/** Lines longer than 75 octets fold onto continuation lines that start with a space (§3.1). */
export function fold(line: string): string {
  const parts: string[] = [];
  let cur = "";
  let size = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (size + b > (parts.length ? 74 : 75)) {
      parts.push(cur);
      cur = "";
      size = 0;
    }
    cur += ch;
    size += b;
  }
  parts.push(cur);
  return parts.join("\r\n ");
}

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A daily event at `time` ("HH:MM") in the device's own time zone (floating time),
 * starting today, with an alert at the start. Calendar apps import it from a downloaded .ics.
 */
export function dailyReminder(time: string, url: string, now = new Date()): string {
  const [h, m] = time.split(":").map(Number);
  const start = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}T${pad(h || 0)}${pad(m || 0)}00`;
  const stamp = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const title = "Рассказ дня FantPub";
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//FantPub//Reminder//RU",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:daily-${stamp}@fantpub`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${start}`,
      "DURATION:PT15M",
      "RRULE:FREQ=DAILY",
      `SUMMARY:${esc(title)}`,
      `DESCRIPTION:${esc(`Новый рассказ уже открыт: ${url}`)}`,
      `URL:${url}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(title)}`,
      "TRIGGER:PT0M",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .map(fold)
      .join("\r\n") + "\r\n"
  );
}

/** Saves text as a file through a Blob link (no server round-trip). */
export function saveFile(text: string, name: string, type: string) {
  const href = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement("a"), { href, download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 10_000);
}
