const mapEl = document.getElementById('map');

if (mapEl) {
  const locations = JSON.parse(mapEl.dataset.locations);

  const map = L.map('map', {
    scrollWheelZoom: false,
    zoomControl: false,
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  const bounds = [];

  locations.forEach((loc) => {
    const [lng, lat] = loc.coordinates;

    // Create marker
    const marker = L.marker([lat, lng]).addTo(map);

    // Create popup
    marker.bindPopup(
      `
        <div class="map-popup">
          <strong>Day ${loc.day}</strong>
          <span>${loc.description}</span>
        </div>
      `,
      {
        closeButton: false,
        autoClose: false,
        closeOnClick: false,
      }
    );

    // Keep popup visible
    marker.openPopup();

    bounds.push([lat, lng]);
  });

  // Fit map around all tour locations
  if (bounds.length > 0) {
    map.fitBounds(bounds, {
      paddingTopLeft: [100, 200],
      paddingBottomRight: [100, 150],
    });
  }
}