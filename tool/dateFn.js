function makeFormData() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    let formattedDate = year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
    let formattedTime = (hours < 10 ? "0" + hours : hours) + ":" + (minutes < 10 ? "0" + minutes : minutes);

    return {
        day: formattedDate,
        time: formattedDate + ' ' + formattedTime
    };
}

// 判断是否大于 1 天
function decideTimeOfNextDay(nowdate, lastDate) {
    if (!lastDate) {
        return true;
    }
    let currentDate = +new Date(nowdate);
    let targetDate = +new Date(lastDate);
    return currentDate - targetDate >= 86400000;
}

// 判断是否大于 指定小时
function decideTimeOfNextHour(nowdate, lastDate, hour) {
    if (!lastDate) {
        return true;
    }
    let currentDate = +new Date(nowdate);
    let targetDate = +new Date(lastDate);

    return currentDate - targetDate >= hour * 3600000;
}

module.exports = {
    makeFormData,
    decideTimeOfNextDay,
    decideTimeOfNextHour
};
