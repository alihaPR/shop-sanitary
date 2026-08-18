
const IS_LOCAL =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1";

const SERVER_URL = IS_LOCAL
    ? "http://localhost:5000"
    : "https://api.narmcenter.com";

const API_BASE_URL = `${SERVER_URL}/api`;