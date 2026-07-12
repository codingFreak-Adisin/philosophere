import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

export default function FeaturedVideoSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  return (
    <section className="bg-black pt-6 md:pt-10 pb-20 md:pb-32 px-6 overflow-hidden">
      <div ref={containerRef} className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="relative rounded-3xl overflow-hidden aspect-video w-full group"
        >
          {/* Background Video */}
          <video
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260402_054547_9875cfc5-155a-4229-8ec8-b7ba7125cbf8.mp4"
            className="w-full h-full object-cover"
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Bottom overlay content */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 z-10">
            {/* Left Box */}
            <div className="liquid-glass rounded-2xl p-6 md:p-8 max-w-md w-full">
              <p className="text-white/50 text-xs tracking-widest uppercase mb-3">Our Approach</p>
              <p className="text-white text-sm md:text-base leading-relaxed font-sans">
                We look beneath the surface to examine the unseen structures governing a challenge. Our methodology fuses deep philosophical inquiry with precise execution. For us, innovation is not a product of chance, but the inevitable result of structured, critical thinking.
              </p>
            </div>

            {/* Right Button */}
            <div className="flex-shrink-0 self-start md:self-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors cursor-pointer"
              >
                Explore more
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
