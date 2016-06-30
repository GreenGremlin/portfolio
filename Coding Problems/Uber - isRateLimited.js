// Looks like you're still coding. :)
// If you have something cool to share, please feel free to email me at jcummins@uber.com.

// isRateLimited(route) // returns true if > 100 requests / hour / route, false otherwise

// route = "/auth/login", "/user/:id"

/*
    {
        '/auth/login': [_time_, _time_, ...]
    }
    {
        '/auth/login': { requests: [_time1_, _time2_, ...], oldest: _time1_ }
    }
    {
        '/auth/login': { counts: [], lastTime } // where counts is a 60 element array containing the counts for each minute in the last hour
    }
    {
        '/whatever': [ x0, x1, ... x59 ] where xN is an int that represents the count of calls in that minute
    }
*/

// REQUEST_LIMIT = 100  LIMIT_INTERVAL = 60*60*1000 is 100 requests / hour
const REQUEST_LIMIT = 10;
// const LIMIT_INTERVAL = 60*60*1000;
const LIMIT_INTERVAL = 600;

// less divisions will be more performant, but less accurate (at most it will be off by LIMIT_INTERVAL / NUM_DIVISIONS)
const NUM_DIVISIONS = 100;
const DIVISION_SIZE = LIMIT_INTERVAL / NUM_DIVISIONS;
const ZERO_ARRAY = Array.apply(null, Array(NUM_DIVISIONS)).map(Number.prototype.valueOf, 0);

// const makeNumberArray = (count, value = 0) => Array.apply(null, Array(count)).map(Number.prototype.valueOf, value);
// Array.prototype.slice is significantly more efficient than the above method of creating a new array
const makeZeroArray = (count) => ZERO_ARRAY.slice(0, count);

/**
 * First iteration, keeps a timestamp for all requests
 *
 */
function isRateLimitedA(route, requests) {
    const currentTime = Date.now();
    const recentRequests = requests[route] ? requests[route].filter(req => req > currentTime - LIMIT_INTERVAL) : [];
    let isLimited = recentRequests.length >= REQUEST_LIMIT;

    if (!isLimited) {
        requests[route] = [...recentRequests, currentTime];
    }

    return isLimited;
}

/**
 * Using time divisions / buckets, instead of tracking the timestamp for every request.
 *
 * Throws away counts that are older than the LIMIT_INTERVAL and refills the counts array with 0s
 *
 */
function getUpdatedCounts({ counts, lastTime }) {
    let expiredDivisions = lastTime ? Math.floor((Date.now() - lastTime) / DIVISION_SIZE) : counts.length;
    // remove expired request counts
    let updatedCounts = expiredDivisions < counts.length ? counts.slice(expiredDivisions) : makeZeroArray(counts.length);

    if (updatedCounts.length < counts.length) {
        // refill the counts with 0s
        updatedCounts = updatedCounts.concat(makeZeroArray(counts.length - updatedCounts.length));
    }
    return [updatedCounts, expiredDivisions];
}

function isRateLimitedB(route, requests) {
    let counts;
    let expiredCount;
    if (!requests[route]) {
        requests[route] = {};
        counts = makeZeroArray(NUM_DIVISIONS);
        expiredCount = 0;
    }
    else {
        [counts, expiredCount] = getUpdatedCounts(requests[route]);
    }
    const isLimited = counts.reduce((total, count) => total + count, 0) >= REQUEST_LIMIT;

    if (!isLimited) {
        counts[counts.length - 1] += 1;
        if (requests[route].lastTime && expiredCount < counts.length) {
            requests[route].lastTime = requests[route].lastTime + expiredCount * DIVISION_SIZE;
        }
        else {
            requests[route].lastTime = Date.now();
        }
        requests[route].counts = counts;
    }

    return isLimited;
}

/**
 * Non-pure version (with side-effects)
 *
 * The call to updatCountsWithSideEffects modifies the parameter,
 * which breaks best practices but is much faster.
 *
 */
function updatCountsWithSideEffects(route) {
    const { counts, lastTime, index = 0 } = route;
    let totalCount = route.totalCount || 0;
    const currentTime = Date.now();
    const expiredDivisions = lastTime ? Math.floor((currentTime - lastTime) / DIVISION_SIZE) : counts.length;
    let i = expiredDivisions >= counts.length ? 0 : index;
    const endIndex = i + Math.min(expiredDivisions, counts.length);

    // remove expired requests
    for (; i < endIndex; i++) {
        totalCount -= counts[i % counts.length];
        counts[i % counts.length] = 0;
    }
    route.index = endIndex % counts.length;
    route.lastTime = expiredDivisions === counts.length ? currentTime : lastTime + expiredDivisions * DIVISION_SIZE;
    route.totalCount = totalCount;
}

function isRateLimitedC(route, requests) {
    if (!requests[route]) {
        requests[route] = { counts: makeZeroArray(NUM_DIVISIONS), lastTime: Date.now(), totalCount: 0 };
    }
    else {
        updatCountsWithSideEffects(requests[route]);
    }

    if (requests[route].totalCount >= REQUEST_LIMIT) {
        return true;
    }
    requests[route].counts[requests[route].counts.length - 1] += 1;
    requests[route].totalCount += 1;
    return false;
}

function testRateLimiter(rateLimiterFn, count = REQUEST_LIMIT + 2, requestHistory = {}) {
    let totalTime = 0;
    let results = '';

    const scheduleTest = (delay) => {
        // simulating requests made at an interval
        return new Promise((resolve) => setTimeout(() => {
            const startTime = Date.now();
            results += rateLimiterFn(`/auth/login`, requestHistory) ? '-' : '+';

            // A rough benchmark - not very accurate
            totalTime += Date.now() - startTime;
            resolve();
        }, delay));
    };
    const tests = [];
    for(let i = 0; i < count; i++) {
        // fire off the tests at 20ms intervals
        tests.push(scheduleTest(20 * i));
    }
    return Promise.all(tests).then(() => {
        // Function.name polyfill would be needed to support IE
        console.info(`Results for ${rateLimiterFn.name}('/auth/login') (${totalTime}ms):`);
        console.info(results);
    })
}

function handleError(error) {
    if (error.message) {
        console.error(error.message);
    }
    if (error.stack) {
        console.error(error.stack);
    }
}

// ensure the tests don't run in parallel
Promise.resolve().then(() =>
    testRateLimiter(isRateLimitedA, 160)
).then(() =>
    testRateLimiter(isRateLimitedB, 160)
).then(() =>
    testRateLimiter(isRateLimitedC, 160)
).catch(handleError);

// someday...
// try {
//     await testRateLimiter('A', 160);
//     await testRateLimiter('B', 160);
//     await testRateLimiter('C', 160);
// }
// catch (error) {
//     handleError(error);
// }
