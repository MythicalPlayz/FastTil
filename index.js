function getLocation() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let lat = position.coords.latitude;
                let long = position.coords.longitude;
                resolve([lat, long]);
            },
            (error) => {
                alert("Please Enable Location");
                reject([]);
            }
        );
    });
}

function hasLocationSupport() {
    if (!'geolocation' in navigator){
        alert("Browser/Device is Not Supported")
        return false
    }
    return true
}

async function getTime(date,location){
    let data = await fetch(`https://api.aladhan.com/v1/calendar/${date.year}/${date.month}?latitude=${location[0]}&longitude=${location[1]}`)
    if (!data.ok)
        throw new Error ("Network Response is not Ok")
    return await data.json();
}

async function init(){
    if (!hasLocationSupport()){
        return 0;
    }
    let location = await getLocation();
    if (location.length === 0){
        return 0;
    }

    var currentDate = new Date();

    let date = {
        'year': currentDate.getFullYear(),
        'month': currentDate.getMonth() + 1
    }

    let data = await getTime(date,location)
    return data.data
}

function getFromCache(key){
    return localStorage.getItem(key)
}

function setToCache(key, value){
    localStorage.setItem(key,value)
}
async function setData(){
let prayerData;
let date = new Date()
let month = date.getMonth() + 1;
let cachedMonth = getFromCache("month")
    if (cachedMonth !== month.toString()){
        //get Prayer time using API
        //console.log('API')
        setToCache('month',month)
        prayerData = await init();
        setToCache('data',JSON.stringify(prayerData))
    }
    else {
        //get Prayer time from cache
        //console.log('Cache')
        prayerData = JSON.parse(getFromCache('data'))

        //if somehow it found null
        if (prayerData === null){
            prayerData = await init();
            setToCache('data',JSON.stringify(prayerData))
        }
    }
    let prayerDayData = prayerData[date.getDate() - 1]
    updateVisuals(prayerDayData)
    console.log(prayerDayData)
}

async function getCurrentPrayers(prayers){
    time = {
        "hour": Number(new Date().getHours()),
        "min": Number(new Date().getMinutes())
    }

    let Fajr = {
        "hour": Number(prayers.Fajr.substring(0,5).split(":")[0]),
        "min": Number(prayers.Fajr.substring(0,5).split(":")[1])
    }
    let Sunrise = {
        "hour": Number(prayers.Sunrise.substring(0,5).split(":")[0]),
        "min": Number(prayers.Sunrise.substring(0,5).split(":")[1])
    }
    let Dhuhr = {
        "hour": Number(prayers.Dhuhr.substring(0,5).split(":")[0]),
        "min": Number(prayers.Dhuhr.substring(0,5).split(":")[1])
    }
    let Asr = {
        "hour": Number(prayers.Asr.substring(0,5).split(":")[0]),
        "min": Number(prayers.Asr.substring(0,5).split(":")[1])
    }
    let Maghrib = {
        "hour": Number(prayers.Maghrib.substring(0,5).split(":")[0]),
        "min": Number(prayers.Maghrib.substring(0,5).split(":")[1])
    }
    let Isha = {
        "hour": Number(prayers.Isha.substring(0,5).split(":")[0]),
        "min": Number(prayers.Isha.substring(0,5).split(":")[1])
    }

    let current, next, ratio, remaining;
    if (time.hour < Fajr.hour || (time.hour === Fajr.hour && time.min < Fajr.min)){
        //Before Fajr
        let timeD = (Fajr.hour - Isha.hour + 24) * 60 + (Fajr.min - Isha.min)
        let timeN = (time.hour - Isha.hour) * 60 + (time.min - Isha.min)
        ratio = timeN / timeD
        remaining = timeD - timeN
        current = "Isha"
        next = "Fajr"
    }
    else if (time.hour < Sunrise.hour || (time.hour === Sunrise.hour && time.min < Sunrise.min)){
        //Before Sunrise
        let timeD = (Sunrise.hour - Fajr.hour) * 60 + (Sunrise.min - Fajr.min)
        let timeN = (time.hour - Fajr.hour) * 60 + (time.min - Fajr.min)
        ratio = timeN / timeD
        remaining = timeD - timeN
        current = "Fajr"
        next = "Sunrise"
    }
    else if (time.hour < Dhuhr.hour || (time.hour === Dhuhr.hour && time.min < Dhuhr.min)){
        //Before Dhuhr
        let timeD = (Dhuhr.hour - Sunrise.hour) * 60 + (Dhuhr.min - Sunrise.min)
        let timeN = (time.hour - Sunrise.hour) * 60 + (time.min - Sunrise.min)
        ratio = timeN / timeD
        remaining = timeD - timeN
        current = "Sunrise"
        next = "Dhuhr"
    }
    else if (time.hour < Asr.hour || (time.hour === Asr.hour && time.min < Asr.min)){
        //Before Asr
        let timeD = (Asr.hour - Dhuhr.hour) * 60 + (Asr.min - Dhuhr.min)
        let timeN = (time.hour - Dhuhr.hour) * 60 + (time.min - Dhuhr.min)
        ratio = timeN / timeD
        remaining = timeD - timeN
        current = "Dhuhr"
        next = "Asr"
    }
    else if (time.hour < Maghrib.hour || (time.hour === Maghrib.hour && time.min < Maghrib.min)){
        //Before Maghrib
        let timeD = (Maghrib.hour - Asr.hour) * 60 + (Maghrib.min - Asr.min)
        let timeN = (time.hour - Asr.hour) * 60 + (time.min - Asr.min)
        ratio = timeN / timeD
        remaining = timeD - timeN
        current = "Asr"
        next = "Maghrib"
    }
    else if (time.hour < Isha.hour || (time.hour === Isha.hour && time.min < Isha.min)){
        //Before Isha
        let timeD = (Isha.hour - Maghrib.hour) * 60 + (Isha.min - Maghrib.min)
        let timeN = (time.hour - Maghrib.hour) * 60 + (time.min - Maghrib.min)
        ratio = timeN / timeD
        remaining = timeD - timeN
        current = "Maghrib"
        next = "Isha"
    }
    else {
        //Isha-Fajr
        let timeD = (Fajr.hour - Isha.hour + 24) * 60 + (Fajr.min - Isha.min)
        let timeN = (time.hour - Isha.hour) * 60 + (time.min - Isha.min)
        ratio = timeN / timeD
        remaining = timeD - timeN
        current = "Isha"
        next = "Fajr"
    }

    return [current,next,remaining,ratio]
}

async function updateVisuals(prayerDayData){
    let table = document.getElementById('prayer')
    let cells = table.getElementsByTagName("td")
    cells[0].innerHTML = prayerDayData.timings.Fajr.substring(0,5)
    cells[1].innerHTML = prayerDayData.timings.Sunrise.substring(0,5)
    cells[2].innerHTML = prayerDayData.timings.Dhuhr.substring(0,5)
    cells[3].innerHTML = prayerDayData.timings.Asr.substring(0,5)
    cells[4].innerHTML = prayerDayData.timings.Maghrib.substring(0,5)
    cells[5].innerHTML = prayerDayData.timings.Isha.substring(0,5)


    let current = document.getElementById("current")
    let date = prayerDayData.date.hijri.day + ' ' + prayerDayData.date.hijri.month.en + " " + prayerDayData.date.hijri.year
    current.getElementsByTagName('h3')[0].innerHTML = "Today: " + date

    let currentPrayers = await getCurrentPrayers(prayerDayData.timings)
    current.getElementsByTagName('p')[0].innerText = "Current: " + currentPrayers[0]
    current.getElementsByTagName('p')[1].innerText = "Next: " + currentPrayers[1] + " in "  + Math.floor(currentPrayers[2] / 60) + " hours and " + currentPrayers[2] % 60  + " minutes"  
    current.getElementsByTagName('progress')[0].value = currentPrayers[3]
}
setData()
setInterval(setData, 60000);