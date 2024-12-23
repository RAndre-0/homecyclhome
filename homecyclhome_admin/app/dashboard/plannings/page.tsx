import { Metadata } from "next";
import Calendar from "./Calendar";

export const metadata: Metadata = { title: "Plannings" };

export default function Plannings() {
  return (
      <Calendar />
  );
}
