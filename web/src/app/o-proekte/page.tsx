import type { Metadata } from "next";
import Link from "next/link";
import { Masthead } from "@/components/Masthead";
import { Pabchik } from "@/components/Pabchik";
import { SiteFooter } from "@/components/SiteFooter";
import { VK_URL } from "@/lib/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "О проекте",
  description: "FantPub — один короткий рассказ в день. Классика из общественного достояния в новых переводах, слепое чтение и записки Пабчика. Как это устроено и почему всё бесплатно.",
  alternates: { canonical: "/o-proekte" },
};

export default function AboutPage() {
  return (
    <main className={`page ${styles.page}`}>
      <Masthead />
      <header className={styles.hero}>
        <Pabchik pose="sealed-book" size={170} priority />
        <h1 className={`display ${styles.title}`}>
          Дом историй, <em>открытый для всех</em>
        </h1>
        <p className={styles.lead}>
          FantPub — это один короткий рассказ в день. Не лента и не библиотека на тысячу томов, а одна книга, которую кто-то выбрал и запечатал для вас.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.h}>
          <span className={styles.num}>I</span> Как это устроено
        </h2>
        <ul className={styles.list}>
          <li>
            <strong>Каждый день в полночь по Москве</strong> открывается новый выпуск. Рассказы на 3–10 минут, по выходным бывают длиннее.
          </li>
          <li>
            <strong>Печать ломается один раз.</strong> Автор и год рассказа дня спрятаны до финала — в конце можно угадать, кто это написал. Выключается в настройках.
          </li>
          <li>
            <strong>Архив открыт всегда.</strong> Пропустили неделю — ничего страшного. Стрика, который сгорает, здесь нет.
          </li>
          <li>
            <strong>Полка растёт сама.</strong> Дочитали до слова «Конец» — книга встаёт на полку. Всё хранится в вашем браузере, регистрация не нужна.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h}>
          <span className={styles.num}>II</span> Кто такой Пабчик
        </h2>
        <p className={styles.p}>
          «Pub» — это сокращение от <em>public house</em>, дома, открытого для всех. У каждого дома есть домовой, у этого — Пабчик. Он живёт за корешками на нашей полке, прочитал всё, что когда-либо здесь оставляли, и каждое утро запечатывает одну книгу. Мех у него цвета дома, очки — от чтения при свечах.
        </p>
        <p className={styles.p}>
          После финала Пабчик оставляет записку: чем рассказ знаменит и почему его стоит знать. До финала — ни слова лишнего, он ненавидит спойлеры. Боится хоррора, но читает его первым.
        </p>
      </section>

      <section className={styles.section} id="prava">
        <h2 className={styles.h}>
          <span className={styles.num}>III</span> Права и переводы
        </h2>
        <p className={styles.p}>
          Мы публикуем только произведения в общественном достоянии: автор умер больше 70 лет назад, а для переводов — и переводчик тоже. Зарубежную классику мы переводим заново, поэтому эти тексты есть только здесь. В конце каждого рассказа есть «выходные данные»: оригинал, год, источник и статус прав.
        </p>
        <p className={styles.p}>
          Переводы FantPub можно цитировать со ссылкой. Нашли ошибку или неточность — напишите нам{" "}
          <a href={VK_URL} target="_blank" rel="noopener">
            во ВКонтакте
          </a>
          .
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.h}>
          <span className={styles.num}>IV</span> Немного истории
        </h2>
        <p className={styles.p}>
          FantPub начинался в 2019 году как паблик «Читай короткие рассказы»: обложка, тизер в три строки, жанр и время чтения. Формат прижился — мы сделали для него собственный дом.
        </p>
      </section>

      <div className={styles.cta}>
        <Link href="/" className="pill">
          К рассказу дня
        </Link>
        <Link href="/arhiv" className="pill pill--ghost">
          Архив
        </Link>
      </div>
      <SiteFooter />
    </main>
  );
}
