import { useEffect, useState } from "react";
import axios from "axios";
import classes from "./Gallery.module.css";

interface OrderDetails {
  _id: string;
  image: string;
}

function Gallery() {
  const [gallery, setGallery] = useState<OrderDetails[]>([]); // Changed to an array of OrderDetails
  console.log(gallery);

  const fetchGalleryEntries = async () => {
    try {
      const response = await axios.get<OrderDetails[]>(
        `${import.meta.env.VITE_BACKEND_URL}/api/gallery/`
      );
      setGallery(response.data);
    } catch (error) {
      console.error("Failed to fetch gallery entries:", error);
    }
  };

  useEffect(() => {
    fetchGalleryEntries();
  }, []);

  return (
    <main>
      <div className="page-title">
        <h1>Gallery</h1>
        <h2>HOME / GALLERY</h2>
      </div>
      <div className="gallery-grid-container min-h-[calc(50vh)] flex-col text-[#554939] text-lg gap-8 font-jost font-medium flex items-center justify-center my-12 mx-4">
        <div className={classes.galleryGrid}>
          {gallery.map((imgSrc) => (
            <div key={imgSrc._id} className={classes.galleryItem}>
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}${imgSrc.image}`}
                alt={`Gallery Image ${imgSrc._id}`}
                className={classes.galleryImage}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Gallery;
