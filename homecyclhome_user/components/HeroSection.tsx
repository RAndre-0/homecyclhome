import { Button } from '@/components/ui/button';
import Image from 'next/image';
import peugeotBike from '@/public/media/image/peugeot_bike.jpeg';

export default function HeroSection() {
  return (
<section className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-20">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-8">
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold mb-4">Expert Bicycle Repair & Maintenance at Your Doorstep</h1>
          <p className="mb-6">
            Our certified mechanics come to you, fully equipped to get your bike running smoothly again.
          </p>
          <Button className="bg-white text-green-600 hover:bg-gray-100">Book Now</Button>
        </div>
        <div className="md:w-1/2">
          <Image
            src={peugeotBike}
            alt="Bike mechanic working"
            width={500}
            height={400}
            className="rounded-xl shadow-xl"
            priority
          />
        </div>
      </div>
    </section>
  );
}
