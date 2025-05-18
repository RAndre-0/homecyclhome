import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import AvailabilityCheck from '@/components/AvailabilityCheck';
import BookingFlow from '@/components/BookingFlow';
import WhyChooseUs from '@/components/WhyChooseUs';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <AvailabilityCheck />
        <BookingFlow />
        <WhyChooseUs />
      </main>
      <Footer />
    </>
  );
}
