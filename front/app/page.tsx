import Landing from './components/Landing';
import About from './components/About';
import Features from './components/Features';
import Form from './components/Form';
import Testimonies from './components/Testimonies';
import Footer from './components/Footer';

export default function UploadPage() {

  return (
    <div>
      <section className="bg-gradient-to-r from-[#3D8D7A] to-[#B3D8A8]">
        <div className="app-container">
          <Landing  />
        </div>
      </section>
      <div className="app-container">
      <About/>
      <Features/>
      <Form/>
      <Testimonies/>
      <Footer/>
      </div>

    </div>
  );
}