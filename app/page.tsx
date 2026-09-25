import BackgroundGrid from "./components/BackgroundGrid";
import ParticleWaveTerrain from "./components/canvas/ParticleWave";
import { ContainerScroll } from "./components/ui/container-scroll-animation";
import CoreSection from "./sections/CoreSection";
import Hero from "./sections/Hero";
import Navbar from "./sections/Navbar";
import ProblemSolution from "./sections/ProblemSolution";
import QphasePipeline from "./sections/QphasePipeline";
import ScrollSections from "./sections/ScrollSections";
import WhoItsFor from "./sections/WhoItsFor";

export default function Home() {
  return (
    <div className=" text-black dark:text-white ">
      <Navbar />
      <section id="home" className="relative flex w-full h-dvh">
        <Hero />
        <div className=" absolute top-0 left-0 w-full h-full pointer-events-none -z-10 bg-white dark:bg-black">
          {/* <img src="./images/Luminous Blue.png" className=" object-cover h-full w-full " /> */}
          <ParticleWaveTerrain />
        </div>
      </section>
      <section className="bg-white dark:bg-black">
        <ContainerScroll titleComponent="">
          <CoreSection coreImageSrc="/asset/Logo.svg" />
        </ContainerScroll>
      </section>
      <ScrollSections />
      <ProblemSolution />
      <QphasePipeline />
      <WhoItsFor />
    </div>
  );
}
