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
import WhatAPartnerGets from "./sections/scroll-sections/WhatAPartnerGets";
import ScrollSections from "./sections/ScrollSections";
import WhoItsFor from "./sections/WhoItsFor";

export default function Home() {
  return (
    <div className=" text-black dark:text-white bg-white dark:bg-black overflow-x-hidden">
      <Navbar />
      <section id="home" className="relative flex w-full h-dvh bg-white dark:bg-black">
        <Hero />
        <ParticleWaveTerrain />
      </section>
      
      <section className="bg-white dark:bg-black ">
        <ContainerScroll titleComponent="">
          <CoreSection coreImageSrc="/asset/Logo.svg" />
        </ContainerScroll>
      </section>
      <ProblemSolution />
      <ProgressTimeline />

      {/* <ScrollSections /> */}
      <ProofPointVerification />
      <QphasePipeline />
      <WhoItsFor />
      <ContactUs />
      <Footer />
    </div>
  );
}
