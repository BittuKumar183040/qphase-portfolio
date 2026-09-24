import { ReactNode } from 'react'
import { container, viewport } from './Reveal'
import { motion } from 'framer-motion'

const Layout = ({id, children}: {id: string, children: ReactNode}) => {
  return (
    <section
      id={id}
      className="h-dvh"
    >
      <motion.div
        className="relative w-full h-full lg:w-8/12 xl:w-9/12 flex flex-col justify-center p-5 sm:p-10 md:p-20"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        {children}
    </motion.div>
    </section>
  )
}

export default Layout