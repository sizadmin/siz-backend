const hostname = window && window.location && window.location.hostname;

const backendHost = {
  getAPIUrl: () => {
    if (hostname === "localhost") {
      return `http://localhost:8087/api`;
    } else if (hostname === "siz-front-end.web.app") {
      return `https://backend.siz.ae/api`;
    } else return "https://backend.siz.ae/api";
  },
};

export { backendHost };
