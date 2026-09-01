const bdTrailerBtnEl = document.querySelector(".bdTrailerBtn");
const bdTrailerVideoEl = document.querySelector(".videobd");

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

bdTrailerBtnEl.addEventListener("click", () =>{
    bdTrailerBtnEl.style.visibility = 'hidden';
    bdTrailerVideoEl.setAttribute("controls","controls");
    bdTrailerVideoEl.play();
});

bdTrailerBtnEl.addEventListener("mouseover", ()=>{
    bdTrailerBtnEl.style.backgroundImage = "url(../Images/BD_Play_H.png)";
});

bdTrailerBtnEl.addEventListener("mouseout", ()=>{
    bdTrailerBtnEl.style.backgroundImage = "url(../Images/BD_Play.png)";
});

bdTrailerVideoEl.addEventListener("pause", ()=>{

    bdTrailerBtnEl.style.visibility = 'visible';
});
bdTrailerVideoEl.addEventListener("play", ()=>{

    bdTrailerBtnEl.style.visibility = 'hidden';
});

bdTrailerVideoEl.addEventListener("ended", ()=>{

    bdTrailerBtnEl.style.visibility = 'visible';
    bdTrailerVideoEl.removeAttribute("controls");
    bdTrailerVideoEl.currentTime = 0;
});

