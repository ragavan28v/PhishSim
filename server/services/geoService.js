const axios = require('axios');

/**
 * Get geolocation information for an IP address
 * @param {string} ip - IP address to look up
 * @returns {Promise<Object>} - Geolocation information
 */
const getGeoInfo = async (ip) => {
  try {
    const response = await axios.get(`https://ipinfo.io/${ip}/json`, {
      headers: {
        'Authorization': `Bearer ${process.env.IPINFO_TOKEN}`
      }
    });

    return {
      ip: response.data.ip,
      city: response.data.city,
      region: response.data.region,
      country: response.data.country,
      location: response.data.loc,
      org: response.data.org,
      timezone: response.data.timezone
    };
  } catch (error) {
    console.error('Error getting geolocation info:', error);
    throw error;
  }
};

/**
 * Get geolocation information for the current request
 * @param {Object} req - Express request object
 * @returns {Promise<Object>} - Geolocation information
 */
const getRequestGeoInfo = async (req) => {
  try {
    // Get IP from request
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress;

    // Remove IPv6 prefix if present
    const cleanIp = ip.replace(/^::ffff:/, '');
    
    return await getGeoInfo(cleanIp);
  } catch (error) {
    console.error('Error getting request geolocation info:', error);
    throw error;
  }
};

async function getLocationFromIP(ip) {
  // Return dummy location data for development
  return {
    country: 'Unknown',
    region: 'Unknown',
    city: 'Unknown',
    coordinates: [0, 0]
  };
}

module.exports = {
  getGeoInfo,
  getRequestGeoInfo,
  getLocationFromIP
}; 