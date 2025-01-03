import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator"

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-primary to-secondary bg-velo">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Réparation et maintenance de votre vélo à domicile
            </h1>
            <Separator orientation="horizontal" />
            <p className="mx-auto max-w-[700px] text-lg text-white md:text-xl">
              Nos techniciens sont disponibles du Lundi au Vendredi pour entretenir ou réparer votre vélo à domicile.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
