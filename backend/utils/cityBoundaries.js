/**
 * City Boundaries Utility
 * 
 * This utility determines which city administrative region 
 * a given set of coordinates belongs to.
 * 
 * Each city has:
 * - center: [latitude, longitude] - city center point
 * - radius: approximate radius in kilometers for boundary checking
 */

// Gujarat city boundaries with center coordinates and radii
const cityBoundaries = {
  "Ahmedabad": {
    center: [23.0225, 72.5714],
    radius: 25, // km
    bounds: {
      latMin: 22.95,
      latMax: 23.10,
      lngMin: 72.45,
      lngMax: 72.70
    }
  },
  "Surat": {
    center: [21.1702, 72.8311],
    radius: 30,
    bounds: {
      latMin: 21.10,
      latMax: 21.30,
      lngMin: 72.70,
      lngMax: 72.95
    }
  },
  "Vadodara": {
    center: [22.3072, 73.1812],
    radius: 25,
    bounds: {
      latMin: 22.25,
      latMax: 22.40,
      lngMin: 73.10,
      lngMax: 73.30
    }
  },
  "Gandhinagar": {
    center: [23.2156, 72.6369],
    radius: 20,
    bounds: {
      latMin: 23.05,
      latMax: 23.25,
      lngMin: 72.55,
      lngMax: 72.72
    }
  },
  "Rajkot": {
    center: [22.3039, 70.8022],
    radius: 20,
    bounds: {
      latMin: 22.25,
      latMax: 22.35,
      lngMin: 70.70,
      lngMax: 70.90
    }
  },
  "Jamnagar": {
    center: [22.4707, 70.0577],
    radius: 15,
    bounds: {
      latMin: 22.42,
      latMax: 22.52,
      lngMin: 70.00,
      lngMax: 70.12
    }
  },
  "Bhavnagar": {
    center: [21.7645, 72.1519],
    radius: 15,
    bounds: {
      latMin: 21.70,
      latMax: 21.82,
      lngMin: 72.10,
      lngMax: 72.22
    }
  },
  "Junagadh": {
    center: [21.5226, 70.4633],
    radius: 15,
    bounds: {
      latMin: 21.45,
      latMax: 21.60,
      lngMin: 70.40,
      lngMax: 70.55
    }
  },
  "Anand": {
    center: [22.5645, 72.9289],
    radius: 15,
    bounds: {
      latMin: 22.48,
      latMax: 22.65,
      lngMin: 72.85,
      lngMax: 73.00
    }
  },
  "Navsari": {
    center: [20.9467, 72.9520],
    radius: 12,
    bounds: {
      latMin: 20.88,
      latMax: 21.01,
      lngMin: 72.90,
      lngMax: 73.02
    }
  },
  "Valsad": {
    center: [20.5992, 72.9342],
    radius: 12,
    bounds: {
      latMin: 20.53,
      latMax: 20.67,
      lngMin: 72.87,
      lngMax: 73.00
    }
  },
  "Bharuch": {
    center: [21.7051, 72.9959],
    radius: 15,
    bounds: {
      latMin: 21.65,
      latMax: 21.77,
      lngMin: 72.90,
      lngMax: 73.10
    }
  },
  "Patan": {
    center: [23.8490, 72.1266],
    radius: 15,
    bounds: {
      latMin: 23.78,
      latMax: 23.92,
      lngMin: 72.05,
      lngMax: 72.20
    }
  },
  "Mehsana": {
    center: [23.5880, 72.3693],
    radius: 15,
    bounds: {
      latMin: 23.50,
      latMax: 23.68,
      lngMin: 72.28,
      lngMax: 72.46
    }
  },
  "Surendranagar": {
    center: [22.7271, 71.6480],
    radius: 12,
    bounds: {
      latMin: 22.65,
      latMax: 22.80,
      lngMin: 71.55,
      lngMax: 71.75
    }
  },
  "Morbi": {
    center: [22.8173, 70.8377],
    radius: 12,
    bounds: {
      latMin: 22.75,
      latMax: 22.88,
      lngMin: 70.75,
      lngMax: 70.92
    }
  },
  "Porbandar": {
    center: [21.6417, 69.6293],
    radius: 10,
    bounds: {
      latMin: 21.58,
      latMax: 21.71,
      lngMin: 69.55,
      lngMax: 69.72
    }
  },
  "Amreli": {
    center: [21.6032, 71.2221],
    radius: 12,
    bounds: {
      latMin: 21.53,
      latMax: 21.68,
      lngMin: 71.15,
      lngMax: 71.30
    }
  },
  "Botad": {
    center: [22.1696, 71.6667],
    radius: 10,
    bounds: {
      latMin: 22.11,
      latMax: 22.23,
      lngMin: 71.60,
      lngMax: 71.73
    }
  },
  "Kutch": {
    center: [23.7337, 69.8597],
    radius: 60,
    bounds: {
      latMin: 22.70,
      latMax: 24.30,
      lngMin: 68.50,
      lngMax: 71.50
    }
  },
  "Banaskantha": {
    center: [24.1725, 72.4380],
    radius: 40,
    bounds: {
      latMin: 23.80,
      latMax: 24.60,
      lngMin: 71.50,
      lngMax: 73.00
    }
  },
  "Sabarkantha": {
    center: [23.5981, 73.0024],
    radius: 25,
    bounds: {
      latMin: 23.40,
      latMax: 23.80,
      lngMin: 72.80,
      lngMax: 73.20
    }
  },
  "Aravalli": {
    center: [23.6047, 73.2980],
    radius: 20,
    bounds: {
      latMin: 23.20,
      latMax: 24.00,
      lngMin: 73.00,
      lngMax: 73.50
    }
  },
  "Kheda": {
    center: [22.7507, 72.6850],
    radius: 20,
    bounds: {
      latMin: 22.60,
      latMax: 22.90,
      lngMin: 72.50,
      lngMax: 72.90
    }
  },
  "Mahisagar": {
    center: [23.1460, 73.6190],
    radius: 20,
    bounds: {
      latMin: 22.90,
      latMax: 23.40,
      lngMin: 73.30,
      lngMax: 73.90
    }
  },
  "Dang": {
    center: [20.7570, 73.6866],
    radius: 15,
    bounds: {
      latMin: 20.55,
      latMax: 20.95,
      lngMin: 73.50,
      lngMax: 73.85
    }
  },
  "Tapi": {
    center: [21.1276, 73.3890],
    radius: 15,
    bounds: {
      latMin: 21.00,
      latMax: 21.25,
      lngMin: 73.25,
      lngMax: 73.55
    }
  },
  "Narmada": {
    center: [21.8763, 73.5020],
    radius: 20,
    bounds: {
      latMin: 21.70,
      latMax: 22.05,
      lngMin: 73.35,
      lngMax: 73.70
    }
  },
  "Chhota Udaipur": {
    center: [22.3042, 74.0150],
    radius: 20,
    bounds: {
      latMin: 22.15,
      latMax: 22.45,
      lngMin: 73.80,
      lngMax: 74.20
    }
  },
  "Dahod": {
    center: [22.8358, 74.2550],
    radius: 20,
    bounds: {
      latMin: 22.65,
      latMax: 23.00,
      lngMin: 74.10,
      lngMax: 74.40
    }
  },
  "Devbhumi Dwarka": {
    center: [22.2442, 68.9685],
    radius: 30,
    bounds: {
      latMin: 21.80,
      latMax: 22.70,
      lngMin: 68.70,
      lngMax: 69.80
    }
  },
  "Gir Somnath": {
    center: [20.9120, 70.3670],
    radius: 25,
    bounds: {
      latMin: 20.50,
      latMax: 21.20,
      lngMin: 70.20,
      lngMax: 70.90
    }
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get city from coordinates using multiple strategies
 * @param {number} latitude - Latitude of the location
 * @param {number} longitude - Longitude of the location
 * @returns {string|null} City name or null if not found
 */
function getCityFromCoordinates(latitude, longitude) {
  if (!latitude || !longitude) {
    return null;
  }

  // Strategy 1: Quick bounding box check first for performance
  const candidates = [];
  
  for (const [cityName, cityData] of Object.entries(cityBoundaries)) {
    const { bounds, center, radius } = cityData;
    
    // Quick bounding box check
    if (
      latitude >= bounds.latMin &&
      latitude <= bounds.latMax &&
      longitude >= bounds.lngMin &&
      longitude <= bounds.lngMax
    ) {
      // Calculate actual distance from city center
      const distance = calculateDistance(latitude, longitude, center[0], center[1]);
      
      candidates.push({
        city: cityName,
        distance,
        withinRadius: distance <= radius
      });
    }
  }

  // If no candidates from bounding box, return null
  if (candidates.length === 0) {
    console.log(`[CityLookup] No city found for coordinates: ${latitude}, ${longitude}`);
    return null;
  }

  // Sort by distance and find the closest city
  candidates.sort((a, b) => a.distance - b.distance);
  const closest = candidates[0];

  // If within radius, return that city
  if (closest.withinRadius) {
    console.log(`[CityLookup] Found city: ${closest.city} (distance: ${closest.distance.toFixed(2)} km)`);
    return closest.city;
  }

  // If not within any radius but has candidates, return closest anyway
  // This handles edge cases at boundaries
  console.log(`[CityLookup] Closest city: ${closest.city} (distance: ${closest.distance.toFixed(2)} km, outside radius)`);
  return closest.city;
}

/**
 * Get all supported cities
 * @returns {string[]} Array of city names
 */
function getSupportedCities() {
  return Object.keys(cityBoundaries);
}

/**
 * Get city boundary data
 * @param {string} city - City name
 * @returns {object|null} City boundary data or null
 */
function getCityBoundary(city) {
  return cityBoundaries[city] || null;
}

module.exports = {
  getCityFromCoordinates,
  getSupportedCities,
  getCityBoundary,
  calculateDistance,
  cityBoundaries
};

