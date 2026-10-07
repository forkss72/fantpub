"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Segmented } from "@/components/ui/Segmented";
import { Sheet } from "@/components/ui/Sheet";
import { ThemeTiles, READER_THEMES } from "@/components/ui/ThemeTiles";
import { showHud } from "@/components/ui/Hud";
import { CaretRight, Export } from "@/components/ui/icons";
import { setPrefs, updateShelf, type Appearance, type Prefs } from "@/lib/shelf";
import { SITE_URL } from "@/lib/site";
import { tick } from "@/lib/haptics";
import { Group } from "./Group";
import { dailyReminder, saveFile } from "./ics";
import styles from "./Profile.module.css";

const APPEARANCE: { value: Appearance; label: string }[] = [
  { value: "auto", label: "Авто" },
  { value: "light", label: "Светлая" },
  { value: "dark", label: "Тёмная" },
];
const GLASS: { value: Prefs["glass"]; label: string }[] = [
  { value: "regular", label: "Обычное" },
  { value: "solid", label: "Плотное" },
];

type Platform = { coarse: boolean; ios: boolean; standalone: boolean };
const noop = () => () => {};
let platform: Platform | null = null;
/** Device facts that never change during a visit. */
function getPlatform(): Platform {
  platform ??= {
    coarse: matchMedia("(pointer: coarse)").matches,
    ios: /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
    standalone: matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
  };
  return platform;
}
const SERVER: Platform = { coarse: false, ios: false, standalone: false };

type DOE = { requestPermission?: () => Promise<"granted" | "denied"> };

async function toggleTilt(on: boolean) {
  if (!on) return setPrefs({ tilt: false });
  // iOS asks once, and only from a tap
  const D = (window as unknown as { DeviceOrientationEvent?: DOE }).DeviceOrientationEvent;
  if (D?.requestPermission) {
    try {
      if ((await D.requestPermission()) !== "granted") throw new Error("denied");
    } catch {
      showHud("Нет доступа к датчику движения");
      return;
    }
  }
  setPrefs({ tilt: true });
}

export function Settings({ prefs }: { prefs: Prefs }) {
  const router = useRouter();
  const env = useSyncExternalStore(noop, getPlatform, () => SERVER);
  const [themes, setThemes] = useState(false);
  const [howTo, setHowTo] = useState(false);
  const [time, setTime] = useState("09:00");
  const theme = READER_THEMES.find((t) => t.id === prefs.readerTheme)?.name ?? "Оригинал";

  async function install() {
    const prompt = window.__fpInstall;
    if (!prompt) return setHowTo(true);
    await prompt.prompt();
    window.__fpInstall = null;
  }

  return (
    <>
      <Group title="Настройки">
        <div className={styles.stackRow}>
          <span>Оформление</span>
          <Segmented label="Оформление" value={prefs.appearance} options={APPEARANCE} onChange={(v) => setPrefs({ appearance: v })} />
        </div>
        <button type="button" className={styles.row} onClick={() => setThemes(true)}>
          <span className={styles.label}>Тема чтения</span>
          <span className={styles.value}>
            {theme}
            <CaretRight size={14} weight="bold" className={styles.chev} aria-hidden="true" />
          </span>
        </button>
        <label className={styles.row}>
          <span className={styles.label}>
            Слепое чтение
            <span className={styles.sub}>Автор скрыт до конца рассказа</span>
          </span>
          <input
            type="checkbox"
            role="switch"
            className={styles.switch}
            checked={prefs.blind}
            onChange={(e) => {
              tick();
              setPrefs({ blind: e.target.checked });
            }}
          />
        </label>
        <div className={styles.stackRow}>
          <span>Стекло</span>
          <Segmented label="Стекло" value={prefs.glass} options={GLASS} onChange={(v) => setPrefs({ glass: v })} />
        </div>
        {env.coarse && (
          <label className={styles.row}>
            <span className={styles.label}>
              Живая обложка
              <span className={styles.sub}>Книга дня наклоняется вслед за телефоном</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              className={styles.switch}
              checked={prefs.tilt}
              onChange={(e) => {
                tick();
                void toggleTilt(e.target.checked);
              }}
            />
          </label>
        )}
      </Group>

      <Group footer="Ежедневное событие в вашем календаре. Отключается там же">
        <label className={styles.row}>
          <span className={styles.label}>Напоминание</span>
          <input type="time" className={styles.time} value={time} required onChange={(e) => setTime(e.target.value || "09:00")} />
        </label>
        <button
          type="button"
          className={styles.row}
          onClick={() => {
            saveFile(dailyReminder(time, SITE_URL), "fantpub-napominanie.ics", "text/calendar;charset=utf-8");
            showHud("Файл календаря готов", "check");
          }}
        >
          <span className={`${styles.label} ${styles.action}`}>Добавить в календарь</span>
        </button>
      </Group>

      <Group>
        <button type="button" className={styles.row} disabled={env.standalone} onClick={() => void install()}>
          <span className={styles.label}>Установить приложение</span>
          <span className={styles.value}>{env.standalone ? "Установлено" : <CaretRight size={14} weight="bold" className={styles.chev} aria-hidden="true" />}</span>
        </button>
        <button
          type="button"
          className={styles.row}
          onClick={() => {
            updateShelf((s) => ({ ...s, onboarded: false }));
            router.push("/");
          }}
        >
          <span className={styles.label}>Показать знакомство снова</span>
          <CaretRight size={14} weight="bold" className={styles.chev} aria-hidden="true" />
        </button>
      </Group>

      <Sheet open={themes} onClose={() => setThemes(false)} title="Тема чтения">
        <div className={styles.sheetBody}>
          <ThemeTiles />
        </div>
      </Sheet>

      <Sheet open={howTo} onClose={() => setHowTo(false)} title="На экран «Домой»">
        <div className={styles.sheetBody}>
          {env.ios ? (
            <ol className={styles.steps}>
              <li>
                <span>1</span>
                <span>
                  Нажмите <Export size={20} className={styles.inlineIcon} aria-label="Поделиться" /> в Safari
                </span>
              </li>
              <li>
                <span>2</span>
                <span>Выберите «На экран „Домой“»</span>
              </li>
              <li>
                <span>3</span>
                <span>Нажмите «Добавить»</span>
              </li>
            </ol>
          ) : (
            <p className={styles.sheetText}>Откройте меню браузера и выберите «Установить приложение» или «Добавить на главный экран»</p>
          )}
          <p className={styles.sheetText}>FantPub откроется без адресной строки, как обычное приложение</p>
        </div>
      </Sheet>
    </>
  );
}
