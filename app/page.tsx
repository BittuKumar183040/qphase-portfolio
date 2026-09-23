import BackgroundGrid from "./components/BackgroundGrid";
import { ContainerScroll } from "./components/ui/container-scroll-animation";
import CoreSection from "./sections/CoreSection";
import Hero from "./sections/Hero";
import Navbar from "./sections/Navbar";
import ScrollSections from "./sections/ScrollSections";

export default function Home() {
  return (
    <div className=" text-black dark:text-white">
      <Navbar />
      <section id="home" className="relative flex w-full h-dvh">
        <Hero />
        <div className=" absolute top-0 left-0 w-full h-full pointer-events-none -z-10 blur-xs">
          {/* <BackgroundGrid /> */}
          <img src="./images/Luminous Blue.png" className=" object-cover h-full w-full " />
        </div>
      </section>
      <section className="  bg-black/10 dark:bg-[#151515]">
        <ContainerScroll titleComponent="">
          <CoreSection coreImageSrc="/asset/Logo.svg" />
        </ContainerScroll>
      </section>
      <ScrollSections />
    </div>
  );
}
