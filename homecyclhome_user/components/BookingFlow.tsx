import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function BookingFlow() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="service-type">
          <TabsList className="mb-6">
            <TabsTrigger value="service-type">Type de service</TabsTrigger>
            <TabsTrigger value="bike-details">Détails du vélo</TabsTrigger>
            <TabsTrigger value="schedule">Planification</TabsTrigger>
          </TabsList>

          <TabsContent value="service-type">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Choisissez le type de service</h3>
                <Button variant="outline" className="mr-4">Réparation</Button>
                <Button variant="outline">Entretien</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bike-details">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Détails de votre vélo</h3>
                <input placeholder="Marque" className="w-full mb-2 p-2 border rounded" />
                <input placeholder="Modèle" className="w-full mb-2 p-2 border rounded" />
                <textarea placeholder="Décrivez le problème (si réparation)" className="w-full p-2 border rounded"></textarea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Choisissez une date et une heure</h3>
                <input type="date" className="w-full mb-2 p-2 border rounded" />
                <input type="time" className="w-full mb-2 p-2 border rounded" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}