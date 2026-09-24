"use client";

import ScrollItems from "../components/ScrollItems";
import { ScrollSectionData } from "../config/content";
import Layout from "./scroll-sections/core/layout";

const ScrollSections = () => {
  return (
    <div className="min-h-screen bg-[#F6F3EE] text-[#3A362E] antialiased">
      <main>
        {Object.entries(ScrollSectionData).map(([key, data]) => {
          return <Layout key={key} id={key}>{data?.component}</Layout>;
        })}
      </main>
      <ScrollItems />
    </div>
  );
};

export default ScrollSections;
