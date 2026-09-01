const bgTrailerBtnEl = document.querySelector(".bgTrailerBtn");
const bgTrailerVideoEl = document.querySelector(".videobg");
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
bgTrailerBtnEl.addEventListener("click", () =>{
    bgTrailerBtnEl.style.visibility = 'hidden';
    bgTrailerVideoEl.setAttribute("controls","controls");
    bgTrailerVideoEl.play();
});

bgTrailerBtnEl.addEventListener("mouseover", ()=>{
    bgTrailerBtnEl.style.backgroundImage = "url(../Images/BG_Play_H.png)";
});

bgTrailerBtnEl.addEventListener("mouseout", ()=>{
    bgTrailerBtnEl.style.backgroundImage = "url(../Images/BG_Play.png)";
});

bgTrailerVideoEl.addEventListener("pause", ()=>{

    bgTrailerBtnEl.style.visibility = 'visible';
});
bgTrailerVideoEl.addEventListener("play", ()=>{

    bgTrailerBtnEl.style.visibility = 'hidden';
});

bgTrailerVideoEl.addEventListener("ended", ()=>{

    bgTrailerBtnEl.style.visibility = 'visible';
    bgTrailerVideoEl.removeAttribute("controls");
    bgTrailerVideoEl.currentTime = 0;
});

