"use client";

import { useState, type FormEvent } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { showHud } from "@/components/ui/Hud";
import { exportKey, importKey, resetShelf, type ShelfState } from "@/lib/shelf";
import { shareOrCopy } from "@/lib/share";
import { parseKey, transferLink } from "@/components/shelf/key";
import { Group } from "./Group";
import styles from "./Profile.module.css";

/** Shelf key out, shelf key in, and the one destructive action of the app. */
export function Transfer({ shelf }: { shelf: ShelfState }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const link = transferLink(exportKey(shelf));

  function submit(e: FormEvent) {
    e.preventDefault();
    const key = parseKey(input);
    if (key && importKey(key)) {
      setInput("");
      setError(false);
      showHud("Полка перенесена");
    } else setError(true);
  }

  return (
    <>
      <Group title="Перенос полки" footer="Аккаунта нет: всё хранится в этом браузере. Откройте ссылку на другом устройстве, и полка переедет туда">
        <div className={styles.row}>
          <span className={styles.label}>
            Ссылка-ключ
            <span className={`${styles.keyLine} num`}>{link}</span>
          </span>
          <button type="button" className={`${styles.small} press`} onClick={() => void shareOrCopy(link, "Ключ от полки FantPub")}>
            Скопировать
          </button>
        </div>
        <form className={styles.row} onSubmit={submit}>
          <input
            className={styles.field}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(false);
            }}
            placeholder="Ссылка или ключ"
            aria-label="Ссылка-ключ с другого устройства"
            aria-invalid={error || undefined}
            aria-describedby={error ? "key-error" : undefined}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            enterKeyHint="go"
          />
          <button type="submit" className={`${styles.small} press`} disabled={!input.trim()}>
            Перенести
          </button>
        </form>
        {error && (
          <p className={`${styles.row} ${styles.sub} ${styles.error}`} id="key-error" role="alert">
            Ключ не подошёл. Скопируйте ссылку на старом устройстве ещё раз, целиком
          </p>
        )}
      </Group>

      <Group>
        <button type="button" className={styles.row} onClick={() => setConfirm(true)}>
          <span className={`${styles.label} ${styles.danger}`}>Очистить историю</span>
        </button>
      </Group>

      <Sheet open={confirm} onClose={() => setConfirm(false)} title="Очистить историю?">
        <div className={styles.sheetBody}>
          <p className={styles.sheetText}>Прочитанное, прогресс, цитаты и реакции на этом устройстве удалятся. Имя, цель и настройки останутся</p>
          <button
            type="button"
            className={`${styles.capsule} press`}
            data-destructive=""
            onClick={() => {
              resetShelf();
              setConfirm(false);
              showHud("История очищена");
            }}
          >
            Очистить
          </button>
          <button type="button" className={`${styles.textBtn} press`} onClick={() => setConfirm(false)}>
            Отмена
          </button>
        </div>
      </Sheet>
    </>
  );
}
