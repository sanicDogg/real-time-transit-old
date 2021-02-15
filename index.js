var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var request = require('request');

var http = require('http');
var server = http.createServer(function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

//
// 15495 - код остановки "невский проспект"
// 3284 - код остановки "приморская"
// 1578 - код остановки "капитанская улица"
// 2064 - код остановки "гражданский проспект"
//
    // Код остановки берем из адреса страницы
    let stop = 15495;
    if (req.url.length > 1)
        stop = Number.parseInt(req.url.slice(1, req.url.length));

    res.write(`
        <button onclick='document.location.href = "/15495";'>Невский проспект</button>
        <button onclick='document.location.href = "/3284";'>Приморская</button>
        <button onclick='document.location.href = "/1578";'>Капитанская</button>
        <button onclick='document.location.href = "/2064";'>Гражданский проспект</button>`)

    var requestSettings = {
        method: 'GET',
        //url: "http://transport.orgsp.spb.ru/Portal/transport/internalapi/gtfs/realtime/vehicletrips?vehicleIDs=3361,18856,7988",
        url: `http://transport.orgp.spb.ru/Portal/transport/internalapi/gtfs/realtime/stopforecast?stopID=${stop}`,
        //url: 'http://transport.orgp.spb.ru/Portal/transport/internalapi/gtfs/realtime/vehicle?bbox=30.23,59.94,30.24,59.95&transports=bus,trolley,tram,ship&routeIDs=345',
        encoding: null
    };

    init();

    function init() {

        let result = "";
        result = "Остановка:";

        switch (stop) {
            case 3284:
                result += "\nСт. метро \"Приморская\"";
                break;
            case 15495:
                result += "\nСт. метро \"Невский проспект\"";
                break;
            case 2064:
                result += "\nСт. метро \"Гражданский проспект\"";
                break;
            case 1578:
                result += "\nКапитанская улица";
        }

        result += "\nТранспорт | Время прибытия\n";

        // Функция отправки запроса

        function opt(error, response, body) {
            if (!error && response.statusCode == 200) {

                // Лента с транспортом

                var feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(body);

                feed.entity.forEach(function (entity) {
                    if (entity.tripUpdate) {
                        // id маршрута
                        let routeId = Number.parseInt(entity.tripUpdate.trip.routeId);

                        // unix-время приезда к остановке
                        let stopTimeUpdate = entity.tripUpdate.stopTimeUpdate[0].arrival.time.low;
                        stopTimeUpdate *= 1000;
                        const dateOfArriving = new Date(stopTimeUpdate);

                        var vehicle;

                        if (stop === 15495)
                            vehicle = getTrolley(routeId)
                        if (stop === 3284 || stop === 2064 || stop === 1578 || stop === 3271)
                            vehicle = getBus(routeId)

                        vehicle += dateOfArriving.toLocaleTimeString();

                        result += "\n" + vehicle;
                    }
                });

            }
            return res.end(`<pre>${result}</pre>`);
        }

        request(requestSettings, opt);

        function getTrolley(routeId) {
            let trolley;
            switch (routeId) {
                case 1062:
                    trolley = "1";
                    break;
                case 1070:
                    trolley = "11";
                    break;
                case 1065:
                    trolley = "7";
                    break;
                case 1064:
                    trolley = "5";
                    break;
                case 1080:
                    trolley = "22";
                    break;
                case 1072:
                    trolley = "10";
                    break;
            }

            trolley += " троллейбус | ";
            return trolley;
        }

        function getBus(routeId) {
            let bus;
            switch (routeId) {
                // ст. метро Невский проспект
                case 3830:
                    bus = "191";
                    break;

                case 230:
                    bus = "27";
                    break;

                case 229:
                    bus = "24";
                    break;

                case 225:
                    bus = "22";
                    break;

                case 345:
                    bus = "7";
                    break;

                case 1329:
                    bus = "3";
                    break;

                // Капитанская
                case 1564:
                    bus = "41";
                    break;

                case 1685:
                    bus = "151";
                    break;

                // Приморская
                case 1686:
                    bus = "152";
                    break;
                case 446:
                    bus = "100";
                    break;
                case 1566:
                    bus = "47";
                    break;
                case 3079:
                    bus = "К-162";
                    break;
                // Гражданский остановка
                case 1548:
                    bus = "60";
                    break;
                case 1550:
                    bus = "61";
                    break;
                case 337:
                    bus = "93";
                    break;
                case 1801:
                    bus = "121";
                    break;
                case 1549:
                    bus = "139";
                    break;
                case 1501:
                    bus = "176";
                    break;
                case 2112:
                    bus = "183";
                    break;
                case 3812:
                    bus = "193";
                    break;
            }

            bus += " автобус | ";

            return bus;
        }
    }

});


server.listen(3000, function () {
});