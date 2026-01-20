export default function Testimoni() {
  return (
    <section id="testimoni" className="py-20 bg-sfc-dark-blue relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="p-8 bg-gradient-to-r from-sfc-gold/10 to-sfc-cream/5 border-2 border-sfc-gold/40 rounded-lg">
            <p className="text-xl md:text-2xl leading-relaxed text-sfc-cream font-semibold">
              Early users highlight clarity, transparency, and on-chain verification —
              <br />
              <span className="text-sfc-gold">not promises or guaranteed outcomes.</span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(221, 168, 83, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(221, 168, 83, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </section>
  );
}