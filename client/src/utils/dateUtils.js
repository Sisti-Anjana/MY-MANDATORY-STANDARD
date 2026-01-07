/**
 * Utility functions for handling dates and times in EST (Eastern Standard Time).
 * This ensures consistency regardless of the user's local machine timezone.
 */

/**
 * Gets the current date/time adjusted to US Eastern Time (EST/EDT).
 * @returns {Date} A new Date object representating the current time in EST.
 */
export const getNewYorkDate = () => {
    // Use Intl API to get the current time in EST/EDT
    const now = new Date();
    const options = {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };

    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);

    const dateMap = {};
    parts.forEach(part => {
        dateMap[part.type] = part.value;
    });

    // Construct a new Date object treated interpreted as local but representing EST
    // This is safer than shifting seconds manually for cross-platform consistency
    const estDate = new Date(
        `${dateMap.year}-${dateMap.month}-${dateMap.day}T${dateMap.hour}:${dateMap.minute}:${dateMap.second}`
    );

    return estDate;
};

// TEMPORARY alias to find who is calling getESTDate
export const getESTDate = () => {
    console.warn('⚠️ getESTDate is being called! This function is deprecated. See trace below:');
    console.trace();
    return getNewYorkDate();
};

/**
 * Gets the current hour (0-23) in EST.
 * @returns {number}
 */
export const getCurrentESTHour = () => {
    return getNewYorkDate().getHours();
};

/**
 * Gets the current date string (YYYY-MM-DD) in EST.
 * @returns {string}
 */
export const getCurrentESTDateString = () => {
    const est = getNewYorkDate();
    const year = est.getFullYear();
    const month = String(est.getMonth() + 1).padStart(2, '0');
    const day = String(est.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Converts any date string or object to an EST Date object.
 * @param {string|Date} dateSource 
 * @returns {Date}
 */
export const convertToEST = (dateSource) => {
    if (!dateSource) return getNewYorkDate();

    const date = new Date(dateSource);
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(date);
    const dateMap = {};
    parts.forEach(part => {
        dateMap[part.type] = part.value;
    });

    return new Date(
        `${dateMap.year}-${dateMap.month}-${dateMap.day}T${dateMap.hour}:${dateMap.minute}:${dateMap.second}`
    );
};
