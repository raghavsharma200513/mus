import React, { useState, useEffect } from "react";
import { ChevronUp, Facebook } from "lucide-react";
import { Instagram } from "lucide-react";

type SocialPlatform = "instagram" | "youtube" | "linkedin" | "twitter";

const ScrollAndSocialButtons: React.FC = () => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  // Handle scroll to top functionality
  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Social media link handlers
  const socialLinks: Record<SocialPlatform, string> = {
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/",
    linkedin: "https://www.linkedin.com/in/",
    twitter: "https://twitter.com/",
  };

  const openSocialLink = (platform: SocialPlatform): void => {
    window.open(socialLinks[platform], "_blank", "noopener,noreferrer");
  };

  // Check scroll position to show/hide scroll to top button
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <>
      {/* Social Media Buttons - Centered Vertically */}
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col space-y-4">
        <button
          onClick={() => openSocialLink("instagram")}
          className="bg-pink-500 text-white p-2 rounded-full shadow-lg hover:bg-pink-600 transition-colors"
          aria-label="Instagram"
        >
          <Instagram size={24} />
        </button>
        <button
          onClick={() => openSocialLink("linkedin")}
          className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
          aria-label="LinkedIn"
        >
          <Facebook size={24} />
        </button>
      </div>

      {/* Scroll to Top Button - Bottom Right Corner */}
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 bottom-4 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors z-50"
          aria-label="Scroll to Top"
        >
          <ChevronUp size={24} />
        </button>
      )}
    </>
  );
};

export default ScrollAndSocialButtons;
