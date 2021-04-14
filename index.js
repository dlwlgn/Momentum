//배경을 변경해주는 함수
async function setRenderBackground(){
    const result = await axios.get("https://picsum.photos/1280/720", {
        responseType: "blob" //안넣으면 result가 깨진다.
    })
    //console.log(result.data);
    //이미지에 url로 src="url" 만들어야함
    const data = URL.createObjectURL(result.data);
    //console.log(data);
    document.querySelector("body").style.backgroundImage = `url(${data})`;
}

//시계 설정 함수
function setTime(){
    const timer = document.querySelector(".timer");
    const timerContent = document.querySelector(".timer-content");
    setInterval(() => {
        const date = new Date();
        timer.textContent = `${date.getHours().toString().padStart(2,"0")}:${date.getMinutes().toString().padStart(2,"0")}:${date.getSeconds().toString().padStart(2,"0")}`;
        if (date.getHours() >= 12) timerContent.textContent = 'Good Evening Jihun'
        else timerContent.textContent = 'Good Morning Jihun'
    }, 1000)
}

//메모 불러오기
function getMemo(){
    const memo = document.querySelector(".memo");
    const memoValue = localStorage.getItem("todo");
    memo.textContent = memoValue;
}

//메모 저장
function setMemo() {
    const memoInput = document.querySelector(".memo-input");
    memoInput.addEventListener("keyup", function(e){
        console.log(e.code);
        console.log(e.target.value);
        if(e.code === "Enter" && e.target.value){
            localStorage.setItem("todo", e.target.value);
            getMemo();
            memoInput.value = "";
        }
    })
}

//메모 삭제
function deleteMemo() {
    document.addEventListener("click", function (e) {
        console.log(e.target);
        if (e.target.classList.contains("memo")) {
            localStorage.removeItem("todo");
            e.target.textContent = "";
        }
    })
}

function memos(){
    getMemo();
    setMemo();
    deleteMemo();
}



//99aca4a42befae82a1b06702817b5628

//위도 경도 가져오기 => 프로미스화
function getPosition(options){
    return new Promise(function(resolve, reject){
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

function matchIcon(weatherData){
    if(weatherData === "Clear") return './images/039-sun.png';
    else if (weatherData === "Clouds") return './images/001-cloud.png';
    else if (weatherData === "Rain") return './images/003-rainy.png';
    else if (weatherData === "Snow") return './images/006-snowy.png';
    else if (weatherData === "Thunderstorm") return './images/008-storm.png';
    else if (weatherData === "Drizzle") return './images/031-snowflake.png';
    else if (weatherData === "Atmosphere") return './images/033-hurricane.png';
}

//날씨 가져오기
async function get5DaysWeather(latitude, longitude){
    //위도와 경도가 있는 경우
    if(latitude && longitude){
        const data = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=99aca4a42befae82a1b06702817b5628`)
        return data;
    }
    //위도와 경도가 없는 경우
    const data = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=99aca4a42befae82a1b06702817b5628`)
    return data;
}

async function getCurWeather(latitude, longitude) {
    //위도와 경도가 있는 경우
    if (latitude && longitude) {
        const data = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=99aca4a42befae82a1b06702817b5628`)
        return data;
    }
    //위도와 경도가 없는 경우
    const data = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=99aca4a42befae82a1b06702817b5628`)
    return data;
}


function weatherWrapperComponent(li){
    // console.log(li);
    const changeToCelsius = (temp) => (temp - 273.15).toFixed(1);
    
    return `
        <div class="card shadow-sm bg-transparent mb-3 m-2 flex-grow-1">
            <div class="card-header text-white text-center">
                ${li.dt_txt.split(" ")[0]}
            </div>                  
            <div class="card-body d-flex">
                <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                    <h5 class="card-title">
                        ${li.weather[0].main}
                    </h5>
                    <img src="${matchIcon(li.weather[0].main)}" width="60px" height="60px"/>
                    <p class="card-text">${changeToCelsius(li.main.temp)}</p>
                </div>
            </div>
        </div>
    `
}

//위도와 경도를 받아서 데이터를 받아오기
async function renderWeather(){
    let latitude= '';
    let longitude = '';
    try{
        const position = await getPosition();
        //console.log(position.coords.latitude);
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
    }
    catch(err){
        console.log(err);
    }
    finally{ //에러가 없으면 try후 넘어옴
        const weatherResponse = await get5DaysWeather(latitude, longitude);
        const weatherData = weatherResponse.data;
        const weatherList = weatherData.list.reduce((acc,cur)=>{
            if(cur.dt_txt.indexOf("18:00:00")>0){
                acc.push(cur);
            }
            return acc;
        },[]);
        // console.log(weatherList);
        const modalBody = document.querySelector(".modal-body");
        modalBody.innerHTML = weatherList.map(li=>{
            return weatherWrapperComponent(li);
        }).join(""); //배열을 한 문자열로 합친다.
    }
}

async function renderModalIcon(){
    let latitude = '';
    let longitude = '';
    try {
        const position = await getPosition();
        //console.log(position.coords.latitude);
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
    }
    catch (err) {
        console.log(err);
    }
    finally { //에러가 없으면 try후 넘어옴
        const weatherResponse = await getCurWeather(latitude, longitude);
        const weatherData = weatherResponse.data;
        const curWeather = weatherData.weather[0].main;
        const modalIcon = document.querySelector(".modal-button");
        modalIcon.style.backgroundImage = `url("${matchIcon(curWeather)}")`;
    }
}

(function() {
    setRenderBackground();
    // 5초마다 계속 호출
    setInterval(()=>{
        setRenderBackground();
    }, 5000)
    setTime();
    memos();
    renderWeather();
    renderModalIcon();
    setInterval(()=>{
        renderWeather();
        renderModalIcon();
    }, 5000)
    
})();
