import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { MapPin, Navigation, AlertCircle } from "lucide-react";

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const HAS_KEY = MAPS_API_KEY && MAPS_API_KEY !== "YOUR_GOOGLE_MAPS_API_KEY_HERE";

function loadGoogleMapsScript(key) {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) return resolve();
    const existing = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existing) {
      existing.addEventListener("load", resolve);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function MapSection({ isVisible }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | no-location | no-key
  const [hospitalsFound, setHospitalsFound] = useState(0);

  useEffect(() => {
    if (!HAS_KEY) {
      setStatus("no-key");
      return;
    }

    setStatus("loading");

    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;

        try {
          await loadGoogleMapsScript(MAPS_API_KEY);

          const map = new window.google.maps.Map(mapRef.current, {
            center: { lat, lng },
            zoom: 14,
            disableDefaultUI: false,
            styles: [
              { elementType: "geometry", stylers: [{ color: "#f0f7ff" }] },
              { elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
              { featureType: "water", elementType: "geometry", stylers: [{ color: "#bfe3fd" }] },
              { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
              { featureType: "poi.medical", elementType: "geometry", stylers: [{ color: "#dbeffe" }] },
            ],
          });

          mapInstanceRef.current = map;

          // Your location marker
          new window.google.maps.Marker({
            position: { lat, lng },
            map,
            title: "Your Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#3b96f2",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 3,
            },
          });

          // Search nearby hospitals
          const service = new window.google.maps.places.PlacesService(map);
          const infoWindow = new window.google.maps.InfoWindow();

          service.nearbySearch(
            {
              location: { lat, lng },
              radius: 5000,
              type: "hospital",
            },
            (results, status_) => {
              if (
                status_ === window.google.maps.places.PlacesServiceStatus.OK &&
                results
              ) {
                setHospitalsFound(results.length);
                results.slice(0, 10).forEach((place) => {
                  const marker = new window.google.maps.Marker({
                    position: place.geometry.location,
                    map,
                    title: place.name,
                    icon: {
                      url:
                        "data:image/svg+xml;base64," +
                        btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="32" viewBox="0 0 28 32">
                          <ellipse cx="14" cy="30" rx="5" ry="2" fill="rgba(0,0,0,0.15)"/>
                          <path d="M14 0 C7 0 2 5 2 12 C2 20 14 30 14 30 C14 30 26 20 26 12 C26 5 21 0 14 0Z" fill="#ef4444"/>
                          <rect x="9" y="8" width="10" height="2" rx="1" fill="white"/>
                          <rect x="12" y="5" width="4" height="8" rx="1" fill="white" opacity="0.8"/>
                        </svg>`),
                      scaledSize: new window.google.maps.Size(28, 32),
                    },
                  });

                  marker.addListener("click", () => {
                    const rating = place.rating ? `⭐ ${place.rating}` : "No rating";
                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat()},${place.geometry.location.lng()}`;
                    infoWindow.setContent(`
                      <div style="font-family:Inter,sans-serif;max-width:220px;padding:4px">
                        <div style="font-weight:700;color:#0f172a;font-size:14px;margin-bottom:4px">${place.name}</div>
                        <div style="color:#64748b;font-size:12px;margin-bottom:2px">${rating}</div>
                        ${place.vicinity ? `<div style="color:#64748b;font-size:12px;margin-bottom:8px">📍 ${place.vicinity}</div>` : ""}
                        <a href="${mapsUrl}" target="_blank" style="color:#3b96f2;font-size:12px;font-weight:600;text-decoration:none">Get Directions →</a>
                      </div>
                    `);
                    infoWindow.open(map, marker);
                  });
                });
              }
              setStatus("success");
            }
          );
        } catch (err) {
          console.error("Maps error:", err);
          setStatus("error");
        }
      },
      () => setStatus("no-location")
    );
  }, [isVisible]);

  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 55, damping: 20 });
  const mapScale = useTransform(smoothProgress, [0, 1], [0.92, 1]);
  const mapOpacity = useTransform(smoothProgress, [0, 0.4], [0, 1]);

  return (
    <section ref={sectionRef} id="map-section" className="py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header — slides up with stagger */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <motion.span
            className="section-label"
            initial={{ opacity: 0, letterSpacing: "0.3em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.12em" }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            Nearby Care
          </motion.span>
          <motion.h2
            className="text-3xl sm:text-4xl font-bold mt-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            Find <span className="gradient-text">Hospitals & Clinics</span>
          </motion.h2>
        </motion.div>

        {/* Map wrapper — scale expand + clip reveal */}
        <motion.div
          style={{ scale: mapScale, opacity: mapOpacity }}
          className="will-transform"
        >
          <div className="glass-card overflow-hidden">
            {/* Map or fallback */}
            {!HAS_KEY ? (
              <div className="h-80 flex items-center justify-center flex-col gap-4 p-8 text-center">
                <AlertCircle className="w-10 h-10 text-amber-500" />
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Google Maps API Key Required</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add your Maps API key to <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">client/.env</code>
                    <br />
                    as <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs">VITE_GOOGLE_MAPS_API_KEY</code>
                  </p>
                </div>
              </div>
            ) : status === "no-location" ? (
              <div className="h-80 flex items-center justify-center flex-col gap-4 p-8 text-center">
                <Navigation className="w-10 h-10 text-blue-400" />
                <div>
                  <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Location Access Needed</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow location access to find hospitals near you.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Map container */}
                <div ref={mapRef} className="w-full h-96" />

                {/* Status bar below map */}
                {status === "success" && (
                  <div className="flex items-center gap-3 p-4 border-t border-blue-100 dark:border-blue-800/20">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Found <strong>{hospitalsFound}</strong> medical facilities within 5km.
                      Click markers for directions.
                    </span>
                  </div>
                )}
                {status === "loading" && (
                  <div className="flex items-center gap-3 p-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-blue-300 border-t-blue-500 rounded-full"
                    />
                    <span className="text-sm text-gray-500">Loading map & finding hospitals...</span>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
