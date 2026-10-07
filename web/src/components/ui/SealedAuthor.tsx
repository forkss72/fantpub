import styles from "./SealedAuthor.module.css";

/**
 * Author (and optionally year) under frosted glass while the story is unread in blind mode.
 * Needs an ancestor with data-seal={slug}; the head script and BlindStyle lift the seal once read.
 */
export function SealedAuthor({
  name,
  year,
  mask = "Автор скрыт до финала",
  plain,
}: {
  name: string;
  year?: number | string;
  mask?: string;
  /** grey text instead of the frosted chip (dense lists) */
  plain?: boolean;
}) {
  return (
    <>
      <span className="seal-real">
        {name}
        {year ? `, ${year}` : null}
      </span>
      <span className={`seal-mask ${plain ? styles.plain : styles.mask}`}>
        {mask}
      </span>
    </>
  );
}
