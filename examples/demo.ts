import { NDAMapsClient } from '../src';

async function runExample() {
  const apiKey = process.env.NDAMAPS_API_KEY;
  if (!apiKey) {
    console.error('Please set NDAMAPS_API_KEY environment variable');
    return;
  }

  const client = new NDAMapsClient(apiKey);

  console.log('--- 1. Forward Geocoding ---');
  const geocode = await client.geocoding.forward({ address: 'Hồ Hoàn Kiếm, Hà Nội' });
  console.log('Result:', JSON.stringify(geocode.results?.[0]?.geometry?.location, null, 2));

  console.log('\n--- 2. Optimized Route (Travelling Salesperson) ---');
  // E.g., A delivery driver making 3 stops and returning to start.
  const routeParams = {
    locations: [
      { lat: 21.03624, lon: 105.77142 }, // Home base
      { lat: 21.03326, lon: 105.78743 }, // Delivery 1
      { lat: 21.00329, lon: 105.81834 }, // Delivery 2
      { lat: 21.03624, lon: 105.77142 }  // Return home
    ],
    costing: 'auto'
  };
  
  const routeData = await client.navigation.optimizedRoute(routeParams);
  console.log('Optimized stops order:', routeData.trip.locations.map(loc => loc.original_index));
  if (routeData.trip.summary) {
    console.log(`Total Distance: ${routeData.trip.summary.length} meters`);
    console.log(`Total ETA: ${routeData.trip.summary.time} seconds`);
  }
}

runExample().catch(err => {
  console.error('Error running example:', err);
});
