import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

export default function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const services = [
    {
      videoUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4',
      tag: 'Strategy',
      title: 'Research & Insight',
      description: 'We dig deep into data, culture, and human behavior to surface the insights that drive meaningful, lasting change.'
    },
    {
      videoUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260324_151826_c7218672-6e92-402c-9e45-f1e0f454bdc4.mp4',
      tag: 'Craft',
      title: 'Design & Execution',
      description: 'From concept to launch, we obsess over every detail to deliver experiences that feel effortless and look extraordinary.'
    }
  ];

  return (
    <section id="services" ref={sectionRef} className="bg-black py-28 md:py-40 px-6 overflow-hidden relative">
      {/* Subtle radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_60%)] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7 }}
          className="flex items-center justify-between mb-16 md:mb-24"
        >
          <h2 className="text-3xl md:text-5xl text-white tracking-tight font-instrument italic">
            What we do
          </h2>
          <span className="text-white/40 text-sm tracking-widest uppercase hidden md:inline-block">
            Our services
          </span>
        </motion.div>

        {/* Two-card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.8, delay: index * 0.15, ease: 'easeOut' }}
              className="liquid-glass rounded-3xl overflow-hidden group cursor-pointer flex flex-col justify-between"
            >
              {/* Card video area */}
              <div className="aspect-video w-full overflow-hidden relative">
                <video
                  src={service.videoUrl}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  muted
                  autoPlay
                  loop
                  playsInline
                  preload="auto"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>

              {/* Card body */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="uppercase tracking-widest text-white/40 text-xs font-semibold">
                      {service.tag}
                    </span>
                    <div className="liquid-glass rounded-full p-2 text-white group-hover:bg-white group-hover:text-black transition-colors duration-300">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                  
                  <h3 className="text-white text-xl md:text-2xl mb-3 tracking-tight font-sans font-medium">
                    {service.title}
                  </h3>
                </div>
                
                <p className="text-white/50 text-sm leading-relaxed font-sans">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
