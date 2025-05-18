import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AvailabilityCheck() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-center mb-4">Vérifiez si nous desservons votre adresse</h2>
          <div className="flex flex-col md:flex-row gap-4">
            <Input type="text" placeholder="Entrez votre adresse" className="flex-grow" />
            <Button className="bg-green-500 hover:bg-green-600">Vérifier</Button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">
            Nous intervenons actuellement dans la majorité des zones urbaines et périurbaines dans un rayon de 25 km.
          </p>
        </div>
      </div>
    </section>
  );
}