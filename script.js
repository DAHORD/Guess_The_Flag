/* VARIABLES */
var difficult = "None";

//Score & time
var remainingTime=0;
var totalTime;

var score=0;
var wronged=0;
var totalScore=0;
var correctID=0;

var startTime;
var timePerFlag=0;

//Buttons
var flagButtons=[];

//Intervals
var timeInterval;

//countries
var allCountries;
var countryKeys;
var randomCountries = [];
	
/* FUNCTIONS */

function setup(){
    document.getElementById("Easy").addEventListener("click",setDifficult);
    document.getElementById("Medium").addEventListener("click",setDifficult);
    document.getElementById("Hard").addEventListener("click",setDifficult);

    //start button
    document.getElementById("start-button").addEventListener("click",startGame);

    //flag buttons
    flagButtons = document.getElementsByClassName("flag-button");
    for(let i=0; i<flagButtons.length;i++) flagButtons[i].addEventListener("click",selectedFlag);
}

/* PANEL BOX*/

function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0px";
    document.getElementById("main").style.marginLeft = "0px";
}

/* LEVEL / DIFFICULT */

function setDifficult(e){
    let target = e.target;
	
    difficult = target.innerHTML;
	
	if(difficult=="Easy"){
        totalScore = 10;
        timePerFlag=40;
    }else if(difficult=="Medium"){
        totalScore = 20;
        timePerFlag=50;
    }else{
        totalScore = 30;
        timePerFlag=60;
    }
	
    document.getElementsByClassName("difficult-container")[0].getElementsByTagName("p")[0].innerHTML = "Difficulty : "+difficult;
	document.getElementsByClassName("details-difficult-container")[0].getElementsByTagName("p")[0].innerHTML = "Flags : "+totalScore+" | Time : "+timePerFlag+"s";

}

function startGame(e){
    if(difficult!="None"){
        //start the game by hiding the start "popup" and showing the game one
        document.getElementsByClassName("start-container")[0].style.display = "none";
        document.getElementsByClassName("game-container")[0].style.display = "flex";

        startTimer();
        
    }
    else{
        document.getElementsByClassName("difficult-container")[0].getElementsByTagName("p")[0].innerHTML = "Select a difficult !";
    }
 
}

/* TIMERS AND SCORE */

function updateTime() {
    let timePassedMS = Date.now() - startTime;
    let secondsPassed = Math.floor(timePassedMS / 1000);

    remainingTime = timePerFlag - secondsPassed;

    let minutes = Math.floor(remainingTime/60);
    let seconds = Math.floor(remainingTime%60);

    let par = document.getElementsByClassName("info-container")[0].getElementsByTagName("p")[0];
    par.innerHTML = "Time left: "+minutes+":"+seconds;
	
	if (minutes == 0 && seconds == 0){
		gameOver()
		document.getElementsByClassName("res-comment")[0].getElementsByTagName("h2")[0].innerHTML = "Time is Over !";
	}
}

function startTimer(){
    totalTime = timePerFlag*totalScore;
    remainingTime = totalTime;

    document.getElementById("score-label").innerHTML = "Correct: "+score+"/"+(wronged+score);

    //timer
    startTime = Date.now();
    setTimeout(gameOver,totalTime*1000);

    //Create flags and countries name
    getRandomCountries();

    //start game over timer and the game loop
    timeInterval = setInterval(updateTime,1000);

    drawFlag();
}

/* HANDLE FLAGS & COUNTRIES NAMES */

function getCountriesJSON() {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let url = "https://flagcdn.com/en/codes.json";

        xhr.open("GET", url, true); // set async req
        xhr.responseType = "json";

        xhr.onload = function() {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject("request error");
            }
        };


        xhr.send();
    });
}

getCountriesJSON().then(data => {
    allCountries = data;
    countryKeys = Object.keys(allCountries);
})
.catch(error => {
    console.error(error); 
});


class Country{
    name;
    code;
    flagUrl;

    constructor(name, code){
        this.name=name;
        this.code=code;

        this.flagUrl= "https://flagcdn.com/w320/"+this.code+".png";
    }

}

//get random countries
function getRandomCountries(){
    let randomIndex=0;
    for(let i=0; i<totalScore;i++){
        randomIndex = Math.floor(Math.random() * countryKeys.length);
        randomCountries[i] = new Country(allCountries[countryKeys[randomIndex]],countryKeys[randomIndex]); //name and code
    }
}


/* GAME FUNCTION */

function selectedFlag(e){
    //check if is corrected
    let corrected = e.target.id == correctID;
    if(corrected){     
        e.target.style.backgroundColor = 'green';
        score++;
    }
    else{
        e.target.style.backgroundColor = 'red';
        wronged++;
    }

    //back to original color
    setTimeout(function() {
        e.target.style.backgroundColor = '#405cf5';
    }, 300); 

    document.getElementById("score-label").innerHTML = "Correct: "+score+"/"+totalScore;

    if(checkGameOver()){
        gameOver();
    }else{
        drawFlag();
    }

}

function drawFlag() {
    let index = score + wronged;
    let myCountry = randomCountries[index];

    let othersCountry = [];

    // Populate othersCountry with unique countries
    for (let i = 0; i < 3; i++) {
        let randomIndex;
        let flag = false;

        do {
            randomIndex = Math.floor(Math.random() * countryKeys.length);
            flag = false; // Reset flag

            for (let j = 0; j < othersCountry.length; j++) {
                if (countryKeys[randomIndex] === othersCountry[j].code) {
                    flag = true;
                    break;
                }
            }
        } while (countryKeys[randomIndex] === myCountry.code || flag);

       
        let code = countryKeys[randomIndex];
        othersCountry.push(new Country(allCountries[code], code));
    }

    //display the countries in the monitor
    document.getElementById("flag").src = myCountry.flagUrl;

    //options
    othersCountry.push(myCountry);
    shuffle(othersCountry);
    for(let i=0; i<4;i++){
        document.getElementById(String(i+1)).innerHTML = othersCountry[i].name;
        if(othersCountry[i].name == myCountry.name) correctID = i+1;
    }

}


function shuffle(array) {
    let currentIndex = array.length;
  
    while (currentIndex != 0) {
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

function checkGameOver(){
    if(wronged+score == totalScore) return true;

    return false;
}

/* FINISH GAME*/

function gameOver(){
    //stop intervals and remove el
    clearInterval(timeInterval);
    let flagButtons = document.getElementsByClassName("flag-button");
    for(let i=0; i<flagButtons.length;i++) flagButtons[i].removeEventListener("click",selectedFlag);

    //show a result page and remove old layout
    document.getElementsByClassName("game-container")[0].style.display = "none";
    document.getElementsByClassName("result-container")[0].style.display = "flex";
	
	if (score == totalScore){
		document.getElementsByClassName("res-comment")[0].getElementsByTagName("h2")[0].innerHTML = "Perfect 👌";
	}else if (score >= totalScore/1.25){
		document.getElementsByClassName("res-comment")[0].getElementsByTagName("h2")[0].innerHTML = "Very Good 👍";
	}else if (score < totalScore/1.25 && score >= totalScore/2){
		document.getElementsByClassName("res-comment")[0].getElementsByTagName("h2")[0].innerHTML = "Good 👍";
	}else if (score < totalScore/2 && score >= totalScore/2.75){
		document.getElementsByClassName("res-comment")[0].getElementsByTagName("h2")[0].innerHTML = "Bad 👎";
	}else{
		document.getElementsByClassName("res-comment")[0].getElementsByTagName("h2")[0].innerHTML = "Very Bad 👎";
	}
	
    document.getElementById("resultsArea").innerHTML = "Results : "+score+"/"+totalScore;

    document.getElementById("newgames-button").addEventListener("click",function(){
        location.reload();
    })
}


