import Header from '../components/Header'
import Hero from '../components/Hero'
import About from '../components/About'
import Testimoni from '../components/Testimoni'
import Footer from '../components/Footer'
import FeatureCards from '../components/FeatureCards'

function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Hero />
        <FeatureCards />
        <About />
        <Testimoni />
      </main>
      <Footer />
    </div>
  )
}

export default LandingPage