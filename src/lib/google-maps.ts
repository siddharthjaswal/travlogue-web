let googleMapsPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject("No window");

    if ((window as any).google?.maps) {
      resolve((window as any).google);
      return;
    }

    const existing = document.getElementById("google-maps-script");
    if (existing) {
      existing.addEventListener("load", () => resolve((window as any).google));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve((window as any).google);
    script.onerror = reject;
    document.body.appendChild(script);
  });

  return googleMapsPromise;
}
