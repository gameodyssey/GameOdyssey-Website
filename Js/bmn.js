const bmnTrailerBtnEl = document.querySelector(".bmnTrailerBtn");
const bmnTrailerVideoEl = document.querySelector(".videobmn");

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

bmnTrailerBtnEl.addEventListener("click", () =>{
    bmnTrailerBtnEl.style.visibility = 'hidden';
    bmnTrailerVideoEl.setAttribute("controls","controls");
    bmnTrailerVideoEl.play();
});

bmnTrailerBtnEl.addEventListener("mouseover", ()=>{
    bmnTrailerBtnEl.style.backgroundImage = "url(../Images/BMN_Play_H.png)";
});

bmnTrailerBtnEl.addEventListener("mouseout", ()=>{
    bmnTrailerBtnEl.style.backgroundImage = "url(../Images/BMN_Play.png)";
});

bmnTrailerVideoEl.addEventListener("pause", ()=>{

    bmnTrailerBtnEl.style.visibility = 'visible';
});
bmnTrailerVideoEl.addEventListener("play", ()=>{

    bmnTrailerBtnEl.style.visibility = 'hidden';
});

bmnTrailerVideoEl.addEventListener("ended", ()=>{

    bmnTrailerBtnEl.style.visibility = 'visible';
    bmnTrailerVideoEl.removeAttribute("controls");
    bmnTrailerVideoEl.currentTime = 0;
});

