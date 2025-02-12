import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InterventionsChart } from "./InterventionsChart"

export default function Dashboard() {
  return (
    <div className="flex flex flex-col gap-5">
      <div className="flex flex-row gap-5">
        <div className="p-5 w-1/3 border rounded-lg">
          <p>hello</p>
        </div>
        <div className="p-5 w-1/3 border rounded-lg">
          <p>hello</p>
        </div>
        <div className="p-5 w-1/3 border rounded-lg">
          <p>hello</p>
        </div>
      </div>
          <InterventionsChart/>
    </div>
  );
}
