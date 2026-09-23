'use client'

import { useEffect, useRef } from "react"
import Image from 'next/image'
import { gsap } from 'gsap'

type SocialIcon = {
  href: string
  src: string
  size?: number
  iconSize?: number
  strokeWidth?: number
}

export const SocialIcon = ({
  href,
  src,
  size = 50,
  iconSize = 20,
  strokeWidth = 3,
}: SocialIcon) => {
  const circleRef = useRef<SVGCircleElement | null>(null)
  const anchorRef = useRef<HTMLAnchorElement | null>(null)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    if (!circleRef.current || !anchorRef.current) return

    const circle = circleRef.current
    gsap.set(circle, { strokeDasharray: circumference, strokeDashoffset: circumference })

    const enter = () => {
      gsap.to(circle, {
        strokeDashoffset: 0,
        duration: 0.6,
        ease: 'power3.out'
      })
    }

    const leave = () => {
      gsap.to(circle, {
        strokeDashoffset: circumference,
        duration: 0.4,
        ease: 'power2.inOut',
      })
    }

    const el = anchorRef.current
    el.addEventListener('mouseenter', enter)
    el.addEventListener('mouseleave', leave)

    return () => {
      el.removeEventListener('mouseenter', enter)
      el.removeEventListener('mouseleave', leave)
    }
  }, [circumference])

  return (
    <a ref={anchorRef} href={href} className="relative flex ">
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" />
        <circle ref={circleRef} cx={size / 2} cy={size / 2} r={radius} stroke="#00FFFF" strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />
      </svg>

      <div className="absolute left-1/2 top-1/2 -translate-1/2 dark:invert">
        <Image src={src} width={iconSize} height={iconSize} alt="" />
      </div>
    </a>
  )
}
