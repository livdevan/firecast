import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
admin.initializeApp();

export const getCitiesWeather = functions.https.onRequest(
  async (request, response) => {
    try {
      const citiesSnapshot = await admin
        .firestore()
        .doc("areas/greater-boston")
        .get();
      const cities = citiesSnapshot.data()!.cities;
      const promises: any[] = [];
      for (const city in cities) {
        // console.log(city);
        const p = admin
          .firestore()
          .doc(`cities-weather/${city}`)
          .get();
        promises.push(p);
      }
      const citySnapshots = await Promise.all(promises);
      // console.log(citySnapshots);
      const results: any = [];
      citySnapshots.forEach(citySnap => {
        const data = citySnap.data();
        results.push(data);
      });
      response.send(results);
    } catch (error) {
      console.log(error);
      response.status(500).send(error);
    }
  }
);

export const onBostonWeatherUpdate = functions.firestore
  .document("cities-weather/boston - ma - us")
  .onUpdate(change => {
    const after = change.after.data();
    const payload = {
      data: {
        temp: String(after!.temp),
        conditions: after!.conditions
      }
    };
    return admin
      .messaging()
      .sendToTopic("weather_boston-ma-us", payload)
      .catch(error => console.error("FCM Failed", error));
  });

export const getBostonWeather = functions.https.onRequest(
  async (request, response) => {
    try {
      const snapshot = await admin
        .firestore()
        .doc("cities-weather/boston - ma - us")
        .get();
      const data = snapshot.data();
      response.send(data);
    } catch (error) {
      console.log(error);
      response.status(500).send(error);
    }
  }
);
