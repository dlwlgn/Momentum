# Momentum
크롬 확장 프로그램인 모멘텀을 오마주한 미니 프로젝트
https://chrome.google.com/webstore/detail/momentum/laookkfknpbbblfpciffpaejjkokdgca?hl=ko&utm_source

## 구현 기능
- 내장 함수를 이용해 얻어진 위치 정보로 날씨 api 활용
- date 함수를 활용하여 시분초 실시간 표현 및 시간에 따라 배경화면이 바뀌는 동적 웹페이지
- 로컬 스토리지를 활용한 ToDoList CRUD 구현

## index.js
```js
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
        timer.textContent = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
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
    })
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
        const data = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=99aca4a42befae82a1b06702817b5628`)
        return data;
    }
    //위도와 경도가 없는 경우
    const data = await axios.get(`http://api.openweathermap.org/data/2.5/forecast?q=Seoul&appid=99aca4a42befae82a1b06702817b5628`)
    return data;
}

async function getCurWeather(latitude, longitude) {
    //위도와 경도가 있는 경우
    if (latitude && longitude) {
        const data = await axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=99aca4a42befae82a1b06702817b5628`)
        return data;
    }
    //위도와 경도가 없는 경우
    const data = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=99aca4a42befae82a1b06702817b5628`)
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
        //console.log("test 5days");
        const weatherResponse = await get5DaysWeather(latitude, longitude);
        const weatherData = weatherResponse.data;
        //console.log(weatherData);
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
        console.log("test cur");
        const weatherResponse = await getCurWeather(latitude, longitude);
        const weatherData = weatherResponse.data;
        const curWeather = weatherData.weather[0].main;
        //console.log(weatherData)
        const modalIcon = document.querySelector(".modal-button");
        modalIcon.style.backgroundImage = `url(".${matchIcon(curWeather)}")`;
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
})();
```

## index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-BmbxuPwQa2lc/FVzBcNJ7UAyJxM6wuqIj61tLrc4wSX0szH/Ev+nYRRuWlolflfl" crossorigin="anonymous">
    <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-b5kHyXgcpbZJO/tY9Ul7kGkf1S0CWuKcCD38l8YkeH8z8QjE0GmW1gYU5S9FOnJ0"
        crossorigin="anonymous"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    
    
    <script defer src="./index.js"></script>

    <style>
        body{
            background-size: cover;
            background-repeat: no-repeat;
        }
        .main-container{
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            color: white;
        }
        /* 타이머 */
        .timer{
            font-weight: 500;
            font-size: 168px;
            line-height: 168px;
        }
        .timer-content{
            font-weight: bold;
            font-size: 40px;
            text-align: center;
        }
        /* 메모 */
        .memo-wrapper{
            font-size: 24px;
            font-weight: bold;
            display: flex;
            flex-direction:column;
            text-align: center;
        }
        .memo{
            font-size:30px;
        }
        .modal-button{
            position:fixed;
            right:40px;
            top:40px;
            background: url("./images/001-cloud.png");
            width:100px;
            height:100px;
            background-size: cover;
            cursor: pointer;
        }

    </style>
</head>
<body>
    <div class="main-container">
        <!-- 타이머 + 인사 -->
        <div class="timer-wrapper">
            <div class="timer"></div>
            <div class="timer-content"></div>
        </div>
        <!-- 메모 작성 -->
        <div class="m-3">
            <input type="text" class="memo-input form-control" placeholder="오늘 할 일을 입력하세요.">
        </div>
        <!-- 메모 표시 -->
        <div class="memo-wrapper">
            <div class="memo-title">TODAY</div>
            <div class="memo"></div>
        </div>

        <!-- 모달 부분 -->
        <!-- Button trigger modal -->
        <div class="modal-button" data-bs-toggle="modal" data-bs-target="#exampleModal">
            
        </div>
        
        <!-- Modal -->
        <div class="modal" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content bg-transparent border-0">
                    <div class="modal-header border-0">
                        <h5 class="modal-title" id="exampleModalLabel">날씨</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body d-flex">
                        <!-- <div class="card shadow-sm bg-transparent mb-3 m-2 flex-grow-1">
                            
                            <div class="card-header text-white text-center">
                                2021-02-02 <span>오전</span>
                            </div>
                            
                            <div class="card-body d-flex">
                                <div class="flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                                    <h5 class="card-title">
                                        Cloud
                                    </h5>
                                    <img src="./images/001-cloud.png" width="60px" height="60px"/>
                                    <p class="card-text">40도</p>
                                </div>
                            </div>

                        </div> -->
                    </div>
                    <div class="modal-footer border-0">
                        
                    </div>
                </div>
            </div>
        </div>


    </div>
</body>
</html>
````
