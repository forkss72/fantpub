import { BookSheetModal } from "@/components/book/BookSheetModal";

/** One card for every book opened from inside the app; the page below swaps when «Похожие» is tapped. */
export default function BookSheetLayout({ children }: { children: React.ReactNode }) {
  return <BookSheetModal>{children}</BookSheetModal>;
}
