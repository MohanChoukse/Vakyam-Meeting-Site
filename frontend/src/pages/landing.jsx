import React from 'react';
import '../styles/landing.css';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MeetingLinkCard from '../components/MeetingLinkCard';
import HowItWorks from '../components/HowItWorks';
import Features from '../components/Features';
import UseCases from '../components/UseCases';
import WhyChoose from '../components/WhyChoose';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

export default function LandingPage() {

  return (
    <>
      <Navbar />
      <Hero />
      <MeetingLinkCard />
      <HowItWorks />
      <Features />
      <UseCases />
      <WhyChoose />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
}
