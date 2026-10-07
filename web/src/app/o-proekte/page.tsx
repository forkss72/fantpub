import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Books, BookmarkSimple, CaretRight, Clock, LockSimple, type IconType } from "@/components/ui/icons";
import { VK_URL } from "@/lib/site";
import grouped from "@/components/archive/Grouped.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "О проекте",
  description: "FantPub — один короткий рассказ в день. Классика из общественного достояния в новых переводах, слепое чтение и записки Пабчика. Как это устроено и почему всё бесплатно.",
  alternates: { canonical: "/o-proekte" },
  openGraph: { title: "О проекте FantPub", description: "Один короткий рассказ в день, слепое чтение, записки Пабчика и честные права на тексты.", url: "/o-proekte" },
};

const HOW: { icon: IconType; title: string; text: string }[] = [
  { icon: Clock, title: "В полночь по Москве", text: "Открывается новый выпуск: рассказ от 3 до 10 минут, по выходным длиннее." },
  { icon: LockSimple, title: "Автор под стеклом", text: "Имя и год скрыты до финала, в конце можно угадать. Выключается в профиле." },
  { icon: Books, title: "Архив открыт всегда", text: "Пропустили неделю — все выпуски на месте." },
  { icon: BookmarkSimple, title: "Полка растёт сама", text: "Дочитали до конца — книга встаёт на полку. Всё хранится в браузере, без регистрации." },
];

const LINKS: { href: Route; label: string }[] = [
  { href: "/", label: "Рассказ дня" },
  { href: "/arhiv", label: "Архив" },
  { href: "/avtory", label: "Авторы" },
];

function Section({ id, title, children, aside }: { id: string; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className={styles.section} id={id} aria-labelledby={`${id}-h`}>
      <div className={styles.head}>
        {aside}
        <h2 className="t-title2" id={`${id}-h`}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="page">
      <div className="edge-top" aria-hidden="true" />
      <PageHeader title="О проекте" />
      <p className={styles.lead}>
        FantPub — один короткий рассказ в день. Не лента и не библиотека на тысячу томов, а одна книга, которую кто-то выбрал и запечатал для вас.
      </p>

      <Section id="kak" title="Как это устроено">
        <ul className={grouped.list}>
          {HOW.map(({ icon: Icon, title, text }) => (
            <li key={title}>
              <div className={grouped.row}>
                <span className={grouped.icon}>
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span className={grouped.text}>
                  <span className={grouped.label}>{title}</span>
                  <span className={grouped.sub}>{text}</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="pabchik"
        title="Кто такой Пабчик"
        aside={<Image src="/pabchik/avatar.webp" alt="" width={44} height={44} className={styles.avatar} />}
      >
        <p className={styles.p}>
          «Pub» — сокращение от <i>public house</i>, дома, открытого для всех. У каждого дома есть домовой, у этого — Пабчик. Он живёт за корешками на нашей полке, прочитал всё, что здесь когда-либо оставляли, и каждое утро запечатывает одну книгу.
        </p>
        <p className={styles.p}>
          До финала он молчит: спойлеры ненавидит. После финала оставляет записку — чем рассказ знаменит и почему его стоит знать. Боится хоррора, но читает его первым.
        </p>
      </Section>

      <Section id="prava" title="Права и переводы">
        <p className={styles.p}>
          Мы публикуем только произведения в общественном достоянии: автор умер больше 70 лет назад, а для переводов — и переводчик тоже. Зарубежную классику переводим заново, поэтому эти тексты есть только здесь. У каждого рассказа есть выходные данные: оригинал, год, источник и статус прав.
        </p>
        <p className={styles.p}>
          Переводы FantPub можно цитировать со ссылкой. Нашли ошибку — напишите нам{" "}
          <a href={VK_URL} target="_blank" rel="noopener" className={styles.a}>
            во ВКонтакте
          </a>
          .
        </p>
      </Section>

      <Section id="istoriya" title="Немного истории">
        <p className={styles.p}>
          FantPub начинался в 2019 году как паблик «Читай короткие рассказы»: обложка, тизер в три строки, жанр и время чтения. Формат прижился, и мы построили для него собственный дом.
        </p>
      </Section>

      <nav className={styles.section} aria-label="Разделы">
        <ul className={grouped.list}>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={grouped.row}>
                <span className={`${grouped.text} ${grouped.label}`}>{l.label}</span>
                <CaretRight size={15} weight="bold" className={grouped.chev} aria-hidden="true" />
              </Link>
            </li>
          ))}
          <li>
            <a href={VK_URL} target="_blank" rel="noopener" className={grouped.row}>
              <span className={`${grouped.text} ${grouped.label}`}>
                ВКонтакте<span className="sr-only"> (откроется в новой вкладке)</span>
              </span>
              <CaretRight size={15} weight="bold" className={grouped.chev} aria-hidden="true" />
            </a>
          </li>
        </ul>
      </nav>
    </main>
  );
}
