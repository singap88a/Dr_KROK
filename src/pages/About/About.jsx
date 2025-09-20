import Heroabout from "../../components/About/Heroabout";
import OurStory from "../../components/About/OurStory";
import Mission_Vision from "../../components/About/Mission_Vision";
import Stand_For from "../../components/About/Stand_For";
import Testimonials from "../../components/About/Testimonials";
 
export default function About() {
  return (
    <section className="min-h-screen text-text">
      {/* Hero Section */}
      <div className="">
        <Heroabout
          title="About Us"
          description="Learn about our mission, vision, and the values that drive our platform to empower learners worldwide."
          imageUrl="https://images.pexels.com/photos/3184357/pexels-photo-3184357.jpeg"
        />
        <OurStory />
        <Mission_Vision />
        <Stand_For />
        <Testimonials />
       </div>
    </section>
  );
}
