const fetch = require("node-fetch");
const _ = require("lodash");

let postsUrl = 'https://jsonplaceholder.typicode.com/posts';
let usersUrl = 'https://jsonplaceholder.typicode.com/users';

//1.pobierze dane o postach z https://jsonplaceholder.typicode.com/posts i połączy je z danymi o
// userach https://jsonplaceholder.typicode.com/users
Promise.all([
    fetch(postsUrl).then(posts => posts.json()),
    fetch(usersUrl).then(users => users.json())
])
    .then(([posts, users]) => {
        const merged =
            posts.map(itm => ({
                ...users.find((item) => (item.id === itm.userId) && item),
                ...itm
            }));

        //2.policzy ile postów napisali userzy i zwróci listę stringów w postaci “user_name napisał(a) count
        // postów”
        var lista = [];
        for (var i = 1; i <= 10; i++) {
            var ccc = merged.filter(function (value) {
                return value.userId === i;
            }).length
            var ddd = merged.filter(function (value) {
                return value.userId === i;
            }).map(x => x.username);
            var res = [...new Set(ddd)];
            lista.push(res + " napisał(a) " + ccc + " postów ");
        }

        //3.sprawdzi czy tytuły postów są unikalne i zwróci listę tytułów które nie są.
        let duplicates = _.filter(merged, function (value) {
            return _.filter(merged, {title: value.title}).length > 1;
        });
        //4.dla każdego użytkownika znajdzie innego użytkownika, który mieszka najbliżej niego
        const seen = new Set();
        const newArray = merged.map(item => ({
            userId: item.userId,
            latitude: item.address.geo.lat,
            longitude: item.address.geo.lng,
            nearestUser: 0
        }));
        const filteredArr = newArray.filter(el => {
            const duplicate = seen.has(el.userId);
            seen.add(el.userId);
            return !duplicate;
        });
        function calcCrow(lat1, lon1, lat2, lon2) {
            var R = 6371; // km
            var dLat = toRad(lat2 - lat1);
            var dLon = toRad(lon2 - lon1);
            var lat1 = toRad(lat1);
            var lat2 = toRad(lat2);

            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c;
            return d;
        }
        // Converts numeric degrees to radians
        function toRad(Value) {
            return Value * Math.PI / 180;
        }
        function nearestUser(id) {
            var min = 99999;
            for (var i = 0; i < filteredArr.length; i++) {
                if (calcCrow(filteredArr[id]["latitude"], filteredArr[id]["longitude"], filteredArr[i]["latitude"], filteredArr[i]["longitude"]) < min) {
                    if (id != i) {
                        min = calcCrow(filteredArr[id]["latitude"], filteredArr[id]["longitude"], filteredArr[i]["latitude"], filteredArr[i]["longitude"]);
                        filteredArr[id].nearestUser = i + 1;
                    }
                }
            }
            return min;
        }
        for (var i = 0; i < filteredArr.length; i++) {
            nearestUser(i);
        }

        console.log(merged);
        console.log(lista)
        if (duplicates.length > 0) {
            console.log(duplicates)
        } else {
            console.log("Żaden z tytułów się nie powtarza");
        }
        console.log(filteredArr);

    })
    .catch((err) => {
        console.log(err);
    });
