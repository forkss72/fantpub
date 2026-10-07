"use client";

import { useState, useSyncExternalStore } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { showHud } from "@/components/ui/Hud";
import { importKey } from "@/lib/shelf";
import { parseKey } from "./key";
import styles from "./ShelfScreen.module.css";

function subscribe(cb: () => void) {
  addEventListener("hashchange", cb);
  return () => removeEventListener("hashchange", cb);
}
const getHash = () => location.hash;

/** Old and new transfer links land here: /polka#key=… asks before merging. */
export function KeyImport() {
  const hash = useSyncExternalStore(subscribe, getHash, () => "");
  const [handled, setHandled] = useState("");
  const [failed, setFailed] = useState(false);
  const key = hash !== handled ? parseKey(hash) : null;

  const close = () => {
    setHandled(hash);
    setFailed(false);
    history.replaceState(history.state, "", location.pathname);
  };

  return (
    <Sheet open={!!key || failed} onClose={close} title={failed ? "Ключ не подошёл" : "Перенести полку?"}>
      <div className={styles.sheetBody}>
        <p className={styles.sheetText}>
          {failed
            ? "Похоже, ссылка скопировалась не целиком. Скопируйте её ещё раз на старом устройстве"
            : "Прочитанное, цитаты, реакции и настройки добавятся к тому, что уже есть на этом устройстве"}
        </p>
        {failed ? (
          <button type="button" className={`${styles.capsule} press`} onClick={close}>
            Понятно
          </button>
        ) : (
          <>
            <button
              type="button"
              className={`${styles.capsule} press`}
              autoFocus
              onClick={() => {
                const ok = key ? importKey(key) : false;
                if (ok) {
                  close();
                  showHud("Полка перенесена");
                } else {
                  setHandled(hash);
                  setFailed(true);
                }
              }}
            >
              Перенести
            </button>
            <button type="button" className={`${styles.textBtn} press`} onClick={close}>
              Не сейчас
            </button>
          </>
        )}
      </div>
    </Sheet>
  );
}
