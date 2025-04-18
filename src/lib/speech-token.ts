import Cookies from "universal-cookie";

export async function getTokenOrRefresh() {
  const cookie = new Cookies();
  const speechToken = cookie.get("speech-token");

  if (speechToken === undefined) {
    try {
      const res = await fetch("/api/speech-token");

      if (!res.ok) {
        const errorData = await res.text();
        // console.log(errorData);
        return { authToken: null, error: errorData };
      }

      const data = await res.json();
      const token = data.token;
      const region = data.region;

      cookie.set("speech-token", region + ":" + token, {
        maxAge: 540,
        path: "/",
      });
      //   console.log("Token fetched from back-end: " + token);
      return { authToken: token, region: region };
    } catch (err) {
      //   console.log(err instanceof Error ? err.message : String(err));
      return {
        authToken: null,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  } else {
    // console.log("Token fetched from cookie: " + speechToken);
    const idx = speechToken.indexOf(":");
    return {
      authToken: speechToken.slice(idx + 1),
      region: speechToken.slice(0, idx),
    };
  }
}
