const vtTrailerBtnEl = document.querySelector(".vtTrailerBtn");
const bgTrailerVideoEl = document.querySelector(".videovt");
const fbBtnEl = document.querySelector(".fb");
const googleBtnEl = document.querySelector(".google");
const twitterBtnEl = document.querySelector(".twitter");

fbBtnEl.addEventListener("click", ()=>{
    window.open('https://www.facebook.com/games/','_blank');
});
googleBtnEl.addEventListener("click", ()=>{
    window.open('https://play.google.com/store/games','_blank');
});
twitterBtnEl.addEventListener("click", ()=>{
    window.open('https://twitter.com','_blank');
});
vtTrailerBtnEl.addEventListener("click", () =>{
    vtTrailerBtnEl.style.visibility = 'hidden';
    bgTrailerVideoEl.setAttribute("controls","controls");
    bgTrailerVideoEl.play();
});

vtTrailerBtnEl.addEventListener("mouseover", ()=>{
    vtTrailerBtnEl.style.backgroundImage = "url(../Images/VType_Play_H.png)";
});

vtTrailerBtnEl.addEventListener("mouseout", ()=>{
    vtTrailerBtnEl.style.backgroundImage = "url(../Images/VType_Play.png)";
});

bgTrailerVideoEl.addEventListener("pause", ()=>{

    vtTrailerBtnEl.style.visibility = 'visible';
});
bgTrailerVideoEl.addEventListener("play", ()=>{

    vtTrailerBtnEl.style.visibility = 'hidden';
});

bgTrailerVideoEl.addEventListener("ended", ()=>{

    vtTrailerBtnEl.style.visibility = 'visible';
    bgTrailerVideoEl.removeAttribute("controls");
    bgTrailerVideoEl.currentTime = 0;
});

