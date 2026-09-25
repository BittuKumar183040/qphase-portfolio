"use client";

import Image from "next/image";
import Link from "next/link";
import { hero } from "../config/content";

const BrandLogo = () => {

  return (
    <Link
      href="/"
      className="flex items-center gap-2"
    >
      <div className="shrink-0">
        <Image
          src="asset/Logo.svg"
          width={48}
          height={48}
          alt="qphase"
          unoptimized
        />
      </div>
      <p className=" text-xs md:text-xl font-quantico ">{hero.eyebrow}</p>
    </Link>
  );
};

export default BrandLogo;