import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-primary to-secondary bg-velo">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tighter text-primary-foreground sm:text-5xl md:text-6xl lg:text-7xl">
              Unlock the Power of Data-Driven Insights
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-primary-foreground md:text-xl">
              Our cutting-edge analytics platform empowers you to make data-driven decisions that drive your business
              forward.
            </p>
          </div>
          <form className="w-full max-w-md space-y-2">
            <div className="flex gap-2">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button type="submit" className="whitespace-nowrap">
                Get Started
              </Button>
            </div>
            <p className="text-xs text-primary-foreground">Sign up to unlock exclusive features and insights.</p>
          </form>
        </div>
      </div>
    </section>
  );
}
