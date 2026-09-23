"use client"

import ScrollItems from "../components/ScrollItems";
import DataMeasuredNotModeled from "./scroll-sections/DataMeasuredNotModeled";
import HowItWorks from "./scroll-sections/HowItWorks";
import ProofPointCrossPlatform from "./scroll-sections/ProofPointCrossPlatform";
import ProofPointFidelityModel from "./scroll-sections/ProofPointFidelityModel";
import ProofPointVerification from "./scroll-sections/ProofPointVerification";
import StatusAndAsk from "./scroll-sections/StatusAndAsk";
import TheApproach from "./scroll-sections/TheApproach";
import WhatAPartnerGets from "./scroll-sections/WhatAPartnerGets";


const ScrollSections = () => {
  return (
    <div className="min-h-screen bg-[#F6F3EE] text-[#3A362E] antialiased">
      <main className="">
        <TheApproach />
        <HowItWorks />
        <ProofPointVerification />
        <ProofPointFidelityModel />
        <DataMeasuredNotModeled />
        <ProofPointCrossPlatform />
        <WhatAPartnerGets />
        <StatusAndAsk />
      </main>
      <ScrollItems />
    </div>
  );
};

export default ScrollSections;