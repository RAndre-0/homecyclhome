import { apiService } from "@/services/api-service";
import { Metadata } from "next";
import Calendar from "./Calendar";

export const metadata: Metadata = {title: "Planning"};

export default function Planning() {
    return (
        <Calendar />
    );
}