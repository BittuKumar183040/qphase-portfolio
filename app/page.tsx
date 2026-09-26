import BackgroundGrid from "./components/BackgroundGrid";
import ParticleWaveTerrain from "./components/canvas/ParticleWave";
import { ContainerScroll } from "./components/ui/container-scroll-animation";
import ContactUs from "./sections/ContactUs";
import CoreSection from "./sections/CoreSection";
import Footer from "./sections/Footer";
import Hero from "./sections/Hero";
import Navbar from "./sections/Navbar";
import ProblemSolution from "./sections/ProblemSolution";
import ProgressTimeline from "./sections/ProgressTimeline";
import QphasePipeline from "./sections/QphasePipeline";
import ProofPointVerification from "./sections/ProofPointVerification";
import WhoItsFor from "./sections/WhoItsFor";

export default function Home() {
  return (
    <div className=" text-black dark:text-white bg-white dark:bg-black">
      <Navbar />
      <section id="home" className="relative flex w-full h-dvh  dark:bg-black">
        <Hero />
        <ParticleWaveTerrain />
      </section>
      
      <section className="bg-white dark:bg-black -translate-y-20">
        <ContainerScroll titleComponent="">
          <CoreSection coreImageSrc="/asset/Logo.svg" />
        </ContainerScroll>
      </section>
      
      <div className=" -translate-y-20">
        <ProblemSolution />
        <ProgressTimeline />
      </div>
      <div className=" px-5 sm:px-5 md:px-10 lg:px-20">
        <QphasePipeline />
        {/* <ScrollSections /> */}
        <ProofPointVerification />
        <WhoItsFor />
        <ContactUs />
        <Footer />
      </div>
    </div>
  );
}
