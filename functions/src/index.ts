import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
admin.initializeApp();

export const getCitiesWeather = functions.https.onRequest(
  (request, response) => {
    admin
      .firestore()
      .doc("areas/greater-boston")
      .get()
      .then(citiesSnapshot => {
        const cities = citiesSnapshot.data()!.cities;
        console.log("cities is ", cities);

        const promises: any[] = [];

        for (const city in cities) {
          console.log(city);
          const p = admin
            .firestore()
            .doc(`cities-weather/${city}`)
            .get();
          promises.push(p);
        }
        return Promise.all(promises);
      })
      .then(citySnapshots => {
        console.log(citySnapshots);
        const results: any = [];
        citySnapshots.forEach(citySnap => {
          const data = citySnap.data();
          results.push(data);
        });
        response.send(results);
      })
      .catch(error => {
        console.log(error);
        response.status(500).send(error);
      });
  }
);

// export const getBostonAreaWeather = functions.https.onRequest((req, res) => {
//   admin
//     .firestore()
//     .doc("areas/greater-boston")
//     .get()
//     .then(areaSnapshot => {
//       const cities = areaSnapshot.get("cities");
//       const promises = [];
//       for (const city in cities) {
//         const p = admin
//           .firestore()
//           .doc(`cities-weather/${city}`)
//           .get();
//         promises.push(p);
//       }
//       return Promise.all(promises);
//     })
//     .then(citySnapshots => {
//       const results: any = [];
//       citySnapshots.forEach(citySnap => {
//         const data = citySnap.data();
//         results.push(data);
//       });
//       res.send(results);
//     })
//     .catch(error => {
//       console.log(error);
//       res.status(500).send(error);
//     });
//   admin
//     .firestore()
//     .doc("areas/greater-boston")
//     .get()
//     .then(areaSnapshot => {
//       areaSnapshot
//         .data()!
//         .cities.map(city => {
//           return admin
//             .firestore()
//             .doc(`cities-weather/${city}`)
//             .get();
//         })
//         .then(citiesArr => {
//           return Promise.all(citiesArr);
//         });
//     })
//     .then(citySnapshots => {
//       citySnapshots
//         .map(citySnap => {
//           return citySnap.data();
//         })
//         .then(cityArr => {
//           res.send(cityArr);
//         })
//         .catch(error => {
//           console.log(error);
//           res.status(500).send(error);
//         });
//     });
// });

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
  (request, response) => {
    admin
      .firestore()
      .doc("cities-weather/boston - ma - us")
      .get()
      .then(snapshot => {
        const data = snapshot.data();
        response.send(data);
      })
      .catch(error => {
        console.log(error);
        response.status(500).send(error);
      });
  }
);
